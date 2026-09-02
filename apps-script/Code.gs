/**
 * 완전히 새로운 구글시트를 쓸 때만 필요합니다.
 * (기존 시트를 그대로 쓰고 탭만 추가하는 경우에는 이 코드가 필요 없습니다 —
 *  기존 스프레드시트에 이미 이 코드가 배포되어 있습니다.)
 *
 * 설치 방법
 * 1. 구글시트 상단 메뉴 "확장 프로그램 > Apps Script" 클릭
 * 2. 기본 코드 지우고 이 파일 내용 전체를 붙여넣기
 * 3. 저장 (Ctrl+S)
 * 4. 우측 상단 "배포 > 새 배포"
 *    - 유형: "웹 앱"
 *    - 실행 계정: 나
 *    - 액세스 권한: 전체
 * 5. 배포 후 나오는 웹 앱 URL(.../exec 로 끝남)을 복사
 * 6. 그 주소를 index.html의 SCRIPT_URL 값에 붙여넣기
 */

// 구글시트가 "=", "+", "-", "@"로 시작하는 값을 수식으로 해석하는 걸 막기 위한 처리
// (스프레드시트 수식 삽입 공격 방지)
function sanitizeCell(value) {
  var str = String(value == null ? '' : value);
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('요청 본문이 비어있습니다.');
    }

    var data = JSON.parse(e.postData.contents);
    var tabName = String(data['탭'] || '기타').replace(/[:\\\/\?\*\[\]]/g, '_');

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      sheet.appendRow(['제출시간', '이름', '연락처', '시술종류', '시술시기']);
    }

    sheet.appendRow([
      data['제출시간'] || new Date(),
      sanitizeCell(data['이름']),
      sanitizeCell(data['연락처']),
      sanitizeCell(data['시술종류']),
      sanitizeCell(data['시술시기'])
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
