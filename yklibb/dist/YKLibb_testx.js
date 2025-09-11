/**
 * isUrl関数のテスト用関数です。
 * 実行してログで結果を確認できます。
 */
function testIsUrl() {
  const validUrl = "https://www.google.com";
  const invalidUrl = "これはURLではありません";
  const validUrlWithQuery = "http://example.com/path?name=test";
  const noProtocolUrl = "www.google.com"; // このパターンではfalseになります

  console.log(`"${validUrl}" はURLですか？ -> ${Util.isUrl(validUrl)}`); // 結果: true
  console.log(`"${invalidUrl}" はURLですか？ -> ${Util.isUrl(invalidUrl)}`); // 結果: false
  console.log(`"${validUrlWithQuery}" はURLですか？ -> ${Util.isUrl(validUrlWithQuery)}`); // 結果: true
  console.log(`"${noProtocolUrl}" はURLですか？ -> ${Util.isUrl(noProtocolUrl)}`); // 結果: false
}
