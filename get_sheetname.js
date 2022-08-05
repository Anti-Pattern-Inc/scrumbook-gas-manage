// シート名を取得する関数を作成する
function sheetname() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}