let D, P, lang = new URLSearchParams(location.search).get('lang') || 'ko', cloudLive = false, cloudP = null;
const $ = s => document.querySelector(s);
const UI = {
  ko: { badge: '비공식', ph: '궁금한 걸 적어 주세요 (예: 주차)', send: '보내기', chat: '안내', parcel: '택배', tl: '연표', home: '처음으로', map: '지도 보기', timeline: '연표', report: '정보가 틀렸어요', reportMsg: '오류 제보 기능은 준비 중이에요. 상인회(042-272-8903)에 알려 주세요.', tlHead: '시대별 연표', disputed: '출처 불일치·확인 필요', src: '출처' },
  en: { badge: 'Unofficial', ph: 'Ask a question (e.g. parking)', send: 'Send', chat: 'Guide', parcel: 'Parcels', tl: 'Timeline', home: 'Main menu', map: 'Map', timeline: 'Timeline', report: 'Report an error', reportMsg: 'Error reporting is coming soon. Please call +82-42-272-8903.', tlHead: 'Timeline', disputed: 'Sources differ — to be confirmed', src: 'Source' }
};
const L = () => UI[lang] || UI.ko, T = o => o[lang] ?? o.ko;
const esc = s => MParcel.esc(s);
function seoulNow() {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = t => p.find(x => x.type == t).value;
  return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: +g('hour') * 60 + +g('minute'), hm: g('hour') + ':' + g('minute'), y: g('year'), m: g('month'), d: g('day') };
}
const toMin = s => MParcel.toMin(s);
function parkingNow() {
  const n = seoulNow(), Pkt = D.parking_lot, h = Pkt.charge_hours[n.dow], en = lang == 'en';
  if ((Pkt.free_days || []).includes(n.dow)) return en ? `Now ${n.hm}: unattended 24 h, open. Free now (Sunday).` : `지금 ${n.hm}: 24시간 무인 운영 중, 지금은 무료(일요일)`;
  const c = h && n.min >= toMin(h[0]) && n.min < toMin(h[1]);
  if (en) return `Now ${n.hm}: unattended 24 h, open. ` + (c ? `Fees apply now (until ${h[1]}).` : `Outside fee hours — free.`) + ` (Free on public holidays)`;
  return `지금 ${n.hm}: 24시간 무인 운영 중, ` + (c ? `지금은 요금 부과 시간(~${h[1]})` : `지금은 요금 부과 시간 외(무료)`) + ` (공휴일은 무료)`;
}
function fmtLine(s) {
  s = s.replace('{{next_departure}}', MParcel.nextDepartureLine(P, lang, seoulNow())).replace('{{parking_now}}', parkingNow());
  let h = esc(s);
  h = h.replace(/(\+82-42-272-8903|042-272-8903)/g, '<a class="tel" href="tel:+82422728903">$1</a>').replace(/(\+82-2-1330|\b1330\b)/, '<a class="tel" href="tel:1330">$1</a>');
  h = h.replace(/(준비 중|coming soon|확인 필요|to be confirmed|관리자 입력 필요|Admin input needed)/gi, '<span class="pending">$1</span>');
  return '<p>' + h + '</p>';
}
function add(html, who = 'bot') {
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.innerHTML = html;
  $('#chat').append(d);
  d.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return d;
}
function btn(id, label) { return `<button type="button" data-go="${id}">${esc(label)}</button>`; }
function item(id) { return D.items.find(i => i.id == id); }
function setTab(name) {
  [['chat', '#tabChat', '#chat'], ['parcel', '#tabParcel', '#parcel'], ['tl', '#tabTl', '#tl']].forEach(([id, b, p]) => {
    $(b).classList.toggle('on', id === name);
    $(p).hidden = id !== name;
  });
  const chat = name === 'chat';
  $('#quick').hidden = !chat;
  $('#ask').hidden = !chat;
}
function guideNode() { return MParcel.guideHTML(P, lang, seoulNow(), D.meta.phone); }
function refreshGuide() {
  const html = guideNode();
  const g = document.getElementById('parcelGuide');
  if (g) g.innerHTML = html;
  document.querySelectorAll('.parcel-live').forEach(el => { el.innerHTML = html; });
  const sel = document.querySelector('#parcelForm select[name="weight"]');
  if (sel) {
    const cur = sel.value;
    const opts = P.rates.map(r => `<option value="${r.max_kg}">${esc(MParcel.weightLabel(P, r.max_kg, lang))}</option>`).join('')
      + `<option value="over">${esc(MParcel.weightLabel(P, 'over', lang))}</option>`;
    sel.innerHTML = `<option value="">${lang === 'en' ? 'Select' : '선택'}</option>` + opts;
    if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
  }
  updateEstimate();
}
function showParcel(focusForm) {
  if (focusForm) add(`<p>${esc(MParcel.t(lang, 'opened'))}</p><div class="btns">${btn('parcel', MParcel.t(lang, 'seeGuide'))}${btn('home', L().home)}</div>`);
  else add(`<div class="parcel-live">${guideNode()}</div><div class="btns">${btn('parcel_apply', MParcel.t(lang, 'apply'))}${btn('contact', T(item('contact').label))}${btn('home', L().home)}${btn('report', L().report)}</div>`);
  setTab('parcel');
  const el = document.getElementById(focusForm ? 'apply' : 'parcel');
  if (el) {
    if (focusForm) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else el.scrollTop = 0;
  }
}
function show(id) {
  if (id == 'home') return greet();
  if (id == 'timeline') return setTab('tl');
  if (id == 'map') { window.open(D.meta.map_url, '_blank'); return; }
  if (id == 'report') return add(fmtLine(L().reportMsg));
  if (id == 'parcel' || id == 'parcel_apply') return showParcel(id == 'parcel_apply');
  const it = item(id); if (!it) return;
  const lines = lang == 'ko' || lang == 'en' ? T(it.answer) : it.answer.ko;
  const pre = (lang == 'zh' || lang == 'ja') ? fmtLine(T(D.greeting)) : '';
  const b = it.buttons.map(x => btn(x, x == 'map' ? L().map : x == 'timeline' ? L().timeline : T(item(x).label))).join('') + btn('home', L().home) + btn('report', L().report);
  add(pre + lines.map(fmtLine).join('') + `<div class="btns">${b}</div>`);
}
function greet() { add(fmtLine(T(D.greeting))); }
function answer(q) {
  add(esc(q), 'me');
  const s = q.toLowerCase();
  let best = null, sc = 0;
  for (const it of D.items) {
    const n = it.keywords.filter(k => s.includes(k.toLowerCase())).reduce((a, k) => a + k.length, 0);
    if (n > sc) { sc = n; best = it; }
  }
  if (/연표|timeline/.test(s)) return show('timeline');
  best ? show(best.id) : add(fmtLine(T(D.fallback)) + `<div class="btns">${btn('contact', T(item('contact').label))}</div>`);
}
function renderQuick() { $('#quick').innerHTML = D.items.filter(i => i.quick).map(i => `<button type="button" data-go="${i.id}">${i.icon}<br>${esc(T(i.label))}</button>`).join(''); }
function renderTl() {
  $('#tl').innerHTML = `<h2>${L().tlHead}</h2>` + D.timeline.map(e => `<div class="ev${e.disputed ? ' dis' : ''}"><div class="y">${esc(e.year)}</div><div>${esc(lang == 'en' ? e.text.en : e.text.ko)}</div><div class="s">${L().src}: ${esc(e.source)} ${e.disputed ? `<span class="flag">${L().disputed}</span>` : ''}</div></div>`).join('') + `<p class="s">${Object.entries(D.sources).map(([k, v]) => esc(k + ': ' + v)).join('<br>')}</p>`;
}
function formHTML() {
  const shops = P.shops.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  const weights = P.rates.map(r => `<option value="${r.max_kg}">${esc(MParcel.weightLabel(P, r.max_kg, lang))}</option>`).join('')
    + `<option value="over">${esc(MParcel.weightLabel(P, 'over', lang))}</option>`;
  const today = MParcel.todayKey(seoulNow());
  const en = lang === 'en';
  return `<form id="parcelForm" novalidate>
    <h2 id="apply">${esc(MParcel.t(lang, 'apply'))}</h2>
    <p class="boxnote">${esc(MParcel.t(lang, 'boxFeeNote'))}</p>
    <fieldset><legend>${esc(MParcel.t(lang, 'from'))}</legend>
      <div class="row2">
        <label class="fld">${esc(MParcel.t(lang, 'senderName'))}<input name="senderName" maxlength="80" autocomplete="name"></label>
        <label class="fld">${esc(MParcel.t(lang, 'senderPhone'))}<input name="senderPhone" maxlength="20" inputmode="tel" autocomplete="tel"></label>
      </div>
      <label class="fld">${esc(MParcel.t(lang, 'shop'))}<select name="shop"><option value="">${esc(MParcel.t(lang, 'shopNone'))}</option>${shops}<option value="__other">${esc(MParcel.t(lang, 'shopOther'))}</option></select></label>
      <label class="fld" id="shopCustomWrap" hidden>${esc(MParcel.t(lang, 'shopCustom'))}<input name="shopCustom" maxlength="80"></label>
      <p class="s">${esc(MParcel.t(lang, 'shopHint'))}</p>
    </fieldset>
    <fieldset><legend>${esc(MParcel.t(lang, 'to'))}</legend>
      <div class="row2">
        <label class="fld">${esc(MParcel.t(lang, 'recvName'))}<input name="recipientName" maxlength="80" autocomplete="name"></label>
        <label class="fld">${esc(MParcel.t(lang, 'recvPhone'))}<input name="recipientPhone" maxlength="20" inputmode="tel" autocomplete="tel"></label>
      </div>
      <label class="fld">${esc(MParcel.t(lang, 'address'))}<textarea name="address" maxlength="300" rows="2" autocomplete="street-address"></textarea></label>
    </fieldset>
    <label class="fld">${esc(MParcel.t(lang, 'itemType'))}<input name="itemType" maxlength="120"></label>
    <div class="row2">
      <label class="fld">${esc(MParcel.t(lang, 'qty'))}<input name="qty" type="number" min="1" max="999" inputmode="numeric" value="1"></label>
      <label class="fld">${esc(MParcel.t(lang, 'weight'))}<select name="weight"><option value="">${en ? 'Select' : '선택'}</option>${weights}</select></label>
    </div>
    <input type="hidden" name="service" value="intercity">
    <label class="fld">${esc(MParcel.t(lang, 'date'))}<input name="date" type="date" min="${today}"></label>
    <label class="fld">${esc(MParcel.t(lang, 'note'))}<textarea name="note" maxlength="500" rows="2" placeholder="${esc(MParcel.t(lang, 'notePh'))}"></textarea></label>
    <p id="estimate" class="est">${esc(MParcel.t(lang, 'estimate'))}: —</p>
    <p id="cutoffWarn" class="warn"></p>
    <label class="check"><input type="checkbox" name="consent"> ${esc(MParcel.t(lang, 'consent'))}</label>
    <p id="formErr" class="err" role="alert"></p>
    <button class="primary" type="submit">${esc(MParcel.t(lang, 'submit'))}</button>
  </form>`;
}
function renderParcel() {
  $('#parcel').innerHTML = `<div id="parcelGuide">${guideNode()}</div>
    <div class="btns"><button type="button" class="primary" data-act="goto-form">${esc(MParcel.t(lang, 'apply'))}</button></div>
    <div id="parcelResult" hidden></div>${formHTML()}`;
}
function updateEstimate() {
  const form = document.getElementById('parcelForm');
  if (!form) return;
  const fd = new FormData(form);
  const service = fd.get('service') || 'intercity';
  const weightId = String(fd.get('weight') || '');
  const est = document.getElementById('estimate');
  const warn = document.getElementById('cutoffWarn');
  if (est) est.textContent = MParcel.t(lang, 'estimate') + ': ' + (weightId ? MParcel.estimate(P, service, weightId, lang).text : '—');
  if (warn) warn.textContent = MParcel.cutoffWarning(P, lang, seoulNow(), service, String(fd.get('date') || ''));
}
function syncShop() {
  const form = document.getElementById('parcelForm');
  const wrap = document.getElementById('shopCustomWrap');
  if (form && wrap) wrap.hidden = form.shop.value !== '__other';
}
function showResult(where, text) {
  const box = document.getElementById('parcelResult');
  if (!box) return;
  const msg = where === 'cloud' ? MParcel.t(lang, 'resultCloud') : where === 'local' ? MParcel.t(lang, 'resultLocal') : MParcel.t(lang, 'resultCopy');
  box.hidden = false;
  box.innerHTML = `<p><b>${esc(MParcel.t(lang, 'resultTitle'))}</b></p><p>${esc(msg)}</p>
    <textarea id="reqText" readonly></textarea>
    <div class="btns">
      <button type="button" data-act="copy">${esc(MParcel.t(lang, 'copy'))}</button>
      <button type="button" data-act="share">${esc(MParcel.t(lang, 'share'))}</button>
      <a class="sms" data-act="sms">${esc(MParcel.t(lang, 'sms'))}</a>
    </div><p id="copyMsg" class="s"></p>`;
  document.getElementById('reqText').value = text;
  const sms = box.querySelector('[data-act="sms"]');
  const phone = (P.contact_phone || '').replace(/[^\d+]/g, '');
  const body = encodeURIComponent(text);
  sms.href = (phone ? 'sms:' + phone + '?&body=' : 'sms:?&body=') + body;
  box.scrollIntoView({ block: 'start' });
}
async function saveApp(app) {
  const c = await cloud();
  if (c) {
    try {
      await c.fs.setDoc(c.fs.doc(c.db, 'applications', app.id), MParcel.pickApp(app));
      return 'cloud';
    } catch (e) {
      console.error('parcel save', e && e.code, e && e.message);
    }
  }
  const list = MParcel.loadJSON(MParcel.KEYS.apps, []);
  const apps = Array.isArray(list) ? list : [];
  apps.push(app);
  return MParcel.saveJSON(MParcel.KEYS.apps, apps.slice(-500)) ? 'local' : 'copy';
}
async function submitParcel(form) {
  const fd = new FormData(form);
  const shopSel = String(fd.get('shop') || '');
  const input = {
    senderName: String(fd.get('senderName') || '').trim(),
    senderPhone: String(fd.get('senderPhone') || '').trim(),
    shopName: shopSel === '__other' ? String(fd.get('shopCustom') || '').trim() : shopSel,
    recipientName: String(fd.get('recipientName') || '').trim(),
    recipientPhone: String(fd.get('recipientPhone') || '').trim(),
    address: String(fd.get('address') || '').trim(),
    itemType: String(fd.get('itemType') || '').trim(),
    qty: Number(fd.get('qty')),
    weightId: String(fd.get('weight') || ''),
    service: String(fd.get('service') || ''),
    date: String(fd.get('date') || ''),
    note: String(fd.get('note') || '').trim(),
    consent: !!(form.consent && form.consent.checked)
  };
  const errors = MParcel.validate(input);
  const errEl = document.getElementById('formErr');
  if (errors.length) {
    const rest = errors.filter(e => e !== 'consent');
    const msg = !rest.length ? MParcel.t(lang, 'errConsent')
      : rest.every(e => /Phone/.test(e)) ? MParcel.t(lang, 'errPhone')
      : rest.length === 1 && rest[0] === 'qty' ? MParcel.t(lang, 'errQty')
      : MParcel.t(lang, 'errRequired');
    if (errEl) errEl.textContent = msg;
    const name = errors[0] === 'weightId' ? 'weight' : errors[0];
    const el = form.querySelector('[name="' + name + '"]');
    if (el && el.focus) el.focus();
    return;
  }
  if (!MParcel.allowSubmit()) {
    if (errEl) errEl.textContent = MParcel.t(lang, 'errLimit');
    return;
  }
  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = true;
  try {
    const est = MParcel.estimate(P, input.service, input.weightId, lang);
    const app = MParcel.pickApp({
      id: MParcel.newId(),
      createdAt: MParcel.seoulStamp(new Date()),
      ...input,
      weightLabel: MParcel.weightLabel(P, input.weightId, lang),
      estimateText: est.text,
      status: 'received',
      lang: lang === 'en' ? 'en' : 'ko',
      consent: true
    });
    const where = await saveApp(app);
    showResult(where, MParcel.requestText(app, P, lang));
    form.reset();
    const inter = form.querySelector('input[value="intercity"]');
    if (inter) inter.checked = true;
    syncShop();
    updateEstimate();
    if (errEl) errEl.textContent = '';
  } finally {
    if (button) button.disabled = false;
  }
}
async function handleAct(el) {
  if (el.dataset.act === 'goto-form') {
    setTab('parcel');
    const f = document.getElementById('apply');
    if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const ta = document.getElementById('reqText');
  const text = ta ? ta.value : '';
  const say = m => { const n = document.getElementById('copyMsg'); if (n) n.textContent = m; };
  if (el.dataset.act === 'copy' || (el.dataset.act === 'share' && !navigator.share)) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      if (ta) { ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (err) { ok = false; } }
    }
    say(ok ? MParcel.t(lang, 'copied') : MParcel.t(lang, 'copyFail'));
  } else if (el.dataset.act === 'share') {
    try { await navigator.share({ text }); } catch (e) { /* 사용자가 공유를 닫은 경우 */ }
  }
}
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('.langs button').forEach(b => b.classList.toggle('on', b.dataset.lang == lang));
  $('#badge').textContent = L().badge;
  $('#appName').textContent = lang == 'en' ? 'Munchang Market Helper' : D.meta.name;
  $('#q').placeholder = L().ph;
  $('#ask button').textContent = L().send;
  $('#tabChat span').textContent = L().chat;
  $('#tabParcel span').textContent = L().parcel;
  $('#tabTl span').textContent = L().tl;
  $('#disc').innerHTML = fmtLine('ⓘ ' + (lang == 'en' ? D.disclaimer.en : D.disclaimer.ko) + (lang == 'en' ? ' Operator: Jsquare.' : ' 운영: ' + D.meta.operator))
    + '<a class="adminlink" href="admin.html?lang=' + (lang === 'en' ? 'en' : 'ko') + '">' + (lang === 'en' ? 'Admin' : '관리') + '</a>';
  renderQuick();
  renderTl();
  renderParcel();
}
function cloud() {
  if (cloudP) return cloudP;
  cloudP = (async () => {
    if (!MParcel.firebaseReady()) return null;
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
      const fs = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
      const app = initializeApp(window.FIREBASE_CONFIG);
      return { db: fs.getFirestore(app), fs };
    } catch (e) { return null; }
  })();
  return cloudP;
}
document.addEventListener('click', e => {
  const act = e.target.closest('[data-act]');
  if (act && act.dataset.act !== 'sms') { e.preventDefault(); handleAct(act); return; }
  const g = e.target.closest('[data-go]');
  if (g) { if (!g.closest('.me')) add(esc(g.textContent), 'me'); show(g.dataset.go); }
  const l = e.target.closest('[data-lang]');
  if (l) { lang = l.dataset.lang; applyLang(); $('#chat').innerHTML = ''; greet(); }
});
document.addEventListener('change', e => {
  if (e.target.closest && e.target.closest('#parcelForm')) {
    if (e.target.name === 'shop') syncShop();
    updateEstimate();
  }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'parcelForm') { e.preventDefault(); submitParcel(e.target); }
});
$('#tabChat').onclick = () => setTab('chat');
$('#tabParcel').onclick = () => setTab('parcel');
$('#tabTl').onclick = () => setTab('tl');
$('#ask').onsubmit = e => { e.preventDefault(); const v = $('#q').value.trim(); if (v) { answer(v); $('#q').value = ''; } };
window.addEventListener('storage', e => {
  if (e.key === MParcel.KEYS.settings && !cloudLive) {
    P = MParcel.merge(D.parcel_info, MParcel.loadJSON(MParcel.KEYS.settings, null));
    refreshGuide();
  }
});
fetch('data.json').then(r => r.json()).then(async d => {
  D = d;
  P = MParcel.merge(d.parcel_info, MParcel.loadJSON(MParcel.KEYS.settings, null));
  applyLang();
  greet();
  const h = location.hash.slice(1);
  if (h) show(h);
  const c = await cloud();
  if (!c) return;
  c.fs.onSnapshot(c.fs.doc(c.db, 'settings', 'parcel'), snap => {
    if (!snap.exists()) return;
    cloudLive = true;
    P = MParcel.merge(D.parcel_info, snap.data());
    refreshGuide();
  }, () => {});
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
