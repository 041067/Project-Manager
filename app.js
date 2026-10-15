(() => {
const KEY = 'atlas-uat-v1';
const COLORS = ['#4f46e5', '#db2777', '#0891b2', '#ea580c', '#16a34a', '#9333ea'];
const TEAMS = [
  { id: 'backlog', name: 'Backlog', color: '#64748b', mail: null },
  { id: 'design', name: 'Design', color: '#db2777', mail: 'design@agencia.com' },
  { id: 'conteudo', name: 'Conteúdo', color: '#0891b2', mail: 'conteudo@agencia.com' },
  { id: 'midia', name: 'Mídia paga', color: '#ea580c', mail: 'midia@agencia.com' }
];
const PRIORITY = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
const VIEWS = {
  projects: ['Projetos', 'Etapa 1 — Criação de projetos e validação dos campos obrigatórios.'],
  tasks: ['Tarefas', 'Etapa 2 — Atribuição de tarefas por arrastar e soltar e notificações por e-mail.'],
  progress: ['Progresso', 'Etapa 3 — Relatórios de status e integração com ferramentas externas.'],
  nonfunc: ['Critérios não funcionais', 'Etapa 4 — Desempenho e controle de acesso a dados sensíveis.'],
  uat: ['Roteiro de aceitação', 'Etapa 5 — Registre aprovação ou reprovação de cada cenário e os problemas encontrados.']
};
const CASES = [
  ['Criação de projetos', 'c1', 'Abrir o projeto "Campanha de Lançamento 2025"', 'O projeto é criado e aparece na lista com prazo, orçamento e responsável.', 'projects'],
  ['Criação de projetos', 'c2', 'Campos obrigatórios são intuitivos', 'Campos marcados com *; enviar vazio destaca os campos e explica o erro.', 'projects'],
  ['Atribuição de tarefas', 'c3', 'Arrastar tarefa entre equipes', 'A tarefa muda de coluna sem erros e mantém seus dados.', 'tasks'],
  ['Atribuição de tarefas', 'c4', 'Notificação por e-mail disparada', 'Ao mover para uma equipe, surge um e-mail na caixa de saída.', 'tasks'],
  ['Atribuição de tarefas', 'c5', 'Classificar tarefa como "Urgente"', 'O campo prioridade deve oferecer a opção Urgente.', 'tasks'],
  ['Acompanhamento', 'c6', 'Relatório de status reflete os dados reais', 'Totais e percentuais conferem com as tarefas cadastradas.', 'progress'],
  ['Acompanhamento', 'c7', 'Integração com Google Drive', 'É possível conectar e anexar um arquivo a um projeto.', 'progress'],
  ['Acompanhamento', 'c8', 'Exportar horas trabalhadas para Excel', 'O relatório exporta em .xlsx, exigido pela contabilidade.', 'progress'],
  ['Não funcionais', 'c9', 'Velocidade de carregamento aceitável', 'Carregamento abaixo de 3 s, mesmo em home office.', 'nonfunc'],
  ['Não funcionais', 'c10', 'Dados sensíveis só para autorizados', 'Orçamento e cliente ficam ocultos para Designer e Redator.', 'nonfunc']
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = n => `<svg class="ic"><use href="#i-${n}"/></svg>`;
const uid = () => Math.random().toString(36).slice(2, 9);
const brl = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fdate = d => d ? d.split('-').reverse().join('/') : '—';
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function seed() {
  const p1 = uid(), p2 = uid();
  return {
    projects: [
      { id: p1, name: 'Rebranding Cliente Aurora', deadline: '2026-12-10', budget: 48000, owner: 'Marina Duarte', client: 'Aurora Cosméticos', desc: '', color: COLORS[1] },
      { id: p2, name: 'Site Institucional Vértice', deadline: '2027-01-20', budget: 32500, owner: 'Rafael Nogueira', client: 'Vértice Engenharia', desc: '', color: COLORS[2] }
    ],
    tasks: [
      { id: uid(), title: 'Moodboard e paleta de cores', project: p1, team: 'design', priority: 'alta', hours: 12, done: true },
      { id: uid(), title: 'Manual de tom de voz', project: p1, team: 'conteudo', priority: 'media', hours: 8, done: false },
      { id: uid(), title: 'Wireframes da home', project: p2, team: 'design', priority: 'media', hours: 16, done: false },
      { id: uid(), title: 'Plano de anúncios', project: p2, team: 'backlog', priority: 'baixa', hours: 6, done: false }
    ],
    mails: [], attachments: [], drive: false, role: 'gerente',
    uat: {}
  };
}
let S = JSON.parse(localStorage.getItem(KEY) || 'null') || seed();
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
let currentView = 'projects';
let toastTimer;
const toast = msg => {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
};
const isManager = () => S.role === 'gerente';
const projectName = id => (S.projects.find(p => p.id === id) || {}).name || '—';
const mask = (txt) => isManager() ? esc(txt) : `<span class="masked" title="Acesso restrito">${'x'.repeat(10)}</span>`;

function download(name, text, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + text], { type }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
const csv = rows => rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');

/* ---------- navigation ---------- */
function go(view) {
  currentView = view;
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  $('#title').textContent = VIEWS[view][0];
  $('#subtitle').textContent = VIEWS[view][1];
  render();
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });

/* ---------- projects ---------- */
function renderProjects() {
  const list = $('#projectList');
  list.innerHTML = S.projects.length ? S.projects.map(p => {
    const t = S.tasks.filter(x => x.project === p.id);
    const pct = t.length ? Math.round(t.filter(x => x.done).length / t.length * 100) : 0;
    return `<article class="project" style="--c:${p.color}">
      <header><div><strong>${esc(p.name)}</strong><small>Cliente: ${mask(p.client || '—')}</small></div>
      <button class="x-btn" data-del="${p.id}" aria-label="Excluir projeto">${icon('trash')}</button></header>
      <div class="meta"><span>Prazo: ${fdate(p.deadline)}</span><span>Orçamento: ${isManager() ? brl(p.budget) : mask('')}</span><span>Resp.: ${esc(p.owner)}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div></article>`;
  }).join('') : '<p class="empty">Nenhum projeto cadastrado.</p>';
}
$('#projectList').addEventListener('click', e => {
  const b = e.target.closest('[data-del]'); if (!b) return;
  const id = b.dataset.del;
  S.projects = S.projects.filter(p => p.id !== id);
  S.tasks = S.tasks.filter(t => t.project !== id);
  save(); render(); toast('Projeto excluído');
});
$('#projectForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f));
  const missing = [['name', 'Nome'], ['deadline', 'Prazo'], ['budget', 'Orçamento'], ['owner', 'Responsável']].filter(([k]) => !String(d[k] || '').trim());
  $$('input,select', f).forEach(i => i.classList.toggle('invalid', missing.some(([k]) => k === i.name)));
  const err = $('#projectError');
  if (missing.length) {
    err.hidden = false;
    err.textContent = 'Preencha os campos obrigatórios: ' + missing.map(m => m[1]).join(', ') + '.';
    return;
  }
  err.hidden = true;
  S.projects.push({ id: uid(), name: d.name.trim(), deadline: d.deadline, budget: +d.budget, owner: d.owner, client: d.client, desc: d.desc, color: COLORS[S.projects.length % COLORS.length] });
  save(); f.reset(); render(); toast('Projeto criado com sucesso');
});

/* ---------- tasks ---------- */
function renderTasks() {
  const sel = $('#taskProject');
  sel.innerHTML = S.projects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('') || '<option value="">Crie um projeto antes</option>';
  $('#board').innerHTML = TEAMS.map(tm => {
    const items = S.tasks.filter(t => t.team === tm.id);
    return `<div class="col" data-team="${tm.id}" style="--c:${tm.color}"><h3>${tm.name}<span>${items.length}</span></h3>
      ${items.map(t => {
        const p = S.projects.find(x => x.id === t.project);
        return `<div class="task" draggable="true" data-id="${t.id}">${icon('grip')}<div>
          <b${t.done ? ' style="text-decoration:line-through;opacity:.6"' : ''}>${esc(t.title)}</b>
          <span class="tag" style="--c:${p ? p.color : '#64748b'}">${esc(p ? p.name : '—')}</span>
          <span class="tag p-${t.priority}">${PRIORITY[t.priority]}</span>
          <label class="check" style="margin:6px 0 0;font-size:12px"><input type="checkbox" data-done="${t.id}" ${t.done ? 'checked' : ''}> Concluída · ${t.hours || 0}h</label></div></div>`;
      }).join('')}</div>`;
  }).join('');
  $('#mailLog').innerHTML = S.mails.length ? S.mails.slice().reverse().map(m =>
    `<div class="mail">${icon('mail')}<div><b>Para: ${esc(m.to)}</b><small>${esc(m.subject)} · ${m.time}</small></div></div>`).join('')
    : '<p class="empty">Nenhum e-mail enviado ainda. Mova uma tarefa para uma equipe.</p>';
}
function notify(task, team) {
  if (!$('#notifyToggle').checked || !team.mail) return;
  S.mails.push({ to: team.mail, subject: `Nova tarefa atribuída: "${task.title}" (${projectName(task.project)})`, time: now() });
  toast('E-mail enviado para ' + team.mail);
}
const board = $('#board');
let dragId = null;
board.addEventListener('dragstart', e => {
  const t = e.target.closest('.task'); if (!t) return;
  dragId = t.dataset.id; t.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
});
board.addEventListener('dragend', () => { dragId = null; $$('.dragging,.over', board).forEach(x => x.classList.remove('dragging', 'over')); });
board.addEventListener('dragover', e => { const c = e.target.closest('.col'); if (!c) return; e.preventDefault(); $$('.col', board).forEach(x => x.classList.toggle('over', x === c)); });
board.addEventListener('drop', e => {
  const c = e.target.closest('.col'); if (!c || !dragId) return;
  e.preventDefault();
  const task = S.tasks.find(t => t.id === dragId), team = TEAMS.find(t => t.id === c.dataset.team);
  if (task.team !== team.id) { task.team = team.id; notify(task, team); save(); }
  render();
});
board.addEventListener('change', e => {
  const id = e.target.dataset.done; if (!id) return;
  S.tasks.find(t => t.id === id).done = e.target.checked; save(); render();
});
$('#taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  if (!d.title.trim() || !d.project) { toast('Informe o título e o projeto'); return; }
  S.tasks.push({ id: uid(), title: d.title.trim(), project: d.project, team: 'backlog', priority: d.priority, hours: +d.hours || 0, done: false });
  save(); e.target.reset(); render();
});

/* ---------- progress ---------- */
function renderProgress() {
  const total = S.tasks.length, done = S.tasks.filter(t => t.done).length;
  const hrs = S.tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const stats = [['Projetos', S.projects.length, '#4f46e5'], ['Tarefas', total, '#0891b2'], ['Concluídas', done, '#16a34a'], ['Horas registradas', hrs + 'h', '#ea580c']];
  $('#stats').innerHTML = stats.map(([l, v, c]) => `<div class="stat" style="--c:${c}"><b>${v}</b><span>${l}</span></div>`).join('');
  $('#statusReport').innerHTML = `<table class="table"><tr><th>Projeto</th><th>Tarefas</th><th>Concluídas</th><th>%</th></tr>${S.projects.map(p => {
    const t = S.tasks.filter(x => x.project === p.id), d = t.filter(x => x.done).length;
    return `<tr><td><span class="tag" style="--c:${p.color}">${esc(p.name)}</span></td><td>${t.length}</td><td>${d}</td><td>${t.length ? Math.round(d / t.length * 100) : 0}%</td></tr>`;
  }).join('') || '<tr><td colspan="4" class="empty">Sem dados</td></tr>'}</table>`;
  const by = {};
  S.tasks.forEach(t => { const tm = TEAMS.find(x => x.id === t.team); by[tm.name] = (by[tm.name] || 0) + (t.hours || 0); });
  $('#hoursReport').innerHTML = `<table class="table"><tr><th>Equipe</th><th>Horas</th></tr>${Object.entries(by).map(([k, v]) => `<tr><td>${k}</td><td>${v}h</td></tr>`).join('')}</table>`;
  $('#driveState').textContent = S.drive ? 'Conectado como agencia@gmail.com' : 'Desconectado';
  $('#driveBtn').textContent = S.drive ? 'Desconectar' : 'Conectar';
  $('#attachments').innerHTML = S.attachments.map(a => `<div class="mail">${icon('clip')}<div><b>${esc(a.name)}</b><small>${esc(a.project)}</small></div></div>`).join('');
}
const hoursRows = () => [['Projeto', 'Tarefa', 'Equipe', 'Horas'], ...S.tasks.map(t => [projectName(t.project), t.title, TEAMS.find(x => x.id === t.team).name, t.hours || 0])];
$('#exportCsv').onclick = () => download('status-projetos.csv', csv([['Projeto', 'Tarefas', 'Concluídas'], ...S.projects.map(p => { const t = S.tasks.filter(x => x.project === p.id); return [p.name, t.length, t.filter(x => x.done).length]; })]));
$('#exportHoursCsv').onclick = () => download('horas-trabalhadas.csv', csv(hoursRows()));
$('#exportHoursPrint').onclick = () => window.print();
$('#exportHoursXls').onclick = () => toast('Erro: formato Excel (.xlsx) não é suportado');
$('#driveBtn').onclick = () => { S.drive = !S.drive; save(); renderProgress(); toast(S.drive ? 'Google Drive conectado' : 'Google Drive desconectado'); };
$('#attachBtn').onclick = () => {
  if (!S.drive) { toast('Conecte o Google Drive primeiro'); return; }
  if (!S.projects.length) { toast('Crie um projeto antes'); return; }
  const files = ['Briefing_Campanha.pdf', 'Identidade_Visual.zip', 'Orcamento_v3.xlsx', 'Roteiro_Video.docx'];
  S.attachments.push({ name: files[S.attachments.length % files.length], project: S.projects[0].name });
  save(); renderProgress(); toast('Arquivo anexado do Drive');
};

/* ---------- non-functional ---------- */
function renderPerfMetrics(extra) {
  const nav = performance.getEntriesByType('navigation')[0];
  const load = nav ? Math.round(nav.loadEventEnd || nav.duration) : 0;
  const dom = nav ? Math.round(nav.domContentLoadedEventEnd) : 0;
  const size = Math.round(performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) / 1024);
  $('#perfMetrics').innerHTML = [['Carga total', load + ' ms'], ['DOM pronto', dom + ' ms'], ['Recursos', size + ' KB']]
    .map(([l, v]) => `<div class="metric"><b>${v}</b><span>${l}</span></div>`).join('');
  return load;
}
$('#perfRun').onclick = () => {
  const lat = +$('#netProfile').value, res = $('#perfResult');
  res.className = 'result show warn'; res.textContent = 'Medindo…';
  const t0 = performance.now();
  setTimeout(() => {
    const total = Math.round(performance.now() - t0 + renderPerfMetrics());
    const cls = total < 1500 ? 'ok' : total < 3000 ? 'warn' : 'bad';
    res.className = 'result show ' + cls;
    res.textContent = `Tempo estimado de carregamento: ${total} ms — ${cls === 'ok' ? 'excelente' : cls === 'warn' ? 'aceitável' : 'acima do limite de 3 s'}.`;
  }, lat);
};
function renderSensitive() {
  $('#sensitiveTable').innerHTML = `<tr><th>Projeto</th><th>Cliente</th><th>Orçamento</th></tr>` + S.projects.map(p =>
    `<tr><td>${esc(p.name)}</td><td>${mask(p.client || '—')}</td><td>${isManager() ? brl(p.budget) : mask('')}</td></tr>`).join('');
  const n = $('#sensitiveNote');
  n.className = 'result show ' + (isManager() ? 'warn' : 'ok');
  n.innerHTML = isManager() ? `${icon('lock')} Perfil com acesso total aos dados financeiros e de clientes.` : `${icon('lock')} Dados sensíveis ocultos para este perfil.`;
}

/* ---------- UAT ---------- */
function renderUat() {
  const res = c => (S.uat[c] || {}).r || 'pending';
  const pass = CASES.filter(c => res(c[1]) === 'pass').length, fail = CASES.filter(c => res(c[1]) === 'fail').length;
  $('#uatBar').style.width = (pass / CASES.length * 100) + '%';
  $('#uatSummary').textContent = `${pass} aprovados · ${fail} reprovados · ${CASES.length - pass - fail} pendentes`;
  $('#uatBadge').textContent = pass + fail + '/' + CASES.length;
  let last = '';
  $('#uatList').innerHTML = CASES.map(([g, id, t, exp, v]) => {
    const r = res(id), head = g !== last ? `<div class="uat-group">${g}</div>` : ''; last = g;
    return `${head}<div class="case ${r}"><div><b>${t}</b><small>Esperado: ${exp}</small><button class="go" data-go="${v}">Ir para a tela</button></div>
      <div class="seg" data-case="${id}"><button data-r="pass" class="${r === 'pass' ? 'on-pass' : ''}">Aprovar</button><button data-r="fail" class="${r === 'fail' ? 'on-fail' : ''}">Reprovar</button></div>
      ${r === 'fail' ? `<textarea rows="2" data-note="${id}" placeholder="Descreva o problema encontrado e o impacto no fluxo do cliente">${esc((S.uat[id] || {}).note)}</textarea>` : ''}</div>`;
  }).join('');
  const fails = CASES.filter(c => res(c[1]) === 'fail');
  $('#defects').innerHTML = fails.length ? fails.map(c => `<div class="defect">${icon('alert')}<div><b>${c[2]}</b><br>${esc((S.uat[c[1]] || {}).note) || 'Sem descrição'}</div></div>`).join('') : '<p class="empty">Nenhum problema registrado.</p>';
}
$('#uatList').addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) return go(g.dataset.go);
  const b = e.target.closest('[data-r]'); if (!b) return;
  const id = b.parentElement.dataset.case;
  S.uat[id] = { ...(S.uat[id] || {}), r: b.dataset.r }; save(); renderUat();
});
$('#uatList').addEventListener('input', e => {
  const id = e.target.dataset.note; if (!id) return;
  S.uat[id].note = e.target.value; save();
  const cases = CASES.filter(c => (S.uat[c[1]] || {}).r === 'fail');
  $('#defects').innerHTML = cases.map(c => `<div class="defect">${icon('alert')}<div><b>${c[2]}</b><br>${esc((S.uat[c[1]] || {}).note) || 'Sem descrição'}</div></div>`).join('');
});
$('#exportUat').onclick = () => download('resultado-aceitacao.csv', csv([['Cenário', 'Resultado', 'Observação'], ...CASES.map(c => [c[2], { pass: 'Aprovado', fail: 'Reprovado', pending: 'Pendente' }[(S.uat[c[1]] || {}).r || 'pending'], (S.uat[c[1]] || {}).note || ''])]));

/* ---------- shell ---------- */
$('#role').addEventListener('change', e => { S.role = e.target.value; save(); render(); toast('Perfil alterado'); });
$('#reset').onclick = () => { if (confirm('Restaurar os dados de exemplo? Resultados do roteiro serão apagados.')) { S = seed(); save(); $('#role').value = S.role; render(); } };
$('#bellBtn').onclick = () => { $('#drawer').hidden = !$('#drawer').hidden; $('#bellDot').hidden = true; };
$('#drawerClose').onclick = () => $('#drawer').hidden = true;
function renderDrawer() {
  $('#notifList').innerHTML = S.mails.length ? S.mails.slice().reverse().map(m => `<div class="mail">${icon('bell')}<div><b>${esc(m.subject)}</b><small>${esc(m.to)} · ${m.time}</small></div></div>`).join('') : '<p class="empty">Sem notificações.</p>';
  $('#bellDot').hidden = !S.mails.length || !$('#drawer').hidden;
}
function render() {
  renderProjects(); renderTasks(); renderProgress(); renderSensitive(); renderUat(); renderDrawer();
  if (currentView === 'nonfunc') renderPerfMetrics();
}
$('#role').value = S.role;
window.addEventListener('load', () => setTimeout(() => { renderPerfMetrics(); }, 0));
go('projects');
})();
