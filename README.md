# implant-landing-page-tiktok

임플란트 이벤트 퀴즈형 랜딩페이지. 순수 정적 페이지(`index.html`) 하나로 동작하며, 별도 서버 없이 브라우저에서 Google Apps Script로 바로 데이터를 전송합니다.

## 구조

- `index.html` — 페이지 전체 (퀴즈, 폼, 스타일, 스크립트 포함, 파일 하나로 완결)
- `apps-script/Code.gs` — Google Sheet에 붙여넣는 백엔드 코드 (완전히 새 시트를 쓸 때만 필요, 자세한 건 `마케터_사용가이드.md` 참고)
- 제출된 상담 신청은 브라우저가 `SCRIPT_URL`(Google Apps Script 웹앱 주소)로 직접 전송 → Google Sheet에 저장

## 폼 스팸 방지 (브라우저 단에서 처리)

- 이름: 자음/모음 낱자만 있는 이름, 같은 글자 반복, 욕설 단어 차단
- 전화번호: 010으로 시작하지 않거나 동일 숫자·연속 숫자 같은 장난 번호 차단
- 같은 브라우저에서 5분 이내 재제출 차단 (localStorage 기반)

> 참고: 서버가 없는 구조라 "실제 접속 IP 기준" 차단은 불가능합니다. 위 5분 제한은 브라우저 저장소 기준이라 시크릿모드/저장소 삭제로 우회될 수 있습니다. 이 부분까지 막으려면 별도 서버(API) 구성이 필요합니다.

## 새 이벤트로 복사해서 쓰는 방법

1. 이 레포를 복사 (GitHub "Use this template")
2. `index.html`에서 `SCRIPT_URL` 값을 자신의 Google Apps Script 웹앱 주소로 교체
3. 페이지 문구/가격 등 내용 수정
4. 정적 호스팅(Vercel/Netlify 등)에 그대로 업로드 — 별도 환경변수나 서버 설정 불필요
