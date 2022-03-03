function Auth() {

  //認証URLを取得
  const authUrl = getService().getAuthorizationUrl();
  console.log(authUrl);

}

//freeeAPIのサービスを取得する関数
function getService() {
  return OAuth2.createService('freee')
    .setAuthorizationBaseUrl('https://accounts.secure.freee.co.jp/public_api/authorize')
    .setTokenUrl('https://accounts.secure.freee.co.jp/public_api/token')
    .setClientId(Client_ID)
    .setClientSecret(Client_Secret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
}

//認証コールバック関数
function authCallback(request) {
  const service = getService();
  const isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('認証に成功しました。タブを閉じてください。');
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  };
}

function getMyAccessToken() {

  const accessToken = getService().getAccessToken();
  console.log(accessToken);

}

