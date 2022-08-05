function makeIssues() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // GitHubの情報
  var OWNER = "nn-nissy1010"; // レポジトリのオーナー名を入れてください
  var ACCESS_TOKEN = "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"; // 上記で発行したaccess tokenを入れてください
  var project_id
  // スプレッドシートの情報
  //コメントアウトにあるものの列番号を記入して下さい
  var title_column_no = 1; //issueタイトル(タスク内容)
  var description_column_no = 2;  //issueの本文(要件)
  var issue_size = 3; //サイズ
  var issue_assign = 4; //担当
  var repo_column_no = 5; //レポジトリ名
  var project_column_no = 6; //プロジェクト名
  var issue_url_column_no = 7; //Issueリンク
  var issue_id_column_no = 8; //IssueId
  // 選択しているセルの開始行番号を取得
  var upper_left_cell = sheet.getActiveCell();
  var start_row = upper_left_cell.getRow();
  // 選択しているセルの行数を取得
  var range = SpreadsheetApp.getActiveRange();
  var rows = range.getNumRows();
  // 確認ダイアログ
  var message = '';
  var start_title = sheet.getRange(start_row, title_column_no).getValue();
  message += start_title;
  if (rows > 1) {
    message += ' など' + rows + '行';
  }
  var result = Browser.msgBox('Issueを作成します。よろしいですか？', message, Browser.Buttons.OK_CANCEL);
  if (result == 'cancel') {
    return;
  }
  // Issue作成
  for (var i = 0; i < rows; i++) {
    var row = start_row + i;
    var title = sheet.getRange(row, title_column_no).getValue();
    var description = sheet.getRange(row, description_column_no).getValue();
    var repo = sheet.getRange(row,repo_column_no).getValue();
    var project = sheet.getRange(row, project_column_no).getValue();
    var label = sheet.getRange(row, issue_size).getValues().toString().split(',');
    var assign = sheet.getRange(row, issue_assign).getValues().toString().split(',');
    var milestone = sheet.getRange(row, 10).getValues();
    Logger.log(milestone)
    var issue_payload = {
      "title": title,
      "body": description,
      "labels" : label,
      "assignees": assign,
      "milestone" : 2,
    };
    var response_data = createIssue(issue_payload, repo);
    sheet.getRange(row, issue_url_column_no).setValue(response_data['html_url']);
    sheet.getRange(row, issue_id_column_no).setValue(response_data['id']);
   var project_header = {
     "Authorization": "Basic " + Utilities.base64Encode(ACCESS_TOKEN),
     "Accept": "application/vnd.github.symmetra-preview+json",
     "Content-Type": "application/json",
   };
     var project_payload = JSON.stringify({
    "content_id": response_data.id,
    "content_type" : "Issue",
  });
    var get_options = {
      "method" : "get",
      "headers" : project_header
    }
    var push_options = {
    "method" : "POST",
    "headers" : project_header,
    "payload" : project_payload
  }

   //プロジェクトの取得
  var project_url = "https://api.github.com/repos/" +  OWNER + "/" + repo + "/" + "projects?access_token=" + ACCESS_TOKEN;
  var project_response = JSON.parse(UrlFetchApp.fetch(project_url, get_options));
  project_response.forEach(function(project_response){
  if( project_response["name"] == project ){
    Logger.log(project_response["name"])
    project_id = project_response["id"]
  }
});
    //カラムの取得
  var column_url = "https://api.github.com/projects/" + project_id +"/columns?access_token=" + ACCESS_TOKEN;
  var column_response = JSON.parse(UrlFetchApp.fetch(column_url, get_options));

    //カードのpush
   var push_url = "https://api.github.com/projects/columns/" + column_response[0].id + "/cards?access_token=" + ACCESS_TOKEN;
  JSON.parse(UrlFetchApp.fetch(push_url, push_options));
  }

  function createIssue(payload, repo) {
    var issue_url = "https://api.github.com/repos/"+ OWNER + "/" + repo + "/issues";
    
     var issue_header = {
     "Authorization": "Basic " + Utilities.base64Encode(ACCESS_TOKEN),
     "Accept": "application/vnd.github.symmetra-preview+json",
     "Content-Type": "application/json",
   };
    var issue_options = {
      "method" : "post",
      "payload" : JSON.stringify(payload),
      "headers" : issue_header,
    };
    var response = UrlFetchApp.fetch(issue_url, issue_options);
    var response_data = JSON.parse(response.getContentText());
     Logger.log(response_data.id);  
     return response_data;
}
}

function onOpen() {
  // メニューバーにカスタムメニューを追加
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {name : "Issueを作成する", functionName : "makeIssues"},
  ];
  spreadsheet.addMenu("GAS", entries);
}
