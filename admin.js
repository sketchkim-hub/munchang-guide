'use strict';
let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ko';
let base = null, P = null, fb = null, user = null, cloudApps = [], filter = 'all', authKnown = false;
const $ = s => document.querySelector(s);
const A = {
  ko: {
    title: '택배 관리', back: '안내 화면',
    warn: '이 비밀번호는 서버가 확인하지 않습니다. 이 브라우저에만 걸리고, 개발자 도구로 우회할 수 있습니다. 신청서(이름·전화·주소)는 이 기기에 남으며 다른 휴대폰 관리 화면에는 보이지 않습니다. 손님 전체에 안내를 반영하고 신청을 한곳에서 보려면 Firebase가 필요합니다. 관리자 비밀번호는 GitHub에 올리지 마세요.',
    warnOn: 'Firebase가 연결되었습니다. 안내 저장과 신청 목록은 로그인한 관리자만 바꿉니다. apiKey는 사이트에 공개되는 값입니다. Firestore 규칙을 게시하지 않으면 이름·전화·주소가 공개될 수 있습니다.',
    passSet: '이 브라우저용 관리 비밀번호', pass1: '비밀번호 (8자 이상)', pass2: '비밀번호 다시',
    passSave: '비밀번호 저장', passEnter: '관리 비밀번호', passGo: '들어가기',
    passShort: '8자 이상으로 정해 주세요.', passMismatch: '두 비밀번호가 다릅니다.', passBad: '비밀번호가 맞지 않습니다.',
    forgot: '비밀번호를 잊었어요 (이 브라우저 잠금만 지움)',
    email: '관리자 이메일', password: '비밀번호', login: '로그인', logout: '로그아웃',
    checking: '연결 확인 중…',
    setup: 'Firebase로 모든 기기에 반영하기',
    steps: [
      'Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트를 만듭니다.',
      'Build → Authentication → Sign-in method에서 이메일/비밀번호를 켭니다.',
      'Authentication → Users → 사용자 추가에서 관리자 이메일과 비밀번호를 만듭니다. 이 비밀번호는 저장소에 넣지 마세요.',
      'Build → Firestore Database → 데이터베이스 만들기를 프로덕션 모드로 합니다. 위치는 asia-northeast3(서울)을 권합니다.',
      'Firestore → 규칙에 아래 규칙을 붙여넣고 게시합니다. 규칙을 게시하기 전에 웹 설정을 연결하면 신청서의 개인정보가 공개될 수 있습니다.',
      '프로젝트 설정 → 일반 → 웹 앱을 추가하고, firebaseConfig를 firebase-config.js의 window.FIREBASE_CONFIG에 넣은 뒤 저장소를 푸시합니다.',
      'GitHub Pages가 갱신되면 이 화면에서 3번의 이메일과 비밀번호로 로그인합니다.'
    ],
    copyRules: '규칙 복사', copied: '규칙을 복사했습니다.',
    save: '안내 저장', savedLocal: '이 브라우저 안내 화면에 반영했습니다. 다른 손님 화면에는 아직 없습니다.',
    savedCloud: '저장했습니다. 열려 있는 안내 화면에도 곧 반영됩니다.',
    saveFail: '저장하지 못했습니다.',
    notice: '공지',
    cutoff: '시외 택배 접수 마감',
    rates: '시외 택배 요금', addRate: '구간 추가', kg: 'kg까지', won: '원',
    overKg: '이 무게 초과', overLabel: '초과 시 문구', cond: '박스 포장 조건',
    box: '박스 규격', hol: '휴무일', car: '택배사', drop: '접수 위치', trk: '운송장·문의', cau: '주의사항',
    phone: '택배 전용 전화번호', kakao: '카카오톡 링크 (https)', shops: '점포 목록 (한 줄에 하나)',
    shopsHelp: '비어 있으면 신청 화면에서 직접 입력만 됩니다. 점포명은 지어 넣지 마세요.',
    apps: '택배 신청', noApps: '아직 신청이 없습니다.',
    filterAll: '전체', csv: 'CSV 내려받기', xls: '엑셀 내려받기', del: '삭제',
    delAsk: '이 신청을 삭제할까요? 이름·전화·주소가 이 목록에서 지워집니다.',
    localTag: '이 기기', cloudTag: 'Firebase',
    preview: '안내 화면 보기',
    need: '비워 두면 손님 화면에는 ‘관리자 입력 필요’로 보입니다.',
    off: 'Firebase 미연결 — 신청은 카카오톡 복사와 이 브라우저 목록으로 받습니다.'
  },
  en: {
    title: 'Parcel admin', back: 'Guide',
    warn: 'This password is not checked by a server. It only locks this browser and can be bypassed with developer tools. Names, phones, and addresses stay on this device and do not show on another phone. Publishing the guide to every visitor and sharing the request list needs Firebase. Do not put the admin password in GitHub.',
    warnOn: 'Firebase is connected. Only a signed-in admin can change the guide or read requests. The apiKey is public on the site. If you do not publish the Firestore rules, names, phones, and addresses can be public.',
    passSet: 'Admin password for this browser', pass1: 'Password (8+ characters)', pass2: 'Repeat password',
    passSave: 'Save password', passEnter: 'Admin password', passGo: 'Enter',
    passShort: 'Use at least 8 characters.', passMismatch: 'The passwords do not match.', passBad: 'Wrong password.',
    forgot: 'I forgot it (clears the lock on this browser only)',
    email: 'Admin email', password: 'Password', login: 'Sign in', logout: 'Sign out',
    checking: 'Checking the connection…',
    setup: 'Use Firebase to publish to every device',
    steps: [
      'Create a project in the Firebase console (https://console.firebase.google.com).',
      'Build → Authentication → Sign-in method → enable Email/Password.',
      'Authentication → Users → Add user. Do not commit this password.',
      'Build → Firestore Database → Create database in production mode. Prefer asia-northeast3 (Seoul).',
      'Firestore → Rules: paste the rules below and publish them before you connect the web app. Otherwise request personal data can be public.',
      'Project settings → General → add a web app, put firebaseConfig into window.FIREBASE_CONFIG in firebase-config.js, and push.',
      'After GitHub Pages updates, sign in here with the email and password from step 3.'
    ],
    copyRules: 'Copy rules', copied: 'Rules copied.',
    save: 'Save guide', savedLocal: 'Updated on this browser only. Other visitors do not see it yet.',
    savedCloud: 'Saved. Open guide pages will update shortly.',
    saveFail: 'Could not save.',
    notice: 'Notice',
    cutoff: 'Out-of-town cut-off',
    rates: 'Out-of-town rates', addRate: 'Add band', kg: 'up to kg', won: 'won',
    overKg: 'Over this weight', overLabel: 'Text when over', cond: 'Box-packing condition',
    box: 'Box size', hol: 'Closed days', car: 'Courier', drop: 'Drop-off', trk: 'Tracking & contact', cau: 'Please note',
    phone: 'Parcel phone', kakao: 'KakaoTalk link (https)', shops: 'Shops (one per line)',
    shopsHelp: 'If this is empty, people type a shop name. Do not invent shop names.',
    apps: 'Parcel requests', noApps: 'No requests yet.',
    filterAll: 'All', csv: 'Download CSV', xls: 'Download Excel', del: 'Delete',
    delAsk: 'Delete this request? The name, phone, and address will be removed from this list.',
    localTag: 'This device', cloudTag: 'Firebase',
    preview: 'Open the guide',
    need: 'Blank fields show as “Admin input needed” on the guide.',
    off: 'Firebase is not connected. Requests are kept by copying to KakaoTalk and on this browser.'
  }
};
const t = k => (A[lang] || A.ko)[k];
const esc = s => MParcel.esc(s);
function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function area(id, label, value) {
  return `<label class="fld">${esc(label)}<textarea id="${id}" rows="3">${esc(value || '')}</textarea></label>`;
}
function line(id, label, value, type) {
  return `<label class="fld">${esc(label)}<input id="${id}" type="${type || 'text'}" value="${esc(value || '')}"></label>`;
}
function keepPair(id, prev) {
  return { ko: val(id + 'Ko'), en: prev && typeof prev.en === 'string' ? prev.en : '' };
}
function koArea(id, label, value) {
  return area(id + 'Ko', label, value);
}
async function sha(salt, password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + password));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function rand() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}
function setupBox() {
  const steps = t('steps').map(s => '<li>' + esc(s) + '</li>').join('');
  return `<details class="banner"><summary>${esc(t('setup'))}</summary><ol>${steps}</ol>
    <pre id="rulesBox">${esc('…')}</pre><button type="button" id="copyRules">${esc(t('copyRules'))}</button></details>`;
}
function gate(inner) {
  return `<p class="banner">${esc(MParcel.firebaseReady() ? t('warnOn') : t('warn'))}</p>${setupBox()}${inner}
    <p><a href="index.html?lang=${lang === 'en' ? 'en' : 'ko'}#parcel">${esc(t('preview'))}</a></p>`;
}
function loading() { return '<p>' + esc(t('checking')) + '</p>'; }
function passForm(mode) {
  const set = mode === 'set';
  return gate(`<h2>${esc(set ? t('passSet') : t('passEnter'))}</h2><form id="passForm">
    <label class="fld">${esc(t('pass1'))}<input id="pw1" type="password" autocomplete="${set ? 'new-password' : 'current-password'}"></label>
    ${set ? `<label class="fld">${esc(t('pass2'))}<input id="pw2" type="password" autocomplete="new-password"></label>` : ''}
    <p id="gateErr" class="err"></p>
    <button class="primary" type="submit">${esc(set ? t('passSave') : t('passGo'))}</button>
    </form>${set ? '' : `<p><button type="button" id="forgot">${esc(t('forgot'))}</button></p>`}`);
}
function loginForm() {
  return gate(`<h2>${esc(t('login'))}</h2><form id="loginForm">
    <label class="fld">${esc(t('email'))}<input id="email" type="email" autocomplete="username"></label>
    <label class="fld">${esc(t('password'))}<input id="pw1" type="password" autocomplete="current-password"></label>
    <p id="gateErr" class="err"></p>
    <button class="primary" type="submit">${esc(t('login'))}</button></form>`);
}
function rateRow(r) {
  const kg = r.max_kg === '' || r.max_kg == null ? '' : Number(r.max_kg);
  const price = r.price === '' || r.price == null ? '' : Number(r.price);
  return `<div class="rate-row"><label class="fld">${esc(t('kg'))}<input data-kg type="number" min="1" step="1" value="${kg}"></label>
    <label class="fld">${esc(t('won'))}<input data-price type="number" min="0" step="100" value="${price}"></label>
    <button type="button" data-del-rate>${esc(t('del'))}</button></div>`;
}
function settingsHTML() {
  const S = P;
  return `<form id="settingsForm">
    <p class="banner">${esc(fb && user ? t('warnOn') : t('off'))}</p>
    <p class="s">${esc(t('need'))}</p>
    ${koArea('notice', t('notice'), S.notice && S.notice.ko)}
    <label class="fld">${esc(t('cutoff'))}<input id="cutoff" type="time" value="${esc(S.cutoff.time)}"></label>
    <fieldset><legend>${esc(t('rates'))}</legend><div id="rates">${S.rates.map(rateRow).join('')}</div>
      <button type="button" id="addRate">${esc(t('addRate'))}</button>
      <div class="row2">${line('overKg', t('overKg'), S.over_kg, 'number')}${area('overKo', t('overLabel'), S.over_label.ko)}</div>
      ${koArea('cond', t('cond'), S.rate_condition && S.rate_condition.ko)}
    </fieldset>
    ${koArea('box', t('box'), S.box_spec && S.box_spec.ko)}
    ${koArea('hol', t('hol'), S.holidays && S.holidays.ko)}
    ${koArea('car', t('car'), S.carrier && S.carrier.ko)}
    ${koArea('drop', t('drop'), S.dropoff && S.dropoff.ko)}
    ${koArea('trk', t('trk'), S.tracking && S.tracking.ko)}
    ${line('deskPhone', t('phone'), S.contact_phone, 'tel')}
    ${koArea('cau', t('cau'), S.cautions && S.cautions.ko)}
    ${line('kakao', t('kakao'), S.kakao_url, 'url')}
    <label class="fld">${esc(t('shops'))}<textarea id="shops" rows="4">${esc((S.shops || []).join('\n'))}</textarea></label>
    <p class="s">${esc(t('shopsHelp'))}</p>
    <p id="saveMsg" class="s" role="status"></p>
    <div class="sticky-save"><button class="primary" type="submit">${esc(t('save'))}</button></div>
  </form>`;
}
function appCard(a) {
  const opts = MParcel.STATUS.map(s => `<option value="${s}"${a.status === s ? ' selected' : ''}>${esc(MParcel.statusLabel(s, lang))}</option>`).join('');
  return `<article class="appcard"><header><b>${esc(a.id)}</b> <span class="s">${esc(a.createdAt || '')}</span> <span class="flag">${esc(a._src === 'cloud' ? t('cloudTag') : t('localTag'))}</span></header>
    <p>${esc(a.senderName)} ${esc(a.senderPhone)}${a.shopName ? ' · ' + esc(a.shopName) : ''}<br>→ ${esc(a.recipientName)} ${esc(a.recipientPhone)}<br>${esc(a.address)}</p>
    <p>${esc(MParcel.serviceLabel(a.service, lang))} · ${esc(a.itemType)} · ${esc(a.qty)} · ${esc(a.weightLabel)}<br>${esc(a.estimateText)}<br>${esc(a.date)} ${a.note ? '· ' + esc(a.note) : ''}</p>
    <label class="fld">${esc(lang === 'en' ? 'Status' : '상태')}<select data-status data-id="${esc(a.id)}" data-src="${a._src === 'cloud' ? 'cloud' : 'local'}">${opts}</select></label>
    <button type="button" data-del-app data-id="${esc(a.id)}" data-src="${a._src === 'cloud' ? 'cloud' : 'local'}">${esc(t('del'))}</button></article>`;
}
function appsHTML() {
  const list = allApps();
  const filters = ['all', ...MParcel.STATUS].map(s => `<option value="${s}"${filter === s ? ' selected' : ''}>${esc(s === 'all' ? t('filterAll') : MParcel.statusLabel(s, lang))}</option>`).join('');
  const body = list.length ? list.map(appCard).join('') : `<p>${esc(t('noApps'))}</p>`;
  return `<section><h2 id="appsHeading">${esc(t('apps'))} (${list.length})</h2>
    <label class="fld">${esc(lang === 'en' ? 'Filter' : '보기')}<select id="filter">${filters}</select></label>
    <div class="btns"><button type="button" id="exportCsv">${esc(t('csv'))}</button><button type="button" id="exportXls">${esc(t('xls'))}</button></div>
    <p id="appsErr" class="err"></p><div id="appList">${body}</div></section>`;
}
function allApps(ignoreFilter) {
  const map = new Map();
  const local = MParcel.loadJSON(MParcel.KEYS.apps, []);
  (Array.isArray(local) ? local : []).forEach(a => { if (a && a.id) map.set(a.id, { ...a, _src: 'local' }); });
  cloudApps.forEach(a => { if (a && a.id) map.set(a.id, { ...a, _src: 'cloud' }); });
  let list = [...map.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  if (!ignoreFilter && filter !== 'all') list = list.filter(a => a.status === filter);
  return list;
}
function mainHTML() {
  return `<p><a href="index.html?lang=${lang === 'en' ? 'en' : 'ko'}#parcel">${esc(t('back'))}</a>
    <button type="button" id="logout">${esc(t('logout'))}</button></p>
    ${fb && user ? '' : `<p class="banner">${esc(t('warn'))}</p>`}
    <h2>${esc(t('title'))}</h2>
    ${settingsHTML()}
    ${appsHTML()}
    ${setupBox()}`;
}
function paint(html) {
  $('#admin').innerHTML = html;
  $('#appName').textContent = t('title');
  document.documentElement.lang = lang;
  document.querySelectorAll('.langs button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  const box = document.getElementById('rulesBox');
  if (box) fetch('firestore.rules').then(r => r.text()).then(txt => { box.textContent = txt; }).catch(() => {});
}
function render() {
  if (!P) return;
  if (MParcel.firebaseReady()) {
    if (!authKnown) return paint(loading() + setupBox());
    if (!user) return paint(loginForm());
    return paint(mainHTML());
  }
  const auth = MParcel.loadJSON(MParcel.KEYS.auth, null);
  if (!auth || !auth.hash) return paint(passForm('set'));
  if (sessionStorage.getItem(MParcel.KEYS.session) !== 'ok') return paint(passForm('enter'));
  paint(mainHTML());
}
function renderApps() {
  const el = document.getElementById('appList');
  if (!el) return;
  const list = allApps();
  el.innerHTML = list.length ? list.map(appCard).join('') : `<p>${esc(t('noApps'))}</p>`;
  const h = document.getElementById('appsHeading');
  if (h) h.textContent = t('apps') + ' (' + list.length + ')';
}
function collect() {
  const rates = [...document.querySelectorAll('.rate-row')].map(row => ({
    max_kg: Number(row.querySelector('[data-kg]').value),
    price: Number(row.querySelector('[data-price]').value)
  }));
  const over = {
    notice: keepPair('notice', P && P.notice),
    cutoff: { time: val('cutoff') },
    rates,
    over_kg: Number(val('overKg')),
    over_label: keepPair('over', P && P.over_label),
    rate_condition: keepPair('cond', P && P.rate_condition),
    box_spec: keepPair('box', P && P.box_spec),
    holidays: keepPair('hol', P && P.holidays),
    carrier: keepPair('car', P && P.carrier),
    dropoff: keepPair('drop', P && P.dropoff),
    tracking: keepPair('trk', P && P.tracking),
    contact_phone: val('deskPhone'),
    cautions: keepPair('cau', P && P.cautions),
    kakao_url: val('kakao'),
    shops: val('shops').split(/\n/).map(s => s.trim()).filter(Boolean),
    updatedAt: new Date().toISOString()
  };
  const kept = MParcel.inheritedSameDay(P && P.same_day);
  if (kept) over.same_day = kept;
  return MParcel.merge(base, over);
}
async function saveSettings() {
  const msg = document.getElementById('saveMsg');
  try {
    P = collect();
    const localOk = MParcel.saveJSON(MParcel.KEYS.settings, P);
    if (fb && user) {
      await fb.fs.setDoc(fb.fs.doc(fb.db, 'settings', 'parcel'), P);
      if (msg) msg.textContent = t('savedCloud');
      return;
    }
    if (msg) msg.textContent = localOk ? t('savedLocal') : t('saveFail');
  } catch (e) {
    if (msg) msg.textContent = t('saveFail') + ' ' + (e && e.message ? e.message : '');
  }
}
function download(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportApps(kind) {
  const list = allApps(true);
  const stamp = MParcel.seoulStamp(new Date()).replace(/[: ]/g, '');
  if (kind === 'xls') download('munchang-parcels-' + stamp + '.xls', MParcel.toXLS(list), 'application/vnd.ms-excel');
  else download('munchang-parcels-' + stamp + '.csv', MParcel.toCSV(list), 'text/csv;charset=utf-8');
}
async function setStatus(id, status, src) {
  if (src === 'cloud' && fb && user) {
    try { await fb.fs.updateDoc(fb.fs.doc(fb.db, 'applications', id), { status }); } catch (e) {
      const el = document.getElementById('appsErr'); if (el) el.textContent = e.message || String(e);
    }
  }
  const list = MParcel.loadJSON(MParcel.KEYS.apps, []);
  if (Array.isArray(list)) {
    const i = list.findIndex(a => a.id === id);
    if (i >= 0) { list[i].status = status; MParcel.saveJSON(MParcel.KEYS.apps, list); }
  }
  const c = cloudApps.find(a => a.id === id);
  if (c) c.status = status;
  renderApps();
}
async function removeApp(id, src) {
  if (!confirm(t('delAsk'))) return;
  if (src === 'cloud' && fb && user) {
    try { await fb.fs.deleteDoc(fb.fs.doc(fb.db, 'applications', id)); } catch (e) {
      const el = document.getElementById('appsErr'); if (el) el.textContent = e.message || String(e);
    }
    cloudApps = cloudApps.filter(a => a.id !== id);
  }
  const list = MParcel.loadJSON(MParcel.KEYS.apps, []);
  if (Array.isArray(list)) MParcel.saveJSON(MParcel.KEYS.apps, list.filter(a => a.id !== id));
  renderApps();
}
async function doPass(e) {
  const set = !!document.getElementById('pw2');
  const a = val('pw1'), b = val('pw2');
  const err = document.getElementById('gateErr');
  if (set) {
    if (a.length < 8) { if (err) err.textContent = t('passShort'); return; }
    if (a !== b) { if (err) err.textContent = t('passMismatch'); return; }
    const salt = rand();
    MParcel.saveJSON(MParcel.KEYS.auth, { salt, hash: await sha(salt, a) });
    sessionStorage.setItem(MParcel.KEYS.session, 'ok');
    render();
    return;
  }
  const auth = MParcel.loadJSON(MParcel.KEYS.auth, null);
  const hash = auth ? await sha(auth.salt, a) : '';
  if (!auth || hash !== auth.hash) { if (err) err.textContent = t('passBad'); return; }
  sessionStorage.setItem(MParcel.KEYS.session, 'ok');
  render();
}
async function doLogin() {
  const err = document.getElementById('gateErr');
  try {
    await fb.au.signInWithEmailAndPassword(fb.auth, val('email').trim(), val('pw1'));
  } catch (e) {
    if (err) err.textContent = e && e.message ? e.message : t('passBad');
  }
}
async function doLogout() {
  sessionStorage.removeItem(MParcel.KEYS.session);
  if (fb && user) { try { await fb.au.signOut(fb.auth); } catch (e) {} }
  user = null;
  render();
}
let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  const { fs, db } = fb;
  let opened = false;
  fs.onSnapshot(fs.doc(db, 'settings', 'parcel'), snap => {
    const editing = document.getElementById('settingsForm');
    if (snap.exists() && !editing) P = MParcel.merge(base, snap.data());
    if (!opened) { opened = true; render(); }
  }, () => { if (!opened) { opened = true; render(); } });
  fs.onSnapshot(fs.query(fs.collection(db, 'applications'), fs.limit(300)), snap => {
    cloudApps = snap.docs.map(d => d.data());
    renderApps();
  }, err => {
    const el = document.getElementById('appsErr');
    if (el) el.textContent = err.message || String(err);
  });
}
document.addEventListener('click', async e => {
  const langBtn = e.target.closest('.langs [data-lang]');
  if (langBtn) {
    if (document.getElementById('settingsForm')) P = collect();
    lang = langBtn.dataset.lang;
    const u = new URL(location.href);
    u.searchParams.set('lang', lang);
    history.replaceState(null, '', u);
    render();
    return;
  }
  if (e.target.id === 'forgot') {
    localStorage.removeItem(MParcel.KEYS.auth);
    sessionStorage.removeItem(MParcel.KEYS.session);
    render();
    return;
  }
  if (e.target.id === 'logout') { doLogout(); return; }
  if (e.target.id === 'addRate') {
    const box = document.getElementById('rates');
    if (box) box.insertAdjacentHTML('beforeend', rateRow({ max_kg: '', price: '' }));
    return;
  }
  if (e.target.closest('[data-del-dep]')) { e.target.closest('.dep-row').remove(); return; }
  if (e.target.closest('[data-del-rate]')) { e.target.closest('.rate-row').remove(); return; }
  if (e.target.id === 'exportCsv') return exportApps('csv');
  if (e.target.id === 'exportXls') return exportApps('xls');
  const del = e.target.closest('[data-del-app]');
  if (del) return removeApp(del.dataset.id, del.dataset.src);
  if (e.target.id === 'copyRules') {
    const txt = (document.getElementById('rulesBox') || {}).textContent || '';
    try { await navigator.clipboard.writeText(txt); e.target.textContent = t('copied'); } catch (err) {}
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'filter') { filter = e.target.value; renderApps(); return; }
  if (e.target.matches && e.target.matches('[data-status]')) setStatus(e.target.dataset.id, e.target.value, e.target.dataset.src);
});
document.addEventListener('submit', e => {
  if (e.target.id === 'passForm') { e.preventDefault(); doPass(); }
  if (e.target.id === 'loginForm') { e.preventDefault(); doLogin(); }
  if (e.target.id === 'settingsForm') { e.preventDefault(); saveSettings(); }
});
async function bootFirebase() {
  if (!MParcel.firebaseReady()) { authKnown = true; render(); return; }
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const fs = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const au = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const app = appMod.initializeApp(window.FIREBASE_CONFIG);
    fb = { db: fs.getFirestore(app), auth: au.getAuth(app), fs, au };
    au.onAuthStateChanged(fb.auth, u => {
      user = u;
      authKnown = true;
      if (u) listen();
      else render();
    });
  } catch (e) {
    authKnown = true;
    render();
  }
}
fetch('data.json').then(r => r.json()).then(d => {
  base = d.parcel_info;
  P = MParcel.merge(base, MParcel.loadJSON(MParcel.KEYS.settings, null));
  render();
  bootFirebase();
});
