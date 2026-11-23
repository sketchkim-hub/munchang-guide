/* 문창시장 택배 안내·신청 공통 로직. 비밀번호와 API 비밀은 두지 않습니다. */
(function (root) {
  'use strict';
  const PH = { ko: '관리자 입력 필요', en: 'Admin input needed' };
  const DEFAULT_RATES = [
    { max_kg: 2, price: 4000 },
    { max_kg: 5, price: 5000 },
    { max_kg: 10, price: 6000 },
    { max_kg: 15, price: 7000 }
  ];
  const KEYS = {
    settings: 'munchang.parcel.settings.v1',
    apps: 'munchang.parcel.apps.v1',
    auth: 'munchang.admin.local.v1',
    session: 'munchang.admin.session',
    rate: 'munchang.parcel.rl'
  };
  const APP_FIELDS = ['id', 'createdAt', 'senderName', 'senderPhone', 'shopName', 'recipientName', 'recipientPhone', 'address', 'itemType', 'qty', 'weightId', 'weightLabel', 'service', 'estimateText', 'date', 'note', 'consent', 'status', 'lang'];
  const STATUS = ['received', 'shipped', 'done', 'cancelled'];
  const STR = {
    ko: {
      apply: '택배 신청하기', seeGuide: '택배 안내', opened: '택배 신청 양식을 열었습니다. 보내는 분·받는 분과 물품을 적어 주세요.',
      from: '보내는 사람', to: '받는 사람', senderName: '이름', senderPhone: '연락처',
      shop: '점포명', shopNone: '선택 안 함', shopOther: '직접 입력', shopCustom: '점포명 직접 입력',
      shopHint: '등록된 점포가 없으면 직접 입력하세요. 점포 목록은 관리 화면에서 넣습니다.',
      recvName: '이름', recvPhone: '연락처', address: '주소',
      itemType: '물품 종류', qty: '수량·박스 수', weight: '무게 구간',
      service: '구분', intercity: '시외 택배', sameday: '대전 시내 무료 당일배송',
      date: '희망일', note: '요청사항', notePh: '없으면 비워 두세요',
      consent: '개인정보 수집·이용에 동의합니다 (필수). 수집 항목은 보내는·받는 사람의 이름, 연락처, 주소, 점포명, 물품 정보입니다. 목적은 택배 접수와 배송 연락입니다. Firebase를 연결하면 관리자 로그인으로만 목록을 봅니다. 연결하지 않으면 이 기기에만 저장되고, 카카오톡·문자로 보낸 내용은 그 앱에 남습니다.',
      submit: '신청 내용 저장', estimate: '예상 요금',
      boxFeeNote: '예상 요금은 박스(상자)에 포장된 물품·시외 택배 기준입니다. 대전 시내 당일배송은 무료입니다.',
      resultTitle: '신청 내용을 정리했습니다.',
      resultCloud: '관리 화면(Firebase)에 저장했습니다. 시장 접수는 카카오톡으로도 들어오니, 아래 내용을 함께 보내 두면 확인이 빠릅니다.',
      resultLocal: '이 브라우저의 관리 화면에 저장했습니다. 다른 기기에는 보이지 않습니다. 아래 내용을 카카오톡이나 문자로 보내 주세요.',
      resultCopy: '이 기기 저장이 되지 않았습니다. 아래 내용을 카카오톡이나 문자로 보내 주세요.',
      copy: '내용 복사', copied: '복사했습니다. 카카오톡에 붙여넣기 하세요.', share: '카카오톡 등으로 보내기', sms: '문자로 보내기',
      copyFail: '복사하지 못했습니다. 글을 길게 눌러 선택해 주세요.',
      errRequired: '비어 있는 필수 항목이 있습니다.',
      errPhone: '연락처는 숫자 8자리 이상으로 적어 주세요.',
      errQty: '박스 수는 1 이상의 숫자로 적어 주세요.',
      errConsent: '개인정보 수집 동의가 필요합니다.',
      errLimit: '짧은 시간에 신청이 여러 번 들어왔습니다. 잠시 뒤에 다시 보내 주세요.',
      cutoffPast: '오늘 시외 택배 접수 마감이 지났습니다. 다음 접수일로 넘어갈 수 있어요.',
      departPast: '오늘 당일배송 출발편은 모두 지났습니다. 다음 출발은 내일 첫 편입니다.',
      missing: '아직 없음 (관리자 입력 필요)',
      phoneAssoc: '상인회', phoneDesk: '택배 문의',
      weightCol: '무게', feeCol: '요금', upTo: '까지', over: '초과',
      nowNext: '다음 출발편', closed: '휴무일', carrier: '택배사', boxSpec: '박스 규격',
      dropoff: '접수 위치', tracking: '운송장·문의', caution: '주의사항', perCut: '출발편별 접수 마감',
      lead: '택배 접수와 대전 시내 당일배송 안내입니다.',
      outCut: '시외 택배 접수 마감', dep: '출발',
      rateTitle: '시외 택배 요금',
      askLine: '관리자에게 문의',
      status_received: '접수', status_shipped: '발송 완료', status_done: '배송 완료', status_cancelled: '취소',
      svcInter: '시외 택배', svcSame: '대전 시내 무료 당일배송'
    },
    en: {
      apply: 'Request a parcel', seeGuide: 'Parcel guide', opened: 'The parcel form is open. Enter the sender, recipient, and the item.',
      from: 'Sender', to: 'Recipient', senderName: 'Name', senderPhone: 'Phone',
      shop: 'Shop name', shopNone: 'No shop', shopOther: 'Type a name', shopCustom: 'Shop name',
      shopHint: 'If your shop is not listed, type it. The shop list is added in the admin screen.',
      recvName: 'Name', recvPhone: 'Phone', address: 'Address',
      itemType: 'Item', qty: 'Boxes', weight: 'Weight',
      service: 'Service', intercity: 'Out-of-town parcel', sameday: 'Free same-day delivery in Daejeon',
      date: 'Date wanted', note: 'Note', notePh: 'Optional',
      consent: 'I agree to the collection of personal information (required). We collect the sender and recipient name, phone, address, shop name, and item details to receive the parcel and contact you about delivery. With Firebase, only a signed-in admin can open the list. Without it, the list stays on this device, and anything you send in KakaoTalk or SMS stays in that app.',
      submit: 'Save request', estimate: 'Estimated fee',
      boxFeeNote: 'The estimate is for items packed in a box, on the out-of-town rate. Same-day delivery inside Daejeon is free.',
      resultTitle: 'Your request is ready.',
      resultCloud: 'Saved for the admin (Firebase). Market requests also come in by KakaoTalk, so send the text below as well.',
      resultLocal: 'Saved in the admin screen on this browser only. It will not appear on another phone. Send the text below by KakaoTalk or SMS.',
      resultCopy: 'Could not store it on this device. Send the text below by KakaoTalk or SMS.',
      copy: 'Copy text', copied: 'Copied. Paste it into KakaoTalk.', share: 'Share (KakaoTalk and others)', sms: 'Send by SMS',
      copyFail: 'Could not copy. Select the text and copy it.',
      errRequired: 'Please fill in the required fields.',
      errPhone: 'Enter a phone number with at least 8 digits.',
      errQty: 'Enter the number of boxes (1 or more).',
      errConsent: 'Consent is required.',
      errLimit: 'Too many requests just now. Please wait and try again.',
      cutoffPast: "Today's out-of-town cut-off has passed. It may be taken on the next open day.",
      departPast: "Today's same-day departures have all left. The next one is tomorrow's first departure.",
      missing: 'Not posted yet (admin input needed)',
      phoneAssoc: "Merchants' association", phoneDesk: 'Parcel desk',
      weightCol: 'Weight', feeCol: 'Fee', upTo: 'Up to', over: 'Over',
      nowNext: 'Next departure', closed: 'Closed days', carrier: 'Courier', boxSpec: 'Box size',
      dropoff: 'Drop-off', tracking: 'Tracking & contact', caution: 'Please note', perCut: 'Cut-off for each departure',
      lead: 'Parcel drop-off and same-day delivery in Daejeon.',
      outCut: 'Out-of-town parcel cut-off', dep: 'Departures',
      rateTitle: 'Out-of-town rates',
      askLine: 'Please ask us',
      status_received: 'Received', status_shipped: 'Shipped', status_done: 'Delivered', status_cancelled: 'Cancelled',
      svcInter: 'Out-of-town parcel', svcSame: 'Free same-day delivery in Daejeon'
    }
  };

  function t(lang, key) {
    const L = lang === 'en' ? 'en' : 'ko';
    return (STR[L] && STR[L][key]) || STR.ko[key] || key;
  }
  function esc(s) {
    return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function Lof(lang) { return lang === 'en' ? 'en' : 'ko'; }
  function toMin(s) {
    const [h, m] = String(s || '0:0').split(':');
    return (+h) * 60 + (+m);
  }
  function clock(time, lang) {
    const [hs, ms] = String(time).split(':');
    const h = +hs, m = +ms || 0;
    if (lang === 'en') {
      const ap = h < 12 ? 'AM' : 'PM';
      const h12 = h % 12 || 12;
      return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
    }
    const ap = h < 12 ? '오전' : '오후';
    const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    return m ? ap + ' ' + h12 + '시 ' + m + '분' : ap + ' ' + h12 + '시';
  }
  function won(n, lang) {
    const s = Number(n).toLocaleString('ko-KR');
    return lang === 'en' ? '₩' + s : s + '원';
  }
  function pair(over, base) {
    const o = over && typeof over === 'object' ? over : {};
    return {
      ko: typeof o.ko === 'string' ? o.ko : (base ? base.ko : ''),
      en: typeof o.en === 'string' ? o.en : (base ? base.en : '')
    };
  }
  function fillConfirmed(p) {
    if (!(p.rate_condition.ko || '').trim()) p.rate_condition.ko = '박스(상자)에 포장된 물품 기준';
    if (!(p.rate_condition.en || '').trim()) p.rate_condition.en = 'For items packed in a box';
    if (!(p.over_label.ko || '').trim()) p.over_label.ko = '별도 문의';
    if (!(p.over_label.en || '').trim()) p.over_label.en = 'Ask us';
    if (!p.same_day.title) p.same_day.title = { ko: '', en: '' };
    if (!(p.same_day.title.ko || '').trim()) p.same_day.title.ko = '대전 시내 무료 당일배송';
    if (!(p.same_day.title.en || '').trim()) p.same_day.title.en = 'Free same-day delivery within Daejeon';
    if (!/^\d{2}:\d{2}$/.test(p.cutoff.time || '')) p.cutoff.time = '13:00';
    if (!p.same_day.departures.length) p.same_day.departures = ['09:00', '13:00'];
    if (!p.rates.length) p.rates = DEFAULT_RATES.map(r => ({ ...r }));
    if (!(Number(p.over_kg) > 0)) p.over_kg = 15;
    return p;
  }
  function blank() {
    return fillConfirmed({
      notice: { ko: '', en: '' },
      cutoff: { time: '13:00' },
      same_day: { departures: ['09:00', '13:00'], free: true, title: { ko: '', en: '' }, cutoff_note: { ko: '', en: '' } },
      rates: DEFAULT_RATES.map(r => ({ ...r })),
      over_kg: 15,
      over_label: { ko: '별도 문의', en: 'Ask us' },
      rate_condition: { ko: '박스(상자)에 포장된 물품 기준', en: 'For items packed in a box' },
      box_spec: { ko: '', en: '' },
      holidays: { ko: '', en: '' },
      carrier: { ko: '', en: '' },
      dropoff: { ko: '', en: '' },
      tracking: { ko: '', en: '' },
      contact_phone: '',
      cautions: { ko: '', en: '' },
      kakao_url: '',
      shops: [],
      updatedAt: ''
    });
  }
  function merge(base, over) {
    const b = base && base.rates ? base : blank();
    const p = {
      notice: pair(over && over.notice, b.notice),
      cutoff: { time: b.cutoff && b.cutoff.time ? b.cutoff.time : '13:00' },
      same_day: {
        departures: (b.same_day && b.same_day.departures ? b.same_day.departures.slice() : ['09:00', '13:00']),
        free: b.same_day && b.same_day.free === false ? false : true,
        title: pair(b.same_day && b.same_day.title, { ko: '', en: '' }),
        cutoff_note: pair(b.same_day && b.same_day.cutoff_note, { ko: '', en: '' })
      },
      rates: (b.rates || []).map(r => ({ max_kg: Number(r.max_kg), price: Number(r.price) })),
      over_kg: Number(b.over_kg) || 15,
      over_label: pair(b.over_label, { ko: '별도 문의', en: 'Ask us' }),
      rate_condition: pair(b.rate_condition, { ko: '', en: '' }),
      box_spec: pair(b.box_spec, { ko: '', en: '' }),
      holidays: pair(b.holidays, { ko: '', en: '' }),
      carrier: pair(b.carrier, { ko: '', en: '' }),
      dropoff: pair(b.dropoff, { ko: '', en: '' }),
      tracking: pair(b.tracking, { ko: '', en: '' }),
      contact_phone: typeof b.contact_phone === 'string' ? b.contact_phone : '',
      cautions: pair(b.cautions, { ko: '', en: '' }),
      kakao_url: typeof b.kakao_url === 'string' ? b.kakao_url : '',
      shops: Array.isArray(b.shops) ? b.shops.map(s => String(s)) : [],
      updatedAt: typeof b.updatedAt === 'string' ? b.updatedAt : ''
    };
    if (over && typeof over === 'object') {
      if (over.notice) p.notice = pair(over.notice, p.notice);
      if (over.cutoff && /^\d{2}:\d{2}$/.test(over.cutoff.time || '')) p.cutoff.time = over.cutoff.time;
      if (over.same_day && typeof over.same_day === 'object') {
        if (Array.isArray(over.same_day.departures)) {
          const ds = over.same_day.departures.filter(t => /^\d{2}:\d{2}$/.test(t));
          if (ds.length) p.same_day.departures = ds;
        }
        if (typeof over.same_day.free === 'boolean') p.same_day.free = over.same_day.free;
        if (over.same_day.title) p.same_day.title = pair(over.same_day.title, p.same_day.title);
        if (over.same_day.cutoff_note) p.same_day.cutoff_note = pair(over.same_day.cutoff_note, p.same_day.cutoff_note);
      }
      if (Array.isArray(over.rates)) {
        const rates = over.rates.map(r => ({ max_kg: Number(r.max_kg), price: Number(r.price) }))
          .filter(r => r.max_kg > 0 && r.max_kg < 1000 && r.price >= 0 && r.price < 10000000);
        if (rates.length) p.rates = rates.sort((a, c) => a.max_kg - c.max_kg);
      }
      if (Number(over.over_kg) > 0) p.over_kg = Number(over.over_kg);
      if (over.over_label) p.over_label = pair(over.over_label, p.over_label);
      ['rate_condition', 'box_spec', 'holidays', 'carrier', 'dropoff', 'tracking', 'cautions'].forEach(k => {
        if (over[k]) p[k] = pair(over[k], p[k]);
      });
      if (typeof over.contact_phone === 'string') p.contact_phone = over.contact_phone.slice(0, 40);
      if (typeof over.kakao_url === 'string') {
        const u = over.kakao_url.trim().slice(0, 300);
        p.kakao_url = (u === '' || u.startsWith('https://')) ? u : p.kakao_url;
      }
      if (Array.isArray(over.shops)) p.shops = over.shops.map(s => String(s).trim()).filter(Boolean).slice(0, 200);
      if (typeof over.updatedAt === 'string') p.updatedAt = over.updatedAt.slice(0, 40);
    }
    return fillConfirmed(p);
  }
  function weightLabel(settings, weightId, lang) {
    const en = lang === 'en';
    if (weightId === 'over') return en ? 'Over ' + settings.over_kg + ' kg' : settings.over_kg + 'kg 초과';
    const row = settings.rates.find(r => String(r.max_kg) === String(weightId));
    if (!row) return '';
    return en ? 'Up to ' + row.max_kg + ' kg' : row.max_kg + 'kg까지';
  }
  function estimate(settings, service, weightId, lang) {
    const en = lang === 'en';
    const cond = (settings.rate_condition[en ? 'en' : 'ko'] || '').trim();
    if (service === 'sameday' && settings.same_day.free !== false) {
      return { kind: 'free', price: 0, text: en ? 'Free (same-day delivery within Daejeon)' : '무료 (대전 시내 당일배송)' };
    }
    if (weightId === 'over') {
      const label = (settings.over_label[en ? 'en' : 'ko'] || '').trim() || (en ? 'Ask us' : '별도 문의');
      const text = en
        ? label + ' (over ' + settings.over_kg + ' kg' + (cond ? ', ' + cond : '') + ')'
        : label + ' (' + settings.over_kg + 'kg 초과' + (cond ? ', ' + cond : '') + ')';
      return { kind: 'ask', price: null, text };
    }
    const row = settings.rates.find(r => String(r.max_kg) === String(weightId));
    if (!row) return { kind: 'none', price: null, text: en ? '—' : '—' };
    const text = en
      ? won(row.price, 'en') + ' (up to ' + row.max_kg + ' kg' + (cond ? ', ' + cond : '') + ')'
      : won(row.price, 'ko') + ' (' + row.max_kg + 'kg까지' + (cond ? ', ' + cond : '') + ')';
    return { kind: 'priced', price: row.price, text };
  }
  function nextDepartureLine(settings, lang, now) {
    const en = lang === 'en';
    const deps = settings.same_day.departures;
    const d = deps.find(tm => toMin(tm) > now.min);
    const when = d ? (en ? 'today ' : '오늘 ') + clock(d, en ? 'en' : 'ko') : (en ? 'tomorrow ' : '내일 ') + clock(deps[0], en ? 'en' : 'ko');
    if (en) return 'Now ' + now.hm + ' (Korea time) → next departure: ' + when + '.';
    return '지금 ' + now.hm + '(한국 시간) → 다음 출발편: ' + when + '.';
  }
  function todayKey(now) {
    return now.y + '-' + String(now.m).padStart(2, '0') + '-' + String(now.d).padStart(2, '0');
  }
  function cutoffWarning(settings, lang, now, service, dateStr) {
    if (!dateStr || dateStr !== todayKey(now)) return '';
    if (service === 'intercity' && now.min >= toMin(settings.cutoff.time)) return t(lang, 'cutoffPast');
    if (service === 'sameday') {
      const last = settings.same_day.departures.map(toMin).sort((a, b) => a - b).pop();
      if (now.min >= last) return t(lang, 'departPast');
    }
    return '';
  }
  function phoneOk(s) {
    const v = String(s || '').trim();
    const digits = v.replace(/\D/g, '');
    return /^[0-9+()\-\s]{8,20}$/.test(v) && digits.length >= 8 && digits.length <= 15;
  }
  function validate(input) {
    const errors = [];
    const need = (k, ok) => { if (!ok) errors.push(k); };
    const short = s => String(s || '').trim();
    need('senderName', short(input.senderName) && short(input.senderName).length <= 80);
    need('senderPhone', phoneOk(input.senderPhone));
    need('recipientName', short(input.recipientName) && short(input.recipientName).length <= 80);
    need('recipientPhone', phoneOk(input.recipientPhone));
    need('address', short(input.address) && short(input.address).length <= 300);
    need('itemType', short(input.itemType) && short(input.itemType).length <= 120);
    const qty = Number(input.qty);
    need('qty', Number.isInteger(qty) && qty >= 1 && qty <= 999);
    need('service', input.service === 'intercity' || input.service === 'sameday');
    need('weightId', !!short(input.weightId));
    need('date', /^\d{4}-\d{2}-\d{2}$/.test(short(input.date)));
    need('consent', input.consent === true);
    if (short(input.note).length > 500) errors.push('note');
    if (short(input.shopName).length > 80) errors.push('shopName');
    return errors;
  }
  function seoulStamp(d) {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(dt);
    const g = ty => parts.find(x => x.type === ty).value;
    return g('year') + '-' + g('month') + '-' + g('day') + ' ' + g('hour') + ':' + g('minute');
  }
  function newId(date) {
    const day = seoulStamp(date || new Date()).slice(0, 10).replace(/-/g, '');
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(4);
    (root.crypto || crypto).getRandomValues(bytes);
    let s = '';
    for (const b of bytes) s += alphabet[b % alphabet.length];
    return 'MC-' + day + '-' + s;
  }
  function serviceLabel(service, lang) {
    return t(lang, service === 'sameday' ? 'svcSame' : 'svcInter');
  }
  function statusLabel(status, lang) {
    return t(lang, 'status_' + (STATUS.includes(status) ? status : 'received'));
  }
  function requestBlock(app, settings, lang) {
    const en = lang === 'en';
    const lines = [
      en ? '[Munchang Market parcel request]' : '[문창시장 택배 신청]',
      (en ? 'No. ' : '접수번호 ') + app.id,
      (en ? 'Time: ' : '접수시각 ') + app.createdAt,
      (en ? 'Service: ' : '구분: ') + serviceLabel(app.service, lang),
      (en ? 'From: ' : '보내는 사람: ') + app.senderName + ' / ' + app.senderPhone + (app.shopName ? ' / ' + app.shopName : ''),
      (en ? 'To: ' : '받는 사람: ') + app.recipientName + ' / ' + app.recipientPhone,
      (en ? 'Address: ' : '주소: ') + app.address,
      (en ? 'Item: ' : '물품: ') + app.itemType,
      (en ? 'Boxes: ' : '수량·박스 수: ') + app.qty,
      (en ? 'Weight: ' : '무게: ') + app.weightLabel,
      (en ? 'Estimate: ' : '예상 요금: ') + app.estimateText,
      (en ? 'Packing: ' : '포장 조건: ') + (settings.rate_condition[en ? 'en' : 'ko'] || ''),
      (en ? 'Date wanted: ' : '희망일: ') + app.date,
      (en ? 'Note: ' : '요청사항: ') + (app.note || '-')
    ];
    return lines.join('\n');
  }
  function requestText(app, settings, lang) {
    const ko = requestBlock(app, settings, 'ko');
    if (lang === 'en') return ko + '\n\n----\n' + requestBlock(app, settings, 'en');
    return ko;
  }
  function pickApp(app) {
    const o = {};
    APP_FIELDS.forEach(k => { o[k] = app[k]; });
    o.qty = Number(o.qty);
    o.consent = true;
    o.shopName = String(o.shopName || '');
    o.note = String(o.note || '');
    o.estimateText = String(o.estimateText || '');
    o.weightLabel = String(o.weightLabel || '');
    o.weightId = String(o.weightId || '');
    o.lang = String(o.lang || 'ko');
    o.status = STATUS.includes(o.status) ? o.status : 'received';
    return o;
  }
  function rateTableHTML(S, lang) {
    const en = lang === 'en';
    const cond = esc(S.rate_condition[en ? 'en' : 'ko']);
    const title = esc(t(lang, 'rateTitle'));
    let rows = S.rates.map(r => {
      const w = en ? 'Up to ' + r.max_kg + ' kg' : r.max_kg + 'kg까지';
      return '<tr><td>' + esc(w) + '</td><td>' + esc(won(r.price, en ? 'en' : 'ko')) + '</td></tr>';
    }).join('');
    const ow = en ? 'Over ' + S.over_kg + ' kg' : S.over_kg + 'kg 초과';
    rows += '<tr><td>' + esc(ow) + '</td><td>' + esc(S.over_label[en ? 'en' : 'ko']) + '</td></tr>';
    return '<table class="rates"><caption><b>' + title + '</b><span class="cond">' + cond + '</span></caption><thead><tr><th>' +
      esc(t(lang, 'weightCol')) + '</th><th>' + esc(t(lang, 'feeCol')) + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function guideHTML(S, lang, now, phone) {
    const en = lang === 'en';
    const L = en ? 'en' : 'ko';
    const shown = en && phone === '042-272-8903' ? '+82-42-272-8903' : (phone || '042-272-8903');
    let h = '<div class="guide">';
    if (lang === 'zh' || lang === 'ja') {
      h += '<p class="pending">' + (lang === 'zh' ? '中文版本：准备中' : '日本語版：準備中') + '</p>';
    }
    const notice = (S.notice[L] || '').trim();
    if (notice) h += '<p class="warn">' + esc(notice) + '</p>';
    h += '<p>' + esc(t(lang, 'lead')) + '</p>';
    const title = (S.same_day.title && S.same_day.title[L]) || (en ? 'Free same-day delivery within Daejeon' : '대전 시내 무료 당일배송');
    h += '<p><b>' + esc(title) + '</b>\n' + esc(t(lang, 'dep')) + ': ' +
      S.same_day.departures.map(tm => esc(clock(tm, L))).join(' · ') + '\n' + esc(nextDepartureLine(S, lang, now)) + '</p>';
    const per = (S.same_day.cutoff_note[L] || '').trim();
    h += '<p><b>' + esc(t(lang, 'perCut')) + '</b>\n' + (per ? esc(per) : '<span class="pending">' + esc(PH[L]) + '</span>') + '</p>';
    h += '<p><b>' + esc(t(lang, 'outCut')) + '</b>\n' + esc(clock(S.cutoff.time, L)) + '</p>';
    h += rateTableHTML(S, lang);
    const extras = [
      [t(lang, 'boxSpec'), S.box_spec[L]],
      [t(lang, 'carrier'), S.carrier[L]],
      [t(lang, 'dropoff'), S.dropoff[L]],
      [t(lang, 'closed'), S.holidays[L]],
      [t(lang, 'tracking'), S.tracking[L]],
      [t(lang, 'caution'), S.cautions[L]]
    ];
    const missing = [];
    extras.forEach(([label, val]) => {
      if ((val || '').trim()) h += '<p><b>' + esc(label) + '</b>\n' + esc(val) + '</p>';
      else missing.push(label);
    });
    h += '<p><b>' + esc(en ? 'Phone' : '전화') + '</b>\n' + esc(t(lang, 'phoneAssoc')) +
      ' <a class="tel" href="tel:+82422728903">' + esc(shown) + '</a>';
    if ((S.contact_phone || '').trim()) {
      const tel = S.contact_phone.replace(/[^\d+]/g, '');
      h += '\n' + esc(t(lang, 'phoneDesk')) + ' <a class="tel" href="tel:' + esc(tel) + '">' + esc(S.contact_phone) + '</a>';
    } else missing.push(en ? 'Parcel desk phone' : '택배 전용 연락처');
    h += '</p>';
    if (missing.length) h += '<p class="pending">' + esc(t(lang, 'missing')) + ': ' + esc(missing.join(', ')) + '</p>';
    if ((S.kakao_url || '').startsWith('https://')) {
      h += '<p><a href="' + esc(S.kakao_url) + '" target="_blank" rel="noopener">' + (en ? 'Open chat link' : '상담 링크 열기') + '</a></p>';
    }
    if (S.updatedAt) h += '<p class="s">' + (en ? 'Guide updated: ' : '안내 수정: ') + esc(seoulStamp(S.updatedAt)) + '</p>';
    h += '</div>';
    return h;
  }
  function csvCell(v) {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function appRow(a) {
    return [a.id, a.createdAt, statusLabel(a.status, 'ko'), a.senderName, a.senderPhone, a.shopName || '',
      a.recipientName, a.recipientPhone, a.address, a.itemType, a.qty, a.weightLabel,
      serviceLabel(a.service, 'ko'), a.estimateText, a.date, a.note || ''];
  }
  function csvHeaders() {
    return ['신청번호', '접수시각', '상태', '보내는사람', '보내는연락처', '점포명', '받는사람', '받는연락처', '주소', '물품', '박스수', '무게', '구분', '예상요금', '희망일', '요청사항'];
  }
  function toCSV(apps) {
    const lines = [csvHeaders().map(csvCell).join(',')];
    apps.forEach(a => lines.push(appRow(a).map(csvCell).join(',')));
    return '\uFEFF' + lines.join('\r\n');
  }
  function toXLS(apps) {
    const head = '<tr>' + csvHeaders().map(h => '<th>' + esc(h) + '</th>').join('') + '</tr>';
    const body = apps.map(a => '<tr>' + appRow(a).map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('');
    return '<html><head><meta charset="utf-8"></head><body><table>' + head + body + '</table></body></html>';
  }
  function loadJSON(key, fallback) {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) { return false; }
  }
  function allowSubmit() {
    const now = Date.now();
    let arr = loadJSON(KEYS.rate, []);
    if (!Array.isArray(arr)) arr = [];
    arr = arr.filter(n => typeof n === 'number' && now - n < 10 * 60 * 1000);
    if (arr.length >= 5) return false;
    arr.push(now);
    saveJSON(KEYS.rate, arr);
    return true;
  }
  function firebaseReady() {
    const c = root.FIREBASE_CONFIG;
    return !!(c && typeof c === 'object' && c.apiKey && c.projectId && c.authDomain && c.appId
      && !/YOUR_|REPLACE|example/i.test(String(c.apiKey) + String(c.projectId)));
  }

  root.MParcel = {
    PH, KEYS, APP_FIELDS, STATUS, DEFAULT_RATES, t, esc, toMin, clock, won, blank, merge, fillConfirmed,
    weightLabel, estimate, nextDepartureLine, cutoffWarning, todayKey, phoneOk, validate, seoulStamp, newId,
    serviceLabel, statusLabel, requestText, pickApp, guideHTML, rateTableHTML, toCSV, toXLS, loadJSON, saveJSON,
    allowSubmit, firebaseReady
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
