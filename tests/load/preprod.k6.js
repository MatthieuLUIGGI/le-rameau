import http from 'k6/http';
import encoding from 'k6/encoding';
import exec from 'k6/execution';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { buildReport } from './report.mjs';

const PREPROD = 'https://le-rameau-git-preprod-matthieuluiggis-projects.vercel.app';
function loadConfiguration() {
  let contents;
  try {
    contents = open(__ENV.K6_CONFIG_FILE || './config.local.json');
  } catch (_) {
    if (__ENV.K6_CONFIG_FILE) {
      throw new Error('Le fichier indique par K6_CONFIG_FILE est introuvable ou illisible.');
    }
    return {};
  }
  try {
    const parsed = JSON.parse(contents.replace(/^\uFEFF/, ''));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch (_) {
    // JSON parser errors can include excerpts of the credentials: never forward them.
    throw new Error('JSON invalide dans la configuration k6. Verifier les virgules, les guillemets et les champs du modele.');
  }
}
const config = loadConfiguration();
const BASE_URL = (__ENV.BASE_URL || PREPROD).replace(/\/$/, '');
const SUPABASE_URL = (__ENV.SUPABASE_URL || config.supabaseUrl || '').replace(/\/$/, '');
const API_KEY = __ENV.SUPABASE_ANON_KEY || config.supabaseAnonKey || '';
const accounts = __ENV.K6_ACCOUNTS_JSON ? JSON.parse(__ENV.K6_ACCOUNTS_JSON) : config.accounts || [];
const SHARED = __ENV.ALLOW_SHARED_ACCOUNTS
  ? __ENV.ALLOW_SHARED_ACCOUNTS === '1'
  : config.allowSharedAccounts === true;
const PROFILE = __ENV.PROFILE || 'smoke';
// Local fixtures verify the script, never the performance of the deployed application.
const FIXTURE = __ENV.K6_LOCAL_FIXTURE === '1';
const profiles = {
  smoke: {
    maxVus: 1, duration: 'Un parcours complet, au maximum 60 secondes',
    scenario: { executor: 'per-vu-iterations', vus: 1, iterations: 1, maxDuration: '60s' },
  },
  demo: {
    maxVus: 5, duration: '75 secondes, plus 30 secondes maximum de fin de parcours',
    stages: [
      { duration: '15s', target: 5 }, { duration: '45s', target: 5 }, { duration: '15s', target: 0 },
    ],
  },
  load: {
    maxVus: 30, duration: '4 min 45 s, plus 30 secondes maximum de fin de parcours',
    stages: [
      { duration: '30s', target: 5 }, { duration: '45s', target: 5 },
      { duration: '30s', target: 15 }, { duration: '60s', target: 15 },
      { duration: '30s', target: 30 }, { duration: '60s', target: 30 },
      { duration: '30s', target: 0 },
    ],
  },
};
if (!profiles[PROFILE]) throw new Error('PROFILE doit valoir smoke, demo ou load.');
const plan = profiles[PROFILE];
const operations = [
  'page_accueil', 'profil', 'notifications', 'page_actualites', 'actualites', 'page_article',
  'article', 'page_documents', 'documents', 'page_consultations', 'consultations', 'votes_logement',
];
const thresholds = {
  'http_req_failed{phase:mesure}': ['rate<0.01'],
  'http_req_duration{phase:mesure}': ['p(90)<800', 'p(95)<1200'],
  'http_req_duration{phase:mesure,operation:document_fichier}': ['p(95)<1200'],
  parcours_reussi: ['rate>=0.99'], parcours_termines: ['count>0'],
  documents_valides: ['count>0'],
  clients_actifs: [`max>=${plan.maxVus}`],
};
for (const operation of operations) {
  thresholds[`http_req_duration{phase:mesure,operation:${operation}}`] = ['p(95)<1200'];
  thresholds[`http_reqs{phase:mesure,operation:${operation}}`] = ['count>0'];
}
if (PROFILE === 'load') {
  for (const palier of ['palier_5', 'palier_15', 'palier_30']) {
    thresholds[`http_req_duration{phase:mesure,palier:${palier}}`] = ['p(95)<1200'];
    thresholds[`http_reqs{phase:mesure,palier:${palier}}`] = ['count>0'];
  }
}
export const options = {
  scenarios: {
    residents: plan.scenario || {
      executor: 'ramping-vus', startVUs: 0, stages: plan.stages,
      gracefulRampDown: '30s', gracefulStop: '30s',
    },
  },
  setupTimeout: '5m', thresholds,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
  // Keep user IDs and query strings out of metric labels in exported reports.
  systemTags: ['status', 'method', 'name', 'scenario', 'group', 'check', 'expected_response'],
};
const journeySuccess = new Rate('parcours_reussi');
const journeys = new Counter('parcours_termines');
const activeClients = new Trend('clients_actifs');
const journeyDuration = new Trend('duree_parcours_avec_pauses', true);
const scenarioStart = new Trend('debut_scenario_epoch_ms');
const documentReads = new Counter('documents_valides');
const storageReads = new Counter('fichiers_storage_valides');
const inlineReads = new Counter('fichiers_integres_valides');
const incidents = new Counter('incidents_metier');
const bypassSecret = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET || config.vercelAutomationBypassSecret;
const bypass = bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {};

function stop(message) { exec.test.abort(message); }

function validateConfiguration() {
  const local = (url) => /^http:\/\/127\.0\.0\.1:\d+$/.test(url);
  if (!(FIXTURE && local(BASE_URL)) && BASE_URL !== PREPROD) {
    stop('Cible refusee : utiliser uniquement l URL de branche preprod configuree dans ce script.');
  }
  if (!(FIXTURE && local(SUPABASE_URL)) && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL)) {
    stop('Renseigner supabaseUrl dans tests/load/config.local.json (URL du projet Supabase).');
  }
  if (!API_KEY || API_KEY.startsWith('sb_secret_')) {
    stop('Renseigner la cle publique anon/publishable Supabase, jamais une cle service_role.');
  }
  if (API_KEY.split('.').length === 3) {
    let role;
    try { role = JSON.parse(encoding.b64decode(API_KEY.split('.')[1], 'rawurl', 's')).role; }
    catch (_) { stop('La cle publique Supabase est invalide.'); }
    if (role === 'service_role') stop('Cle service_role interdite : conserver les droits d un resident.');
  }
  if (!Array.isArray(accounts) || !accounts.length || accounts.length > 30
      || accounts.some((account) => !account.email || !account.password)) {
    stop('Configurer entre 1 et 30 comptes residents de test existants avec email et password.');
  }
  const emails = accounts.map((account) => account.email.trim().toLowerCase());
  if (new Set(emails).size !== emails.length) stop('La liste contient des comptes en double.');
  if (accounts.length < plan.maxVus && !SHARED) {
    stop(`Ce mode demande ${plan.maxVus} comptes distincts. Pour des comptes partages, activer explicitement allowSharedAccounts dans la configuration.`);
  }
}

function tagsFor(operation, phase) {
  let palier = 'preparation';
  if (phase === 'mesure') {
    const seconds = (Date.now() - exec.scenario.startTime) / 1000;
    palier = PROFILE;
    if (PROFILE === 'load') {
      palier = seconds >= 30 && seconds < 75 ? 'palier_5'
        : seconds >= 105 && seconds < 165 ? 'palier_15'
          : seconds >= 195 && seconds < 255 ? 'palier_30' : 'transition';
    }
  }
  return { operation, phase, palier, name: operation };
}

function params(operation, phase, headers = {}) {
  return { headers, tags: tagsFor(operation, phase), redirects: 0, timeout: '15s' };
}

function validateResponse(ok, operation, phase, status) {
  check(ok, { [`${operation} : statut et contenu attendus`]: (value) => value }, { phase });
  if (!ok) {
    if (phase === 'preparation') stop(`Verification initiale en echec : ${operation}, statut ${status}. Verifier les comptes, les donnees et la protection Vercel.`);
    incidents.add(1, { operation, status: String(status) });
  }
  return ok;
}

function readJson(path, operation, session, validator, phase) {
  const response = http.get(`${SUPABASE_URL}/rest/v1/${path}`, params(operation, phase, {
    apikey: API_KEY, Authorization: `Bearer ${session.access_token}`, Accept: 'application/json',
  }));
  let data = null;
  try { data = response.json(); } catch (_) { /* A login/error HTML page is not JSON. */ }
  const ok = response.status === 200 && !!data && validator(data);
  validateResponse(ok, operation, phase, response.status);
  return { ok, data: ok ? data : null };
}

// Same session encoding and chunk size as @supabase/ssr 0.8.0 in this project.
function installSession(session) {
  const ref = SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0].split(':')[0];
  const name = `sb-${ref}-auth-token`;
  const value = `base64-${encoding.b64encode(JSON.stringify(session), 'rawurl')}`;
  const jar = http.cookieJar();
  const chunks = Math.ceil(value.length / 3180);
  for (let index = 0; index < chunks; index++) {
    jar.set(BASE_URL, chunks === 1 ? name : `${name}.${index}`, value.slice(index * 3180, (index + 1) * 3180), {
      path: '/', secure: !FIXTURE,
    });
  }
}

function readPage(path, operation, phase) {
  const response = http.get(`${BASE_URL}${path}`, params(operation, phase, { ...bypass, Accept: 'text/html' }));
  if (phase === 'preparation' && response.status >= 300 && response.status < 400
      && /^https:\/\/(?:www\.)?vercel\.com\/sso-api(?:[/?]|$)/.test(response.headers.Location || '')) {
    stop('Protection Vercel active : renseigner vercelAutomationBypassSecret dans config.local.json avec le secret Protection Bypass for Automation du projet.');
  }
  // These pages initially return an app shell; their data is checked separately below.
  const ok = response.status === 200 && String(response.headers['Content-Type'] || '').includes('text/html')
    && typeof response.body === 'string' && response.body.includes('<main')
    && response.body.includes('Le Rameau') && !response.body.includes('Bon retour');
  return validateResponse(ok, operation, phase, response.status);
}

function ownProfile(session, phase) {
  return readJson(`profiles?select=*&id=eq.${encodeURIComponent(session.user.id)}`, 'profil', session,
    (rows) => Array.isArray(rows) && rows.length === 1 && rows[0].id === session.user.id
      && rows[0].role === 'membre' && typeof rows[0].appartement === 'string' && rows[0].appartement.trim().length > 0, phase);
}

function news(session, phase) {
  const filter = encodeURIComponent(`(date_expiration.is.null,date_expiration.gt.${new Date().toISOString()})`);
  return readJson(`actualites?select=*&order=created_at.desc&or=${filter}`, 'actualites', session,
    (rows) => Array.isArray(rows) && rows.length > 0 && rows.every((row) => row.id && typeof row.titre === 'string'
      && (!row.date_expiration || new Date(row.date_expiration).getTime() > Date.now())), phase);
}

function readableDocument(row) {
  if (row.type !== 'file' || typeof row.url !== 'string') return false;
  return /^data:(?:application\/pdf|image\/(?:png|jpeg|gif|webp));base64,/.test(row.url)
    || row.url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/ag-fichiers/`);
}

function documents(session, phase) {
  return readJson('assemblee_generale?select=*&order=position.asc', 'documents', session,
    (rows) => Array.isArray(rows) && rows.some(readableDocument), phase);
}

function hasDocumentSignature(bytes, mime) {
  const first = (length) => String.fromCharCode(...bytes.slice(0, length));
  const allowedTypes = [];
  if (bytes.length >= 5 && first(5) === '%PDF-') allowedTypes.push('application/pdf');
  if (bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index])) {
    allowedTypes.push('image/png');
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) allowedTypes.push('image/jpeg');
  if (bytes.length >= 6 && (first(6) === 'GIF87a' || first(6) === 'GIF89a')) allowedTypes.push('image/gif');
  if (bytes.length >= 12 && first(4) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') allowedTypes.push('image/webp');
  return allowedTypes.length > 0 && (allowedTypes.includes(mime) || mime === 'application/octet-stream');
}

function readDocument(document, phase) {
  let ok = false;
  let embedded = false;
  if (document.url.startsWith('data:')) {
    // An embedded file was already transferred in the PostgREST response.
    embedded = true;
    try {
      const comma = document.url.indexOf(',');
      const mime = document.url.slice(5, document.url.indexOf(';'));
      const bytes = new Uint8Array(encoding.b64decode(document.url.slice(comma + 1), 'std'));
      ok = hasDocumentSignature(bytes, mime);
    } catch (_) { /* Invalid base64 is not a valid attachment. */ }
    validateResponse(ok, 'document_fichier', phase, 200);
  } else if (document.url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/ag-fichiers/`)) {
    // Same public Storage GET as openBase64Pdf(), without sending any Vercel secret.
    const response = http.get(document.url, {
      ...params('document_fichier', phase, { Accept: 'application/pdf,image/*' }), responseType: 'binary',
    });
    const bytes = response.body instanceof ArrayBuffer ? new Uint8Array(response.body) : new Uint8Array(0);
    const mime = String(response.headers['Content-Type'] || '').split(';')[0].trim().toLowerCase();
    ok = response.status === 200 && hasDocumentSignature(bytes, mime);
    validateResponse(ok, 'document_fichier', phase, response.status);
  }
  if (ok && phase === 'mesure') {
    documentReads.add(1);
    if (embedded) inlineReads.add(1);
    else storageReads.add(1);
  }
  return ok;
}

function consultations(session, phase) {
  return readJson('consultations?select=*&statut=eq.actif&order=created_at.desc', 'consultations', session,
    (rows) => Array.isArray(rows) && rows.length > 0 && rows.every((row) => row.id
      && typeof row.question === 'string' && row.statut === 'actif' && Array.isArray(row.options)), phase);
}

export function setup() {
  validateConfiguration();
  console.log(`Le Rameau / ${PROFILE} / ${plan.maxVus} clients maximum / ${Math.min(accounts.length, plan.maxVus)} comptes distincts.`);
  if (accounts.length < plan.maxVus) console.warn('COMPTES PARTAGES : ce test ne represente pas autant de residents distincts que de clients virtuels.');
  const sessions = [];
  for (const account of accounts.slice(0, plan.maxVus)) {
    const response = http.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: account.email, password: account.password }),
      params('connexion_initiale', 'preparation', { apikey: API_KEY, 'Content-Type': 'application/json' }));
    let session;
    try { session = response.json(); } catch (_) { /* Never print credential-bearing responses. */ }
    if (response.status !== 200 || !session?.access_token || !session.refresh_token || !session.user?.id) {
      stop(`Connexion initiale refusee (statut ${response.status}). Verifier le compte resident et sa confirmation email.`);
    }
    session.expires_at = session.expires_at || Math.floor(Date.now() / 1000) + Number(session.expires_in || 0);
    if (!(session.expires_at > Date.now() / 1000 + 900)) stop('Le jeton doit rester valide au moins 15 minutes.');
    const profile = ownProfile(session, 'preparation');
    sessions.push({ session, appartement: profile.data[0].appartement });
    if (!FIXTURE) sleep(0.25);
  }
  installSession(sessions[0].session);
  readPage('/accueil', 'page_accueil', 'preparation');
  news(sessions[0].session, 'preparation');
  const docs = documents(sessions[0].session, 'preparation');
  readDocument(docs.data.find(readableDocument), 'preparation');
  consultations(sessions[0].session, 'preparation');
  return sessions;
}

function pause() { if (!FIXTURE) sleep(2 + Math.random() * 3); }

export default function (sessions) {
  const startedAt = Date.now();
  const account = sessions[(exec.vu.idInTest - 1) % sessions.length];
  const session = account.session;
  if (session.expires_at < Date.now() / 1000 + 60) stop('Session proche de son expiration : relancer le test.');
  installSession(session);
  scenarioStart.add(exec.scenario.startTime);
  activeClients.add(exec.instance.vusActive);
  const phase = 'mesure';
  let ok = readPage('/accueil', 'page_accueil', phase);
  ok = ownProfile(session, phase).ok && ok;
  ok = readJson('notifications?select=*&order=created_at.desc&limit=20', 'notifications', session,
    (rows) => Array.isArray(rows) && rows.every((row) => row.id && typeof row.title === 'string'), phase).ok && ok;
  pause();
  ok = readPage('/actualites', 'page_actualites', phase) && ok;
  const list = news(session, phase);
  ok = list.ok && ok;
  if (list.ok) {
    const article = list.data[exec.scenario.iterationInTest % list.data.length];
    ok = readPage(`/actualites/${article.id}`, 'page_article', phase) && ok;
    ok = readJson(`actualites?select=*&id=eq.${encodeURIComponent(article.id)}`, 'article', session,
      (rows) => Array.isArray(rows) && rows.length === 1 && rows[0].id === article.id
        && typeof rows[0].contenu === 'string', phase).ok && ok;
  }
  pause();
  ok = readPage('/ag', 'page_documents', phase) && ok;
  const docs = documents(session, phase);
  ok = docs.ok && ok;
  if (docs.ok) {
    const files = docs.data.filter(readableDocument);
    ok = readDocument(files[exec.scenario.iterationInTest % files.length], phase) && ok;
  }
  pause();
  ok = readPage('/consultations', 'page_consultations', phase) && ok;
  ok = consultations(session, phase).ok && ok;
  ok = readJson(`consultation_votes?select=consultation_id,option_id&appartement=eq.${encodeURIComponent(account.appartement)}`,
    'votes_logement', session, (rows) => Array.isArray(rows)
      && rows.every((row) => row.consultation_id && row.option_id), phase).ok && ok;
  pause();
  journeys.add(1);
  journeySuccess.add(ok);
  journeyDuration.add(Date.now() - startedAt);
}

export function handleSummary(data) {
  const prefix = __ENV.REPORT_PREFIX || `tests/load/results/preprod-${PROFILE}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const report = buildReport(data, {
    date: new Date().toISOString(), url: BASE_URL, profile: PROFILE,
    maxVus: plan.maxVus, accounts: Math.min(accounts.length, plan.maxVus),
    shared: accounts.length < plan.maxVus, duration: plan.duration,
    plannedSeconds: PROFILE === 'load' ? 285 : PROFILE === 'demo' ? 75 : 0,
    elapsedSeconds: data.metrics?.debut_scenario_epoch_ms?.values?.min
      ? (Date.now() - data.metrics.debut_scenario_epoch_ms.values.min) / 1000 : 0,
    stages: plan.stages || [], fixture: FIXTURE,
    k6: __ENV.K6_VERSION || 'Voir k6 version dans le terminal',
    localCommit: __ENV.K6_LOCAL_COMMIT || 'Non renseigne (revision deployee a relever dans Vercel)',
  });
  return { stdout: report.text, [`${prefix}.json`]: report.json, [`${prefix}.html`]: report.html };
}
