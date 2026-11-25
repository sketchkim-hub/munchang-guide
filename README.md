# 문창시장 안내 도우미 (비공식) — PWA

정적 웹앱(HTML/CSS/JS). 백엔드 없음. 모든 안내 내용은 `data.json` 하나만 고치면 됩니다.

## 실행
    cd munchang-app && python3 -m http.server 8765
    → http://localhost:8765  (서비스워커·설치는 localhost 또는 HTTPS에서만 동작)
- `?lang=en` 으로 영어 화면 바로 열기, `#parking` 처럼 해시로 특정 메뉴 열기(QR별 시작 화면용).

## 파일
index.html · style.css · app.js(로직) · parcel.js(택배 공통) · admin.html · admin.js · firebase-config.js · firestore.rules · data.json(내용) · manifest.json · sw.js(오프라인 캐시, 캐시 이름 `munchang-v9`: 앱 파일을 고치면 번호를 올리기. data.json과 firebase-config.js는 네트워크 우선) · icons/ · shots/(테스트 스크린샷)

## data.json 필드
| 필드 | 설명 |
|---|---|
| meta | name, name_en, address, address_en, phone, operator, last_checked(최종 확인일), map_url(지도 보기 버튼 링크) |
| greeting / fallback | 첫 인사 / 답을 못 찾을 때 문구. 키: ko, en (zh, ja는 준비 중 문구) |
| disclaimer | 하단 고정 면책 문구(기획서 11.2), ko / en |
| parking_lot | '지금 운영 중' 계산용. hours: 요일번호(0=일…6=토) → [시작, 끝]. 없는 요일 = 미운영. alt: 운영 외 안내할 대안 |
| parcel_info | 택배 안내의 기본값. 챗봇·택배 탭·신청 예상 요금이 이 값을 쓰고, 관리 화면에서 고친 내용이 있으면 그 값이 우선합니다. |
| parcel_rates | 참고용 요금표. 화면은 parcel_info.rates 를 사용합니다. |
| items[] | 메뉴/주제. id, icon, label{ko,en}, keywords[](입력 문장에 포함되면 매칭, 긴 키워드일수록 우선), answer{ko:[줄…], en:[줄…]}, buttons[](다른 item id 또는 특수값 `timeline`, `map`), quick(true면 하단 빠른 메뉴에 표시) |
| timeline[] | year, text{ko,en}, source(문헌·쪽/W번호), disputed(true면 '출처 불일치·확인 필요' 표시) |
| sources | 연표 하단 출처 설명 |

### 답변 문구 규칙
- `{{parking_now}}` → 공영주차장 운영 여부로 자동 치환.
- 전화번호 042-272-8903 / +82-42-272-8903, 1330 은 자동으로 전화 걸기 링크가 됩니다.
- "준비 중", "확인 필요", "coming soon", "to be confirmed", "관리자 입력 필요", "Admin input needed" 는 자동 강조. 모르는 정보는 지어내지 말고 이 단어로 적기.
- 점포명·사진은 동의한 점포만. 문헌 속 사진·지도·스캔 원문은 이용 허락 전까지 넣지 않기(기획서 11.3).

## 택배 신청 · 관리

손님은 택배 탭, 빠른 버튼 「택배 신청」, 또는 「택배 신청」「택배 보내기」 같은 말로 신청합니다. 영어는 `?lang=en`.

확인해서 넣어 둔 기본값만 있습니다.

- 시외 택배 접수 마감: 오후 1시
- 박스(상자)에 포장된 물품 기준 요금: 2kg 4,000원 / 5kg 5,000원 / 10kg 6,000원 / 15kg 7,000원 / 15kg 초과는 별도 문의

택배사, 박스 규격, 휴무일, 접수 위치, 운송장 연락처, 주의사항은 비어 있으면 「관리자 입력 필요」로 보입니다. 관리 화면의 안내 입력칸은 한국어만 있습니다. 영어 안내(?lang=en)는 저장된 영어가 있으면 그대로 쓰고, 없으면 기본 영어 문구(요금 조건·초과 안내)를, 그것도 없으면 한국어를 보여 줍니다.

관리 화면은 [admin.html](admin.html) 입니다. 안내 챗봇 하단의 「관리」로도 들어갑니다.

### 왜 저장이 두 갈래인가

이 저장소는 정적 사이트이고 Firebase·점포 계정 같은 백엔드는 원래 없습니다. 신청서에는 이름·전화·주소가 있으므로 GitHub 파일로 저장하지 않습니다.

1. **지금 바로 되는 방법.** 신청 내용을 이 브라우저에 저장하고, 카카오톡·문자로 붙여넣을 수 있게 복사합니다. 시장 주문이 이미 카카오톡으로 들어오기 때문입니다. 관리 화면의 비밀번호는 이 브라우저만 잠그며, 서버가 확인하지 않아서 개발자 도구로 우회할 수 있습니다. 안내 수정과 신청 목록은 그 브라우저에만 있습니다.
2. **모든 손님·모든 관리 기기에 반영하려면 Firebase.** 아래 순서를 끝낸 뒤에만 연결하세요. `firebase-config.js`의 apiKey는 웹에 공개되는 값이고 비밀번호가 아닙니다. 비밀번호는 Authentication 사용자로만 만듭니다.

### Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만듭니다.
2. Authentication → Sign-in method에서 이메일/비밀번호를 켭니다.
3. Authentication → Users에서 관리자 계정을 만듭니다. 비밀번호는 저장소에 넣지 마세요.
4. Firestore Database를 프로덕션 모드로 만듭니다. 위치는 asia-northeast3(서울)을 권합니다.
5. Firestore → 규칙에 `firestore.rules` 내용을 붙여넣고 **게시**합니다. 규칙을 게시하기 전에 웹 설정을 넣으면 신청서의 개인정보가 공개될 수 있습니다.
6. 웹 앱 설정은 `firebase-config.js`에 프로젝트 `munchang-guide`로 들어가 있습니다. apiKey는 공개값입니다.
7. Authentication → Settings → Authorized domains에 `sketchkim-hub.github.io`가 있는지 확인합니다. 없으면 로그인 버튼이 GitHub Pages에서 거절됩니다.
8. 관리자 계정을 만든 뒤 `admin.html`에서 그 이메일과 비밀번호로 로그인합니다. 안내 저장은 손님 화면에 반영되고, 신청 목록·상태 변경·CSV·엑셀 내려받기가 기기와 상관없이 됩니다.

`settings/parcel` 문서가 없으면 안내와 요금표는 `data.json`의 기본값을 그대로 보여 줍니다. 손님 신청은 `applications`에 저장되고, 목록은 로그인한 관리자만 봅니다.
