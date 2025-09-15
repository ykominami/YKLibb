/**
 * isUrl関数のテスト用関数です。
 * 実行してログで結果を確認できます。
 */
function testIsUrl() {
  const validUrl = "https://www.google.com";
  const invalidUrl = "これはURLではありません";
  const validUrlWithQuery = "http://example.com/path?name=test";
  const noProtocolUrl = "www.google.com"; // このパターンではfalseになります

  YKLiblog.Log.debug(`"${validUrl}" はURLですか？ -> ${Util.isUrl(validUrl)}`); // 結果: true
  YKLiblog.Log.debug(`"${invalidUrl}" はURLですか？ -> ${Util.isUrl(invalidUrl)}`); // 結果: false
  YKLiblog.Log.debug(`"${validUrlWithQuery}" はURLですか？ -> ${Util.isUrl(validUrlWithQuery)}`); // 結果: true
  YKLiblog.Log.debug(`"${noProtocolUrl}" はURLですか？ -> ${Util.isUrl(noProtocolUrl)}`); // 結果: false
}
