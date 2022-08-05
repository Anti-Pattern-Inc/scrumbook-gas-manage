//現在のスプリントのシートをactiveシートにするようにしてください
function getProjectList() {

  const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet(); // 現在のSpreadSheetを取得
  const sheet = activeSpreadSheet.getActiveSheet(); // 現在のスプリントをactiveシートにすること

  // スプレッドシートの情報
  //コメントアウトの横にあるものの列番号を記入して下さい
  project_index = 2;//プロジェクトの個数

  const projects = sheet.getRange(2, 5, project_index, 2).getValues();
  Logger.log(projects);
  var project_column_no = 6; //プロジェクト名
  var issue_id_column_no = 8; //issueId
  var status_column_no = 9; //issueのステータス
  var issue_start_raw_no = 8; //issueの一覧の最初の行ナンバー(タイトル行は除く)
  projects.forEach(function (project) {

    // GitHubの情報
    var repository = project[0]; // 出したいレポジトリ名を入れてください
    var project_name2 = project[1]; // 使いたいproject名を入力して下さい
    var project_id
    var projectSheet = activeSpreadSheet.getSheetByName(project_name2); // シート(SpreadSheetの下のタブ名を指定)
    if (projectSheet == null) {
      activeSpreadSheet.insertSheet(project_name2);
      projectSheet = activeSpreadSheet.getSheetByName(project_name2);
    }
    projectSheet.clear();

    var header = {
      "Authorization": "Basic " + Utilities.base64Encode(token),
      "Accept": "application/vnd.github.symmetra-preview+json",
      "Content-Type": "application/json",
    };

    var options = {
      "method": "get",
      "headers": header
    }

    //プロジェクトの取得
    var project_url = "https://api.github.com/repos/" + user + "/" + repository + "/" + "projects?access_token=" + token;
    var project_response = JSON.parse(UrlFetchApp.fetch(project_url, options));
    project_response.forEach(function (project_response) {
      Logger.log(project_name2);
      if (project_response["name"] == project_name2) {
        // Logger.log(project_response["name"])
        project_id = project_response["id"]
      }
    });

    //カラムの取得
    var column_url = "https://api.github.com/projects/" + project_id + "/columns?access_token=" + token;
    var column_response = JSON.parse(UrlFetchApp.fetch(column_url, options));
    column_response.forEach(function (column, index) {
      var column_name = column.name;
      projectSheet.getRange(1, index + 1).setValue(column_name)

      //カード一覧の取得→projectシートに反映
      var cards_url = "https://api.github.com/projects/columns/" + column.id + "/cards?access_token=" + token;
      var cards_response = JSON.parse(UrlFetchApp.fetch(cards_url, options));
      cards_response.forEach(function (card, index2) {
        var card_url = card.content_url + '&access_token=' + token;
        var card_response = UrlFetchApp.fetch(card_url, options);
        var json = card_response.getContentText();
        var json2 = JSON.parse(json);
        projectSheet.getRange(index2 + 2, index + 1).setValue(json2.id)
      })
    });
  });

  //issueのステータスを反映させる
  var lastRow = sheet.getLastRow()
  for (var i = issue_start_raw_no; i <= lastRow; i++) {
    var issueId_sell = sheet.getRange(i, issue_id_column_no);  //issueIdのセル取得
    var project_sell = sheet.getRange(i, project_column_no);  //projectのセル取得
    var issueId = issueId_sell.getValue(); //issueIdのセルの値を取得
    var project = project_sell.getValue(); //projectのセルの値を取得
    var getProjectSheet = activeSpreadSheet.getSheetByName(project);
    var textFinder = getProjectSheet.createTextFinder(issueId);
    var cells = textFinder.findAll();
    var column = cells[0].getColumn();
    var status = getProjectSheet.getRange(1, column).getValue();
    sheet.getRange(i, status_column_no).setValue(status); //ステータスの反映
  }
}
