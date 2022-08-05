const GITHUB_KEY = "github_key";

function setGithubKey() {
  var ui = SpreadsheetApp.getUi();
  var prompt = ui.prompt("アクセストークンを入力")
  var res = prompt.getResponseText();

  var prop = PropertiesService.getUserProperties();
  prop.setProperty("acsess_token", res);
}

// GitHubキー確認用
function showGithubKey() {
  var prop = PropertiesService.getUserProperties();
  var github_key = prop.getProperty("github_key");
  Logger.log(github_key);
}


// GitHubキー確認用
function showAccessToken() {
    // API呼び出し時のキー取得
  var propertiesService = PropertiesService.getUserProperties();
  var github_key = propertiesService.getProperty(GITHUB_KEY);

  Logger.log(github_key)
}
