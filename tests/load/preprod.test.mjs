import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildReport } from './report.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const k6 = process.env.K6_BINARY || 'k6';
const fakeAccount = { email: 'resident@example.invalid', password: 'fictitious-test-password' };
const token = 'synthetic-access-token';
const bypassToken = 'synthetic-vercel-bypass-secret';

async function runFixture(mode, overrides = {}, configurationMode) {
  const requests = [];
  let cookieValid = false;
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    requests.push({ method: request.method, path: url.pathname, query: url.searchParams.toString() });
    const send = (value, status = 200, type = 'application/json') => {
      response.writeHead(status, { 'Content-Type': type });
      response.end(type === 'application/json' ? JSON.stringify(value) : value);
    };
    if (url.pathname === '/auth/v1/token') {
      assert.equal(request.headers['x-vercel-protection-bypass'], undefined);
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), fakeAccount);
      return send({
        access_token: token, refresh_token: 'synthetic-refresh-token', expires_in: 3600,
        user: { id: 'fixture-user', email: fakeAccount.email, user_metadata: { description: 'R\u00e9sidence '.repeat(700) } },
      });
    }
    if (url.pathname.startsWith('/rest/')) {
      assert.equal(request.headers['x-vercel-protection-bypass'], undefined);
      assert.equal(request.headers.authorization, `Bearer ${token}`);
      const table = url.pathname.split('/').at(-1);
      if (table === 'profiles') return send([{
        id: 'fixture-user', role: mode === 'admin' ? 'admin' : 'membre', appartement: '24',
      }]);
      if (table === 'actualites') return send(mode === 'empty' ? [] : [{
        id: 'fixture-article', titre: 'Travaux de residence', contenu: 'Informations aux residents', date_expiration: null,
      }]);
      if (table === 'assemblee_generale' && mode.startsWith('storage')) {
        return send([{ type: 'file', url: `http://${request.headers.host}/storage/v1/object/public/ag-fichiers/compte-rendu.pdf`, titre: 'Compte rendu' }]);
      }
      if (table === 'assemblee_generale' && mode === 'external-document') {
        return send([{ type: 'file', url: 'https://example.invalid/compte-rendu.pdf', titre: 'Lien externe' }]);
      }
      if (table === 'assemblee_generale') return send([{ type: 'file', url: 'data:application/pdf;base64,JVBERi0xLjcK', titre: 'Compte rendu' }]);
      if (table === 'consultations') return send([{ id: 'fixture-consultation', question: 'Choix du jardin', statut: 'actif', options: [] }]);
      if (table === 'consultation_votes') {
        assert.equal(url.searchParams.get('appartement'), 'eq.24');
        return mode === 'invalid-json' ? send('<html>Erreur</html>', 200, 'text/html') : send([]);
      }
      if (table === 'notifications') return send([]);
      return send({ error: 'Unexpected table' }, 404);
    }
    if (url.pathname.startsWith('/storage/v1/object/public/ag-fichiers/')) {
      assert.equal(request.headers['x-vercel-protection-bypass'], undefined);
      assert.equal(request.headers.authorization, undefined);
      assert.equal(request.headers.apikey, undefined);
      if (mode === 'storage-missing') return send({ error: 'Missing file' }, 404);
      if (mode === 'storage-html') return send('<html>Erreur de stockage</html>', 200, 'text/html');
      if (mode === 'storage-png') return send(Buffer.from('89504e470d0a1a0a00000000', 'hex'), 200, 'image/png');
      if (mode === 'storage-wrong-type') return send('%PDF-1.7\nPDF fixture\n%%EOF\n', 200, 'image/png');
      return send('%PDF-1.7\nPDF fixture\n%%EOF\n', 200, 'application/pdf');
    }
    if (mode === 'redirect' && url.pathname === '/actualites') {
      response.writeHead(307, { Location: '/login' });
      return response.end();
    }
    if (mode === 'vercel' && request.headers['x-vercel-protection-bypass'] !== bypassToken) {
      response.writeHead(302, { Location: 'https://vercel.com/sso-api?next=preprod' });
      return response.end();
    }
    if (url.pathname === '/login') return send('<html>Bon retour</html>', 200, 'text/html');
    const cookies = Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((piece) => {
      const index = piece.indexOf('=');
      return [piece.slice(0, index).trim(), piece.slice(index + 1)];
    }));
    const parts = Object.keys(cookies).filter((name) => name.startsWith('sb-127-auth-token')).sort();
    assert.ok(parts.length > 1, 'Long sessions must be chunked like Supabase SSR');
    const encoded = parts.map((name) => cookies[name]).join('').replace(/^base64-/, '');
    assert.equal(JSON.parse(Buffer.from(encoded, 'base64url').toString()).access_token, token);
    cookieValid = true;
    return send('<html><body>Le Rameau<main>Application</main></body></html>', 200, 'text/html');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rameau-k6-fixture-'));
  const prefix = path.join(directory, 'report');
  const localConfiguration = path.join(directory, 'config.local.json');
  const fixtureConfig = {
    supabaseUrl: origin, supabaseAnonKey: 'synthetic-public-key', accounts: [fakeAccount],
    allowSharedAccounts: true,
    ...(configurationMode === 'bypass' ? { vercelAutomationBypassSecret: bypassToken } : {}),
  };
  await fs.writeFile(localConfiguration, configurationMode === 'invalid'
    ? '{ "password": "not-for-logs", broken-json }'
    : '\uFEFF' + JSON.stringify(fixtureConfig));
  let entrypoint = 'tests/load/preprod.k6.js';
  if (configurationMode) {
    // Isolate the default-file check from real credentials already present in the workspace.
    entrypoint = path.join(directory, 'preprod.k6.js');
    await fs.copyFile(path.join(root, 'tests/load/preprod.k6.js'), entrypoint);
    await fs.copyFile(path.join(root, 'tests/load/report.mjs'), path.join(directory, 'report.mjs'));
  }
  try {
    const child = spawn(k6, ['run', '--quiet', entrypoint], {
      cwd: root,
      env: {
        ...process.env, PROFILE: 'smoke', K6_LOCAL_FIXTURE: '1',
        BASE_URL: origin, SUPABASE_URL: origin, SUPABASE_ANON_KEY: 'synthetic-public-key',
        K6_ACCOUNTS_JSON: JSON.stringify([fakeAccount]), K6_CONFIG_FILE: configurationMode ? '' : localConfiguration,
        ALLOW_SHARED_ACCOUNTS: '0', VERCEL_AUTOMATION_BYPASS_SECRET: '',
        REPORT_PREFIX: prefix, K6_NO_USAGE_REPORT: 'true',
        ...(configurationMode ? { SUPABASE_URL: '', SUPABASE_ANON_KEY: '', K6_ACCOUNTS_JSON: '' } : {}),
        ...overrides,
      },
      windowsHide: true,
    });
    let logs = '';
    child.stdout.on('data', (chunk) => { logs += chunk; });
    child.stderr.on('data', (chunk) => { logs += chunk; });
    const timer = setTimeout(() => child.kill(), 20000);
    const [code] = await once(child, 'exit');
    clearTimeout(timer);
    const json = await fs.readFile(`${prefix}.json`, 'utf8').catch(() => '{}');
    const html = await fs.readFile(`${prefix}.html`, 'utf8').catch(() => '');
    return { code, logs, requests, cookieValid, raw: json + html, report: JSON.parse(json), html };
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(directory, { recursive: true });
  }
}

test('authenticated read-only journey and secret-free reports', async () => {
  const result = await runFixture('valid');
  assert.equal(result.code, 0, result.logs);
  assert.equal(result.report.passed, true, result.logs);
  assert.equal(result.report.metrics.parcours_termines.values.count, 1);
  assert.equal(result.report.metrics.documents_valides.values.count, 1);
  assert.ok(result.html.includes('HTTP{'));
  assert.ok(result.report.businessChecks.some((item) => item.name.startsWith('votes_logement')));
  assert.ok(result.cookieValid);
  assert.match(result.html, /VERIFICATION LOCALE DU SCRIPT/);
  const writes = result.requests.filter((request) => request.method !== 'GET');
  assert.deepEqual(writes.map((request) => request.path), ['/auth/v1/token']);
  for (const secret of [fakeAccount.email, fakeAccount.password, token, 'synthetic-refresh-token', 'fixture-user']) {
    assert.ok(!result.raw.includes(secret), `The exported report must not contain ${secret}`);
  }
});

test('direct k6 command automatically loads the adjacent local configuration, including UTF-8 BOM', async () => {
  const result = await runFixture('valid', {}, 'default');
  assert.equal(result.code, 0, result.logs);
  assert.equal(result.report.passed, true, result.logs);
  assert.equal(result.report.metadata.accounts, 1);
  assert.ok(result.cookieValid);
});

test('invalid configuration does not print credentials from JSON parser errors', async () => {
  const result = await runFixture('valid', {}, 'invalid');
  assert.notEqual(result.code, 0);
  assert.match(result.logs, /JSON invalide/);
  assert.ok(!result.logs.includes('not-for-logs'));
  assert.equal(result.requests.length, 0);
});

test('Vercel redirects identify the missing automation secret', async () => {
  const result = await runFixture('vercel');
  assert.notEqual(result.code, 0);
  assert.match(result.logs, /Protection Vercel active/);
  assert.match(result.logs, /vercelAutomationBypassSecret/);
});

test('local bypass configuration is used only for Vercel pages and never exported', async () => {
  const result = await runFixture('vercel', {}, 'bypass');
  assert.equal(result.code, 0, result.logs);
  assert.equal(result.report.passed, true);
  assert.ok(!result.raw.includes(bypassToken));
});

test('Storage PDFs are actually downloaded and checked as binary responses', async () => {
  const result = await runFixture('storage');
  assert.equal(result.code, 0, result.logs);
  assert.equal(result.report.passed, true);
  assert.equal(result.report.metrics.fichiers_storage_valides.values.count, 1);
  assert.equal(result.report.metrics.documents_valides.values.count, 1);
  assert.equal(result.report.metrics['http_req_duration{phase:mesure,operation:document_fichier}'].type, 'trend');
  assert.equal(result.requests.filter((request) => request.path.startsWith('/storage/')).length, 2);
});

test('Storage HTTP 200 with HTML instead of a PDF aborts preparation', async () => {
  const result = await runFixture('storage-html');
  assert.notEqual(result.code, 0);
  assert.equal(result.report.passed, false);
  assert.match(result.logs, /document_fichier, statut 200/);
});

test('Storage missing files cannot pass the journey', async () => {
  const result = await runFixture('storage-missing');
  assert.notEqual(result.code, 0);
  assert.equal(result.report.passed, false);
  assert.match(result.logs, /document_fichier, statut 404/);
});

test('PNG attachments uploaded by the real form are valid documents', async () => {
  const result = await runFixture('storage-png');
  assert.equal(result.code, 0, result.logs);
  assert.equal(result.report.metrics.fichiers_storage_valides.values.count, 1);
});

test('a mismatched MIME type and file signature fails the attachment check', async () => {
  const result = await runFixture('storage-wrong-type');
  assert.notEqual(result.code, 0);
  assert.equal(result.report.passed, false);
  assert.match(result.logs, /document_fichier, statut 200/);
});

test('a third-party link does not replace an application document', async () => {
  const result = await runFixture('external-document');
  assert.notEqual(result.code, 0);
  assert.equal(result.report.passed, false);
  assert.match(result.logs, /documents, statut 200/);
});

test('HTTP 200 carrying an error HTML body fails the business journey', async () => {
  const result = await runFixture('invalid-json');
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.report.passed, false);
  assert.equal(result.report.metrics.parcours_reussi.values.rate, 0);
  assert.ok(result.report.businessChecks.some((item) => item.name.startsWith('votes_logement') && item.fails > 0));
});

test('protected page redirects are not silently followed', async () => {
  const result = await runFixture('redirect');
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.report.passed, false);
  assert.ok(!result.requests.some((request) => request.path === '/login'));
});

test('an empty dataset stops preparation instead of producing a passing load test', async () => {
  const result = await runFixture('empty');
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.report.passed, false);
  assert.ok(!result.requests.some((request) => request.path === '/ag'));
});

test('a privileged account cannot replace a resident', async () => {
  const result = await runFixture('admin');
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.report.passed, false);
});

test('production URLs are rejected before any network request', async () => {
  const result = await runFixture('valid', { BASE_URL: 'https://le-rameau.vercel.app' });
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.requests.length, 0);
});

test('load mode requires distinct accounts or explicit shared-account mode', async () => {
  const result = await runFixture('valid', { PROFILE: 'load' });
  assert.notEqual(result.code, 0, result.logs);
  assert.equal(result.requests.length, 0);
});

test('a report without measurements is never marked as passed', () => {
  const report = buildReport({ metrics: {}, setup_data: { access_token: token } }, {
    fixture: false, stages: [], shared: true, accounts: 1, maxVus: 30,
  });
  assert.equal(JSON.parse(report.json).passed, false);
  assert.ok(!report.json.includes(token));
  assert.match(report.html, /partagent 1 comptes/);
});

test('interrupted load cannot pass even if the partial sample meets thresholds', () => {
  const report = buildReport({ metrics: {
    parcours_termines: { values: { count: 10 }, thresholds: { 'count>0': { ok: true } } },
  } }, { fixture: false, shared: false, elapsedSeconds: 220, plannedSeconds: 285 });
  assert.equal(JSON.parse(report.json).passed, false);
  assert.match(report.text, /DUREE DE CHARGE INCOMPLETE/);
});

test('demo and load use the intended ramps and stable plateaus', () => {
  for (const [profile, targets, seconds] of [
    ['demo', [5, 5, 0], 75], ['load', [5, 5, 15, 15, 30, 30, 0], 285],
  ]) {
    const result = spawnSync(k6, ['inspect', '-e', `PROFILE=${profile}`, 'tests/load/preprod.k6.js'], {
      cwd: root, encoding: 'utf8', windowsHide: true,
      env: { ...process.env, PROFILE: profile, K6_CONFIG_FILE: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    const scenario = JSON.parse(result.stdout).scenarios.residents;
    assert.equal(scenario.executor, 'ramping-vus');
    assert.deepEqual(scenario.stages.map((stage) => stage.target), targets);
    const duration = (value) => {
      const match = value.match(/^(?:(\d+)m)?(\d+)s$/);
      return Number(match[1] || 0) * 60 + Number(match[2]);
    };
    assert.equal(scenario.stages.reduce((total, stage) => total + duration(stage.duration), 0), seconds);
  }
});
