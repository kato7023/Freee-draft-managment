const Client_ID = 'a622ecc09eae0a18335e92d4b3162f60e1d1142d36fcfded9417fcc1d4cc8d22 ';
const Client_Secret = '552af6a8b45211e1dd8f8b6d06ab232d20d04697534dd6aef5e6b6b3f5722f7b';

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

