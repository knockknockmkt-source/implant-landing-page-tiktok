# implant-quiz-ad

임플란트 이벤트 퀴즈형 랜딩페이지. 정적 페이지(`index.html`) + Vercel 서버 함수(`api/submit.js`)로 구성되어 있고, 제출된 상담 신청은 Google Apps Script를 통해 Google Sheet로 저장됩니다.

## 구조

- `index.html` — 페이지 전체 (퀴즈, 폼, 스타일, 스크립트 포함)
- `api/submit.js` — 폼 제출을 대신 처리하는 Vercel 서버 함수
  - 이름/전화번호는 브라우저에서 1차로 검증 (욕설·초성만·장난 번호 차단)
  - 서버에서 요청자 IP 기준으로 5분 이내 중복 제출을 차단 (Upstash Redis 사용, 없어도 폼 자체는 동작함)
  - 검증을 통과한 데이터만 Google Apps Script로 전달

## 새 이벤트로 복사해서 쓰는 방법

이 레포를 그대로 다른 도메인/이벤트에 재사용하려면:

1. **이 레포를 템플릿으로 복사** (GitHub의 "Use this template")해서 새 레포 생성
   - 레포 이름은 `Vercel 프로젝트 이름`, `배포 도메인`과 통일하는 것을 권장 (예: `implant-quiz-event5xx`)
2. **자신의 Google Sheet + Apps Script 준비**
   - 새 시트를 만들고, Apps Script를 웹앱으로 배포해서 `.../exec` 로 끝나는 주소를 발급받기
3. **Vercel에 새 프로젝트로 배포**
   ```
   vercel
   vercel --prod
   ```
4. **환경변수 등록** (Vercel 프로젝트 → Settings → Environment Variables)
   - `APPS_SCRIPT_URL` : 2번에서 발급받은 주소 (필수)
   - `UPSTASH_REDIS_KV_REST_API_URL`, `UPSTASH_REDIS_KV_REST_API_TOKEN` : IP 5분 제한을 쓰려면 등록 (선택)
     - Vercel Storage에서 **Upstash for Redis** 통합 추가 시 Custom Prefix를 `UPSTASH_REDIS`로 입력하면 이 이름 그대로 생성됨
   - 자세한 값 형식은 `.env.example` 참고
5. 환경변수 등록 후 **다시 배포**해서 반영 (`vercel --prod`)

`APPS_SCRIPT_URL`을 등록하지 않으면 폼 제출 시 서버가 500 에러를 반환합니다 (실수로 다른 사람의 시트로 데이터가 넘어가는 것을 막기 위한 안전장치).

## 텍스트/가격만 수정하고 싶을 때

개발 환경 없이 수정하려면, Vercel 프로젝트를 이 GitHub 레포와 연결해두고 GitHub 웹사이트에서 `index.html`을 직접 열어 수정 후 커밋하면 자동으로 재배포됩니다.

## 참고

- 이 레포에는 Google Apps Script(.gs) 소스가 포함되어 있지 않습니다. 시트 쪽 코드는 Google 계정에 별도로 있으니 필요시 직접 복사해서 새 프로젝트에 붙여넣어야 합니다.
