const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function buildReport(data, metadata) {
  const metrics = data.metrics || {};
  const value = (name, key) => metrics[name]?.values?.[key];
  const format = (number, suffix = '') => Number.isFinite(number) ? `${number.toFixed(2)}${suffix}` : 'Non mesure';
  const checks = Object.entries(metrics).flatMap(([metric, result]) =>
    Object.entries(result.thresholds || {}).map(([rule, status]) => ({ metric, rule, ok: status.ok })));
  const collectChecks = (group) => [
    ...(group?.checks || []).map(({ name, passes, fails }) => ({ name, passes, fails })),
    ...(group?.groups || []).flatMap(collectChecks),
  ];
  const businessChecks = collectChecks(data.root_group);
  const complete = value('parcours_termines', 'count') > 0
    && metadata.elapsedSeconds + 0.5 >= (metadata.plannedSeconds || 0);
  const passed = complete && checks.length > 0 && checks.every((rule) => rule.ok)
    && value('parcours_termines', 'count') > 0;
  const status = metadata.fixture ? 'VERIFICATION LOCALE DU SCRIPT - PAS UN RESULTAT DE PREPRODUCTION'
    : passed ? 'OBJECTIFS ATTEINTS SUR LE PERIMETRE TESTE' : 'OBJECTIFS NON ATTEINTS OU TEST INCOMPLET';
  // Export only aggregates: k6 setup_data contains real sessions and must never be saved.
  const safeReport = { metadata, status, complete, passed, thresholds: checks, businessChecks, metrics };
  const rows = Object.entries(metrics)
    .filter(([name]) => name.startsWith('http_req_duration{') && name.includes('phase:mesure'))
    .map(([name, metric]) => `<tr><td>${escapeHtml(name.replace('http_req_duration', 'HTTP'))}</td><td>${format(metric.values.avg)}</td><td>${format(metric.values['p(95)'])}</td><td>${format(metric.values.max)}</td></tr>`)
    .join('');
  const limitations = [
    'Parcours HTTP authentifies et requetes Supabase reproduites depuis le code du projet. Le rendu JavaScript, les images de l interface, les feuilles de style et les abonnements temps reel ne sont pas mesures. Les pieces jointes ouvertes dans le parcours sont mesurees separement.',
    'Les connexions sont preparees une fois par compte, avant la charge. Le test ne mesure pas une vague de connexions simultanees.',
    'Les pieces jointes (PDF et images PNG, JPEG, GIF ou WebP) du bucket public ag-fichiers sont telechargees depuis Supabase Storage. Leur signature et leur type MIME sont controles, sans analyse complete du format. Le temps du GET est mesure sous document_fichier. Pour les fichiers integres en base64, le transfert est inclus dans la reponse PostgREST. Aucun lien externe n est charge.',
    'Aucun vote, document ou profil n est cree ou modifie. L authentification cree cependant des sessions et peut mettre a jour les journaux et la derniere connexion Supabase.',
    'La base Supabase est partagee avec le deploiement de production actuel. Les requetes API la sollicitent directement, comme le navigateur de l application.',
    'Un resultat positif a 30 clients ne determine pas la capacite maximale ni le seuil de rupture. CPU, memoire et metriques serveur sont a relever dans Vercel et Supabase.',
    'Les seuils sont des objectifs definis avant mesure, pas des performances garanties. La revision locale ne prouve pas la revision deployee : relever aussi le deployment et son commit dans Vercel.',
  ];
  if (metadata.shared) limitations.unshift(`${metadata.maxVus} clients virtuels partagent ${metadata.accounts} comptes et sessions. Ce resultat ne represente pas ${metadata.maxVus} residents distincts.`);
  const text = `\nLE RAMEAU - ${status}\nProfil : ${metadata.profile} | clients prevus : ${metadata.maxVus} | comptes : ${metadata.accounts}\nCible : ${metadata.url}\nParcours termines : ${value('parcours_termines', 'count') || 0}\nParcours reussis : ${format(value('parcours_reussi', 'rate') * 100, ' %')}\nHTTP p95 : ${format(value('http_req_duration{phase:mesure}', 'p(95)'), ' ms')}\n${complete ? '' : 'DUREE DE CHARGE INCOMPLETE\n'}${checks.filter((rule) => !rule.ok).map((rule) => `ECHEC : ${rule.metric} / ${rule.rule}`).join('\n')}\nRapports HTML et JSON enregistres.\n`;
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Le Rameau - rapport k6</title>
<style>body{font:15px/1.5 Arial,sans-serif;margin:30px auto;padding:0 20px;max-width:1150px;color:#18202b}h1{font-size:26px}h2{font-size:20px;margin-top:30px}.status{border-left:6px solid ${passed && !metadata.fixture ? '#16803d' : '#b45309'};padding:12px;background:#f2f4f6}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:9px;border:1px solid #ccd3db;text-align:left;overflow-wrap:anywhere}th{background:#edf1f4}dt{font-weight:bold}dd{margin:0 0 8px}li{margin:8px 0}@media print{@page{size:A4 portrait;margin:15mm}body{font-size:10pt;margin:0;padding:0}tr{break-inside:avoid}h2{break-after:avoid}}</style>
<h1>Le Rameau - test de charge authentifie</h1><p class="status">${escapeHtml(status)}</p>
<dl>${Object.entries(metadata).map(([key, entry]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(typeof entry === 'object' ? JSON.stringify(entry) : entry)}</dd>`).join('')}</dl>
<h2>Indicateurs observes</h2><p>Duree de charge complete : ${complete ? 'Oui' : 'Non'}. Parcours termines : ${value('parcours_termines', 'count') || 0}. Reussite : ${format(value('parcours_reussi', 'rate') * 100, ' %')}. Maximum de clients actifs observe : ${format(value('clients_actifs', 'max'))}. Documents valides : ${value('documents_valides', 'count') || 0} (Storage : ${value('fichiers_storage_valides', 'count') || 0}, integres : ${value('fichiers_integres_valides', 'count') || 0}). Erreurs HTTP : ${format(value('http_req_failed{phase:mesure}', 'rate') * 100, ' %')}. Volume recu total (preparation incluse) : ${format(value('data_received', 'count') / 1048576, ' Mo')}.</p>
<h2>Temps de reponse par operation et par palier</h2><p>Temps HTTP en millisecondes, hors pauses de lecture et preparation des connexions. Un palier est une fenetre de stabilisation dans le planning, pas une mesure de capacite maximale.</p><table><thead><tr><th>Operation / palier</th><th>Moyenne</th><th>p95</th><th>Maximum</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Seuils definis avant execution</h2><p>Moins de 1 % d erreurs HTTP ; p90 HTTP inferieur a 800 ms et p95 inferieur a 1 200 ms ; au moins 99 % de parcours reussis. Chaque operation doit etre mesuree. Le nombre cible de clients doit avoir ete atteint.</p><table><thead><tr><th>Mesure</th><th>Objectif</th><th>Resultat</th></tr></thead><tbody>${checks.map((rule) => `<tr><td>${escapeHtml(rule.metric)}</td><td>${escapeHtml(rule.rule)}</td><td>${rule.ok ? 'Atteint' : 'Non atteint'}</td></tr>`).join('')}</tbody></table>
<h2>Controles de contenu (preparation et charge)</h2><table><thead><tr><th>Controle</th><th>Succes</th><th>Echecs</th></tr></thead><tbody>${businessChecks.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.passes}</td><td>${item.fails}</td></tr>`).join('')}</tbody></table>
<h2>Perimetre et limites</h2><ul>${limitations.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
<h2>Interpretation et observations a completer</h2><p>Relever le deploiement Vercel teste, sa revision Git, le lieu de la machine, la connexion reseau et les indicateurs Vercel/Supabase. Comparer les p95 des paliers 5, 15 et 30. Pour chaque objectif non atteint, identifier l operation, observer les journaux et documenter la correction puis un nouveau test comparable. Une absence de mesure ne constitue pas une reussite.</p></html>`;
  return { html, json: JSON.stringify(safeReport, null, 2), text };
}
