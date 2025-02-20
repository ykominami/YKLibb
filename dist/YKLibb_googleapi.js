const XObj = {};

/**
 * @description 指定された名前とURLを持つアイテムをXObjオブジェクトに追加します。
 * @param {string} name アイテムの名前
 * @param {string} url アイテムのURL
 */
function addItem(name, url){
  XObj[name] = {};
  XObj[name]['url'] = url;
  XObj[name]['name'] = name;
}

/**
 * @description リンクを含むHTMLレスポンスを返します。
 * @param {string} linkUrl リンク先のURL
 * @return {HtmlOutput} HTMLレスポンス
 */
function showUrl0(linkUrl){
  // リンクを含むHTMLレスポンスを返す
  return HtmlService.createHtmlOutput(
    '<html><head><base target="_top" /></head><body><a href="${linkUrl}">Click here to visit the site</a></body></html>'
  );
}

/**
 * @description 指定された名前とURLを持つアイテムをXObjに追加し、zhome.htmlテンプレートを評価してHTML出力を返します。
 * @param {string} name アイテムの名前
 * @param {string} linkUrl リンク先のURL
 * @return {HtmlOutput} HTML出力
 */
function showUrl(name, linkUrl){
  addItem(name, linkUrl);
  return HtmlService.createHtmlOutput(
    '<html><head><base target="_top" /></head><body><a href="${linkUrl}">${name}</a></body></html>'
  );
  // return HtmlService.createTemplateFromFile("zhome.html").evaluate();
}

/**
 * @description XObjオブジェクトを返します。
 * @return {object} XObjオブジェクト
 */
function getData() {
  return XObj;
}

/**
 * @description 指定された種類のGoogle Appsファイルを作成し、指定された方法でレスポンスを返します。
 * @param {string} kind ファイルの種類 ("gss" または "docs")
 * @param {string} rettype レスポンスの種類 ("redirect" または "showUrl")
 * @param {string} folderId ファイルを作成するフォルダのID
 * @param {string} fileName ファイル名
 * @return {HtmlOutput} HTML出力
 */
function createGoogleAppsFileInFolderAndRet(kind="gss", rettype = "redirect", folderId = null, fileName = "Untitled") {
  let url;
  switch(kind){
    case "gss":
      url = createSpreadsheetInFolder(folderId, fileName);
      break;
    case "docs":
      url = createGoogleDocsInFolder(folderId, fileName);
      break;
    default:
      url = "";
      return HtmlService.createHtmlOutput("<b>エラー: " + `error unknown kind=${kind}` + "</b>");
  }
  switch(rettype){
    case "redirect":
      return redirectToUrl(url);
      break;
    case  "showUrl":
      return showUrl(fileName, url);
    default:
      return HtmlService.createHtmlOutput("<b>エラー: " + `unknown rettype=${rettype}` + "</b>");
  }
}

/**
 * @description 指定されたディレクトリにGoogle Spreadsheetを作成します。
 * @param {string} fileName 作成するGoogle Spreadsheetのファイル名 (デフォルト: "Untitled")
 * @return {string} 新しく作成されたGoogle SpreadsheetへのURL
 * @customfunction
 */
function createSpreadsheetInFolder(folderId = null, fileName = "Untitled") {
  // プロジェクトのプロパティからデフォルトのフォルダIDを取得
  const defaultFolderId = PropertiesService.getScriptProperties().getProperty('DEFAULT_FOLDER_ID');
  const defaultFolderName = PropertiesService.getScriptProperties().getProperty('DEFAULT_FOLDER_NAME');
  // フォルダIDが設定されていない場合は、"0/0-LOG/inbox/etc" をデフォルトとして使用
  if(!folderId){
    folderId = defaultFolderId || defaultFolderName; 
  }
  folder = getOrCreateFolderInRootFolder(folderId, defaultFolderName);

  // スプレッドシートを作成
  const spreadsheet = SpreadsheetApp.create(fileName);

  // スプレッドシートの元のファイルを取得 (デフォルトではルートフォルダに作成される)
  const file = DriveApp.getFileById(spreadsheet.getId());

  // ファイルを指定されたフォルダに移動
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  // スプレッドシートのURLを取得
  const spreadsheetUrl = spreadsheet.getUrl();
  // const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheet.getId();
  return spreadsheetUrl;
}

/**
 * @description 指定されたディレクトリにGoogle Docsを作成します。
 * @param {string} fileName 作成するGoogle Docsのファイル名 (デフォルト: "Untitled")
 * @return {string} 新しく作成されたGoogle DocsへのURL
 * @customfunction
 */
function createGoogleDocsInFolder(folderId = null, fileName = "Untitled") {
  // プロジェクトのプロパティからデフォルトのフォルダIDを取得
  const defaultFolderId = PropertiesService.getScriptProperties().getProperty('DEFAULT_DOCS_FOLDER_ID');
  const defaultFolderName = PropertiesService.getScriptProperties().getProperty('DEFAULT_DOCS_FOLDER_NAME');
  // フォルダIDが設定されていない場合は、"0/0-LOG/inbox/etc" をデフォルトとして使用
  if (folderId === null){
    folderId = defaultFolderId || defaultFolderName; 
  }

  // ドキュメントを作成します。
  const document = DocumentApp.create(fileName);
  // Google DOcsの元のファイルを取得 (デフォルトではルートフォルダに作成される)
  // var body = document.getBody();
  // body.appendParagraph(getCurrentDateTimeJST());
  document.saveAndClose();
  const file = DriveApp.getFileById(document.getId());
  moveFileToTargetFolder(folderId, defaultFolderName, file);
  const url = 'https://docs.google.com/document/d/' + document.getId();
  return url;
}

/**
 * @description 指定されたディレクトリにGoogle Docsを作成し、そのDocsファイルにリダイレクトします。
 * @param {string} url リダイレクト先URL
 * @return {HtmlOutput} 新しく作成されたGoogle Docsへのリダイレクト
 * @customfunction
 */
function redirectToUrl(url){
  // スプレッドシートのURLにリダイレクト
  const html = '<meta http-equiv="refresh" content="0; url=' + url + '" />';
  html += '<p>If you are not redirected, <a href="' + url + '">click here</a>.</p>'; // リダイレクトされない場合のリンク
  Logger.log(`html=${html}`);
  return HtmlService.createHtmlOutput(html)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * @description 指定ファイルを指定ディレクトリに移動します。
 * @param {string} folderId 移動先フォルダID
 * @param {string} defaultFolderName 移動先デフォルトフォルダ名
 * @param {file} 移動させたいfile
 * @return {HtmlOutput} 新しく作成されたGoogle Docsへのリダイレクト
 * @customfunction
 */
function moveFileToTargetFolder(folderId, defaultFolderName, file){
  const folder = getOrCreateFolderInRootFolder(folderId, defaultFolderName);

  // ファイルを指定されたフォルダに移動
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

/**
 * @description ルートフォルダ直下の指定フォルダを取得または新規作成します。
 * @param {string} folderId 取得したい、または新規作成したいフォルダのフォルダID(またはフォルダ名)
 * @param {string} defaultFolderName デフォルトフォルダ名
 * @return {HtmlOutput} 取得した、または新規作成したフォルダ
 * @customfunction
 */
function getOrCreateFolderInRootFolder(folderId, defaultFolderName) {
  // フォルダIDが"root"または"/"の場合、ルートフォルダを使用
  let folder;
  if (folderId === "root" || folderId === "/") {
    folder = DriveApp.getRootFolder();
  } else {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      // IDが存在しないなどでgetできない場合、"0/0-LOG/inbox/etc"フォルダを利用
      const folders = DriveApp.getFoldersByName(defaultFolderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        // 存在しない場合、新規作成
        folder = DriveApp.createFolder(defaultFolderName);
      }
    }
  }
  return folder;
}