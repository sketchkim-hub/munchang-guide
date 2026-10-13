# 문창시장 안내 도우미 (비공식) — PWA

정적 웹앱(HTML/CSS/JS). 백엔드 없음. 모든 안내 내용은 `data.json` 하나만 고치면 됩니다.

## 실행
    cd munchang-app && python3 -m http.server 8765
    → http://localhost:8765  (서비스워커·설치는 localhost 또는 HTTPS에서만 동작)
- `?lang=en` 으로 영어 화면 바로 열기, `#parking` 처럼 해시로 특정 메뉴 열기(QR별 시작 화면용).

## 파일
index.html · style.css · app.js(로직) · data.json(내용) · manifest.json · sw.js(오프라인 캐시, 캐시 이름 `munchang-v1`: 앱 파일을 고치면 v2로 올리기. data.json은 항상 네트워크 우선) · icons/ · shots/(테스트 스크린샷)

## data.json 필드
| 필드 | 설명 |
|---|---|
| meta | name, name_en, address, address_en, phone, operator, last_checked(최종 확인일), map_url(지도 보기 버튼 링크) |
| greeting / fallback | 첫 인사 / 답을 못 찾을 때 문구. 키: ko, en (zh, ja는 준비 중 문구) |
| disclaimer | 하단 고정 면책 문구(기획서 11.2), ko / en |
| parking_lot | '지금 운영 중' 계산용. hours: 요일번호(0=일…6=토) → [시작, 끝]. 없는 요일 = 미운영. alt: 운영 외 안내할 대안 |
| delivery.departures | 당일 무료배송 출발 시각 ["09:00","13:00"] (Asia/Seoul 기준으로 다음 출발편 계산) |
| parcel_rates | 택배 요금 [{max_kg, price}] (참고용 데이터; 화면 문구는 items.parcel.answer) |
| items[] | 메뉴/주제. id, icon, label{ko,en}, keywords[](입력 문장에 포함되면 매칭, 긴 키워드일수록 우선), answer{ko:[줄…], en:[줄…]}, buttons[](다른 item id 또는 특수값 `timeline`, `map`), quick(true면 하단 빠른 메뉴에 표시) |
| timeline[] | year, text{ko,en}, source(문헌·쪽/W번호), disputed(true면 '출처 불일치·확인 필요' 표시) |
| sources | 연표 하단 출처 설명 |

### 답변 문구 규칙
- `{{next_departure}}` → 지금 시각 기준 다음 배송 출발편, `{{parking_now}}` → 공영주차장 운영 여부로 자동 치환.
- 전화번호 042-272-8903 / +82-42-272-8903, 1330 은 자동으로 전화 걸기 링크가 됩니다.
- "준비 중", "확인 필요", "coming soon", "to be confirmed" 는 자동 강조. 모르는 정보는 지어내지 말고 이 단어로 적기.
- 점포명·사진은 동의한 점포만. 문헌 속 사진·지도·스캔 원문은 이용 허락 전까지 넣지 않기(기획서 11.3).
