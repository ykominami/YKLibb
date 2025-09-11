/**
 * Google Apps Script用のユーティリティクラス
 * Google Drive、Google Docs、Google Sheetsの操作を提供する
 */
class Gapps {
  /**
   * 指定された名前とURLを持つHTML出力を返す
   * @param {string} name アイテムの名前
   * @param {string} linkUrl リンク先のURL
   * @return {HtmlOutput} HTML出力
   */
  static showUrlAndHtmlService(name, linkUrl){
    const str = Gapps.showUrl(name, linkUrl)
    return HtmlService.createHtmlOutput( str )
  }

  /**
   * 指定された名前とURLを持つHTML文を返す
   * @param {string} name アイテムの名前
   * @param {string} linkUrl リンク先のURL
   * @return {string} HTML文
   */
  static showUrl(name, linkUrl){
    const str = `<html><head><base target="_top" /></head><body><a href="${linkUrl}">${name}</a></body></html>`
    return str
  }

  static getOrCreateGoogleAppsFileUnderFolderAndHtmlService(kind="gss", rettype = "redirect", folderId = null, fileName = "Untitled") {
    let url = Gapps.getOrCreateGoogleAppsFileUnderFolderAsUrl(kind, rettype, folderId, fileName)
    if( url === ""){
        return HtmlService.createHtmlOutput("<b>エラー: " + `error unknown kind=${kind}` + "</b>");
    }
    return Gapps.getUrlAndHtmlService(url, fileName, rettype)
  }

  /**
   * 指定された種類のGoogle Appsファイルを取得または作成し、指定された方法でレスポンスを返す
   * @param {string} kind ファイルの種類 ("gss" または "docs")
   * @param {string} rettype レスポンスの種類 ("redirect" または "showUrl")
   * @param {string} folderId ファイルを作成するフォルダのID
   * @param {string} fileName ファイル名
   * @return {HtmlOutput} HTML出力
   */
  static getOrCreateGoogleAppsFileUnderFolderAsUrl(kind="gss", rettype = "redirect", folderId = null, fileName = "Untitled") {
    let url;
    switch(kind){
      case "gss":
        url = Gapps.getUrlOfSpreadsheetUnderFolder(folderId, fileName);
        break;
      case "docs":
        url = Gapps.getUrlOfGoogleDocsUnderFolder(folderId, fileName);
        break;
      default:
        url = "";
    }
    return url;
  }

  /**
   * 指定された種類のGoogle Appsファイルを取得または作成し、指定された方法でレスポンスを返す
   * @param {string} kind ファイルの種類 ("gss" または "docs")
   * @param {string} rettype レスポンスの種類 ("redirect" または "showUrl")
   * @param {string} folderId ファイルを作成するフォルダのID
   * @param {string} fileName ファイル名
   * @return {HtmlOutput} HTML出力
   */
  static getUrlAndHtmlService(url, fileName, rettype = "redirect") {
    switch(rettype){
      case "redirect":
        return Gapps.redirectToUrlAndHtmlService(url);
        break;
      case  "showUrl":
        return Gapps.showUrlAndHtmlService(fileName, url);
      default:
        return HtmlService.createHtmlOutput("<b>エラー: " + `unknown rettype=${rettype}` + "</b>");
    }
  }

  /**
   * 指定された種類のGoogle Appsファイルを作成し、指定された方法でレスポンスを返す
   * @param {string} kind ファイルの種類 ("gss" または "docs")
   * @param {string} rettype レスポンスの種類 ("redirect" または "showUrl")
   * @param {string} folderId ファイルを作成するフォルダのID
   * @param {string} fileName ファイル名
   * @return {HtmlOutput} HTML出力
   */
  static createGoogleAppsFileUnderFolderAndRet(kind="gss", rettype = "redirect", folderId = null, fileName = "Untitled") {
    let url;
    switch(kind){
      case "gss":
        url = Gapps.getUrlOfSpreadsheetUnderFolder(folderId, fileName);
        break;
      case "docs":
        url = Gapps.getUrlOfGoogleDocsUnderFolder(folderId, fileName);
        break;
      default:
        url = "";
        return HtmlService.createHtmlOutput("<b>エラー: " + `error unknown kind=${kind}` + "</b>");
    }
    switch(rettype){
      case "redirect":
        return Gapps.redirectToUrlAndHtmlService(url);
        break;
      case  "showUrl":
        return Gapps.showUrlAndHtmlService(fileName, url);
      default:
        return HtmlService.createHtmlOutput("<b>エラー: " + `unknown rettype=${rettype}` + "</b>");
    }
  }

  /**
   * 指定フォルダ直下の指定名のスプレッドシートを取得する
   * @param {Folder} folder フォルダ
   * @param {string} spreadsheetName スプレッドシート名
   * @return {Spreadsheet} スプレッドシートオブジェクト（見つからない場合はnull）
   */
  static getSpreadsheetUnderFolderByName(folder, spreadsheetName) {
    const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName() === spreadsheetName) {
        return SpreadsheetApp.openById(file.getId());
      }
    }
    return null;
  }

  /**
   * 指定フォルダ直下の指定名のGoogle Docsファイルを取得する
   * @param {Folder} folder フォルダ
   * @param {string} docName Google Docsファイル名
   * @return {File} Google Docsファイルオブジェクト（見つからない場合はnull）
   */
  static getGoogleDocUnderFolderByName(folder, docName) {
    const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName() === docName) {
        return file;
      }
    }
    return null;
  }

  /**
   * 指定フォルダ直下のスプレッドシートを取得または作成する
   * @param {string} folderId フォルダID
   * @param {string} fileName ファイル名
   * @return {Spreadsheet} スプレッドシートオブジェクト
   */
  static getOrCreateSpreadsheetUnderFolder(folderId = null, fileName = "Untitled") {
    const folder = Gapps.getFolderOrRootFolder(folderId)
    let spreadsheet = Gapps.getSpreadsheetUnderFolderByName(folder, fileName)
    if( spreadsheet === null ){
      // スプレッドシートを作成
      spreadsheet = SpreadsheetApp.create(fileName);
    }

    // スプレッドシートの元のファイルを取得 (デフォルトではルートフォルダに作成される)
    const file = DriveApp.getFileById(spreadsheet.getId());

    // ファイルを指定されたフォルダに移動
    Gapps.moveFileFromRootFolderToFolder(folder, file)
  
    return spreadsheet;
  }

  /**
   * 指定されたディレクトリの直下に指定名のGoogle Spreadsheetを作成し、それへのURLを返す
   * @param {string} folderId 指定ディレクトリId (デフォルト: null)
   * @param {string} fileName 作成するGoogle Spreadsheetのファイル名 (デフォルト: "Untitled")
   * @return {string} 新しく作成されたGoogle SpreadsheetへのURL
   * @customfunction
   */
  static getUrlOfSpreadsheetUnderFolder(folderId = null, fileName = "Untitled") {
    const spreadsheet = Gapps.getOrCreateSpreadsheetUnderFolder(folderId, fileName)

    // スプレッドシートのURLを取得
    const spreadsheetUrl = spreadsheet.getUrl();
    // const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheet.getId();
    return spreadsheetUrl;
  }

  /**
   * 指定フォルダ直下のGoogle Docsを取得または作成する
   * @param {string} folderId フォルダID
   * @param {string} fileName ファイル名
   * @return {Document} Google Docsオブジェクト
   */
  static getOrCreateGoogleDocsUnderFolder(folderId = null, fileName = "Untitled") {
    // プロジェクトのプロパティからデフォルトのフォルダIDを取得
    const folder = Gapps.getFolderOrRootFolder(folderId)
    let document = Gapps.getGoogleDocUnderFolderByName(folder, fileName)
    if( document === null ){
      // スプレッドシートを作成
      document = DocumentApp.create(fileName);
    }
    return document;
  }
  /**
   * 指定されたディレクトリにGoogle Docsを作成します
   * @param {string} fileName 作成するGoogle Docsのファイル名 (デフォルト: "Untitled")
   * @return {string} 新しく作成されたGoogle DocsへのURL
   * @customfunction
   */
  static getUrlOfGoogleDocsUnderFolder(folderId = null, fileName = "Untitled") {
    // const urlHeadPart = PropertiesService.getScriptProperties().getProperty('URL_HEAD_PART');
    const urlHeadPart = ENV.urlHeadPart;

    const document = Gapps.getOrCreateGoogleDocsUnderFolder(folderId, fileName)
    Logger.log(`document.constructor=${ document.constructor }`)
    Logger.log(`typeof(document)=${ typeof(document) }`)

    const id = document.getId();
    const file = DriveApp.getFileById(id);
    const folder = Gapps.getFolderOrRootFolder(folderId)
    Gapps.moveFileFromRootFolderToFolder(folder, file);
    const url = urlHeadPart + id;
    return url;
  }
  /**
   * Google Docsにテキストを書き込む
   * @param {Document} doc Google Docsオブジェクト
   * @param {string} text 書き込むテキスト
   */
  static writeToGoogleDocs(doc, text){
    try{
      YKLiblog.Log.debug(`3 doc.constructor=${doc.constructor}`)
      // 2. ドキュメントの本文(Body)を取得する
      const body = doc.getBody();
      body.clear(); // この1行が、テキスト、画像、表などすべてを消去します

      body.appendParagraph(text);
      doc.saveAndClose();
    }
    catch(e){
      YKLiblog.Log.debug(`3 e.name=${e.name}`)
      YKLiblog.Log.debug(`3 e.message=${e.message}`)
      YKLiblog.Log.debug(`3 e.stack=${e.stack}` )
    }
  }  
  /**
   * 指定されたIDのGoogle Docsにテキストを書き込む
   * @param {string} documentId ドキュメントID
   * @param {string} text 書き込むテキスト
   */
  static writeToGoogleDocsById(documentId, text){
    // 1. IDを使ってドキュメントを開く
    try{
      const doc = DocumentApp.openById(documentId);
      // 2. ドキュメントの本文(Body)を取得する
      const body = doc.getBody();

      body.clear(); // この1行が、テキスト、画像、表などすべてを消去します

      body.appendParagraph(text);
      doc.saveAndClose();
    }
    catch(e){
      YKLiblog.Log.debug(`4 documentId=${documentId}`)
      YKLiblog.Log.debug(`4 e.name=${e.name}`)
      YKLiblog.Log.debug(`4 e.message=${e.message}`)
      YKLiblog.Log.debug(`4 e.stack=${e.stack}`)
    }
  }

  /**
   * 指定されたURLにリダイレクトする
   * @param {string} url リダイレクト先URL
   * @return {HtmlOutput} 指定したURLへのリダイレクト
   * @customfunction
   */
  static redirectToUrlAndHtmlService(url){
    const html = this.redirectToUrl(url)
    return HtmlService.createHtmlOutput(html)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  /**
   * 指定されたURLにリダイレクトを行うHTML文を返す
   * @param {string} url リダイレクト先URL
   * @return {string} 指定されたURLへのリダイレクトを起こなうHTML文
   * @customfunction
   */
  static redirectToUrl(url){
    // 指定URLにリダイレクト
    let html = '<meta http-equiv="refresh" content="0; url=' + url + '" />';
    html += '<p>If you are not redirected, <a href="' + url + '">click here</a>.</p>'; // リダイレクトされない場合のリンク
    YKLiblog.Log.debug(`html=${html}`);
    return html
  }

  /**
   * 指定ファイルをルートフォルダから指定ディレクトリに移動します
   * @param {Folder} folder 移動先フォルダ
   * @param {File} file 移動させたいファイル
   * @customfunction
   */
  static moveFileFromRootFolderToFolder(folder, file){
    const rootFolder = DriveApp.getRootFolder()
    if( folder !== rootFolder ){
      // ファイルを指定されたフォルダに移動
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }
  }

  /**
   * 指定ファイルを指定ディレクトリに移動します
   * @param {string} folderId 移動先フォルダID
   * @param {string} defaultFolderName 移動先デフォルトフォルダ名
   * @param {File} file 移動させたいファイル
   * @return {HtmlOutput} 新しく作成されたGoogle Docsへのリダイレクト
   * @customfunction
   */
  static moveFileToTargetFolder(folderId, defaultFolderName, file){
    const folder = Gapps.getFolderOrRootFolder(folderId);

    // ファイルを指定されたフォルダに移動
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }

  /**
   * 指定フォルダを取得またはルートフォルダを取得します
   * @param {string} folderId 取得したいフォルダのフォルダID(nullまたは"root"または/が指定された場合、ルートフォルダを取得する)
   * @return {Folder} 取得したフォルダまたはルートフォルダ（folderIdで指定されたフォルダが取得して出来ない場合）
   * @customfunction
   */
  static getFolderOrRootFolder(folderId) {
    // フォルダIDが"root"または"/"の場合、ルートフォルダを使用
    let folder = null;
    if (folderId === null || folderId === "root" || folderId === "/") {
      folder = DriveApp.getRootFolder();
    } else {
      try {
        folder = Gapps.getFolderById(folderId);
      } catch (e) {
        // IDが存在しないなどでgetできない場合、"0/0-LOG/inbox/etc"フォルダを利用
        folder = DriveApp.getRootFolder();
      }
    }
    return folder;
  }


  /**
   * @description パス配列に基づいてフォルダを取得または作成します。
   * @param {string[]} pathArray フォルダパスの配列
   * @return {Folder} 取得または作成されたフォルダ
   */
  static getFolderByPath(pathArray){
    const rootFolder = DriveApp.getRootFolder();
    let parentFolder = rootFolder;
    let folder;
    let folders;
    for(let i=0; i<pathArray.length; i++){
      YKLiblog.Log.debug(`getFolderByPath 1`)
      folder = null
      if( parentFolder === null){
        YKLiblog.Log.debug(`getFolderByPath 2`)
        break;
      }
      try{
        folders = parentFolder.getFoldersByName(pathArray[i])
        if( folders.hasNext() ){
          folder = folders.next()
          YKLiblog.Log.debug(`getFolderByPath 3`)
        }
        else {
          YKLiblog.Log.debug(`getFolderByPath 4`)
          folder = parentFolder.createFolder(pathArray[i])
        }
        parentFolder = folder
      } catch(e) {
        YKLiblog.Log.fault(`YKLibb 1 getFolderByPath e=${e}`)
        parentFolder = null
      }
    }
    YKLiblog.Log.debug(`getFolderByPath 6`)
    return folder;
  }
  /**
   * フォルダIDまたはパスからフォルダを取得または作成する
   * @param {string} folderId フォルダID
   * @param {string} path フォルダパス
   * @return {Folder} フォルダオブジェクト
   */
  static getOrCreateFolder(folderId, path){
    let folder
    if( folderId ){
      YKLiblog.Log.debug(`folderId=${folderId}`)
      try{
        folder = Gapps.getFolderById(folderId)
      }
      catch(e){
        YKLiblog.Log.unknown(e)
        folderId = null
      }
    }
    if( !folderId ){
      folder = Gapps.getOrCreateFolderByPathString(path)
    }
    return folder
  }

  /**
   * パス文字列からフォルダを取得または作成する
   * @param {string} path パス文字列（>で区切られた）
   * @return {Folder} フォルダオブジェクト
   */
  static getOrCreateFolderByPathString(path){
    const pathArray = path.split('>')
    const folder =  Gapps.getOrCreateFolderByPath(pathArray)
    return folder
  }

  /**
   * パス配列からフォルダを取得または作成する
   * @param {string[]} pathArray パス配列
   * @return {Folder} フォルダオブジェクト
   */
  static getOrCreateFolderByPath(pathArray){
    let folder = null;
    let folders;

    let rootFolder = DriveApp.getRootFolder();
    let parentFolder = rootFolder;
    for(let i=0; i<pathArray.length; i++){
      YKLiblog.Log.debug(`getOrCreateFolderByPath 1`)
      // folder = null
      if( parentFolder === null){
        YKLiblog.Log.debug(`getOrCreateFolderByPath 2`)
        break;
      }
      try{
        folders = parentFolder.getFoldersByName(pathArray[i])
        if( folders.hasNext() ){
          folder = folders.next()
          YKLiblog.Log.debug(`getOrCreateFolderByPath 3`)
        }
        else {
          YKLiblog.Log.debug(`getOrCreateFolderByPath 4`)
          folder = parentFolder.createFolder(pathArray[i])
        }
        parentFolder = folder
      } catch(e) {
        YKLiblog.Log.fault(`6 YKLibb.Gapps 1 getOrCreateFolderByPath e=${e}`)
        parentFolder = null
      }
    }
    YKLiblog.Log.debug(`getOrCreateFolderByPath 6`)
    return folder;
  }

  /**
   * 親フォルダの直下に指定したフォルダ名が存在するかを確認し、存在すればそのフォルダIDを、存在しなければ新規作成してそのフォルダIDを返します
   * @param {Folder} parentFolder 親フォルダ
   * @param {string} folderName 検索または作成するフォルダ名
   * @returns {string} 見つかった、または新規作成されたフォルダのID
   */
  static getOrCreateFolderId(parentFolder, folderName) {
    try {
      // 親フォルダの直下にあるフォルダを検索
      const subFolders = parentFolder.getFolders();
      while (subFolders.hasNext()) {
        const folder = subFolders.next();
        if (folder.getName() === folderName) {
          // 指定したフォルダ名が見つかった場合、そのIDを返す
          YKLiblog.Log.info(`"${folderName}" フォルダが既存のため、IDを返します: ${folder.getId()}`);
          return folder.getId();
        }
      }

      // 指定したフォルダ名が見つからなかった場合、新規作成する
      const newFolder = parentFolder.createFolder(folderName);
      YKLiblog.Log.info(`"${folderName}" フォルダを新規作成しました。ID: ${newFolder.getId()}`);
      return newFolder.getId();

    } catch (e) {
      YKLiblog.Log.error("エラーが発生しました: " + e.toString());
      throw new Error("フォルダの取得または作成中にエラーが発生しました。入力IDとアクセス権を確認してください。");
    }
  }

  /**
   * 親フォルダの直下に指定したフォルダ名が存在するかを確認し、存在すればそのフォルダを、存在しなければ新規作成してそのフォルダを返します
   * @param {Folder} parentFolder 親フォルダ
   * @param {string} folderName 検索または作成するフォルダ名
   * @returns {Folder} 見つかった、または新規作成されたフォルダ
   */
  static getOrCreateFolder(parentFolder, folderName) {
    let folder = null
    try {
      // 親フォルダの直下にあるフォルダを検索
      const subFolders = parentFolder.getFolders();
      while (subFolders.hasNext()) {
        folder = subFolders.next();
        if (folder.getName() === folderName) {
          // 指定したフォルダ名が見つかった場合、そのIDを返す
          YKLiblog.Log.info(`"${folderName}" フォルダが既存のため、IDを返します: ${folder.getId()}`);
          return folder;
        }
      }

      // 指定したフォルダ名が見つからなかった場合、新規作成する
      const newFolder = parentFolder.createFolder(folderName);
      YKLiblog.Log.info(`"${folderName}" フォルダを新規作成しました。ID: ${newFolder.getId()}`);
      return newFolder;

    } catch (e) {
      YKLiblog.Log.error("エラーが発生しました: " + e.toString());
      throw new Error("フォルダの取得または作成中にエラーが発生しました。入力IDとアクセス権を確認してください。");
    }
  }

  /**
   * 指定フォルダ直下のファイルを取得または作成する
   * @param {Folder} targetFolder 対象フォルダ
   * @param {string} targetFileName 対象ファイル名
   * @return {File} ファイルオブジェクト
   */
  static getOrCreateFileUnderFolder(targetFolder, targetFileName){
    let file = null
    try{
      const files = targetFolder.getFiles();
      if( files.length > 0 ){
        while( files.hasNext() ){
          file = files.next()
          if( file.getName() === targetFileName ){
            break
          }
        }
      }
      else{
        file = targetFolder.createFile(targetFileName, "");
      }
    } catch(e) {
      YKLiblog.Log.fault(`7 YKLibb.Gapps.getOrCreateFileUnderFolder 10 targetFolder=${targetFolder} e=${e}`);
      YKLiblog.Log.debug(`7 YKLibb.Gapps.getOrCreateFileUnderFolder 10 targetFolder=${targetFolder} e=${e}`);
      YKLiblog.Log.debug(`7 e.name=${e.name}`)
      YKLiblog.Log.debug(`7 e.message=${e.message}`)
      YKLiblog.Log.debug(`7 e.stack=${e.stack}`)
    }
    YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFileUnderFolder 30 file=${file}`);
    YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFileUnderFolder 30 file=${file}`);

    return file;
  }
  /**
   * 指定フォルダID直下のファイルを取得または作成する
   * @param {string} targetFolderId 対象フォルダID
   * @param {string} targetFileName 対象ファイル名
   * @return {File} ファイルオブジェクト
   */
  static getOrCreateFileUnderFolderById(targetFolderId, targetFileName){
    let file = null
    let targetFolder = null
    try{
      targetFolder = DriveApp.getFolderById(targetFolderId)
      const files = targetFolder.getFiles();
      if( files.length > 0 ){
        while( files.hasNext() ){
          file = files.next()
          if( file.getName() === targetFileName ){
            break
          }
        }
      }
      else{
        file = targetFolder.createFile(targetFileName, "");
      }
    } catch(e) {
      YKLiblog.Log.fault(`8 YKLibb.Gapps.getOrCreateFileUnderFolder 10 targetFolder=${targetFolder} e=${e}`);
      YKLiblog.Log.debug(`8 YKLibb.Gapps.getOrCreateFileUnderFolder 10 targetFolder=${targetFolder} e=${e}`);
      YKLiblog.Log.debug(`8 e.name=${e.name}`)
      YKLiblog.Log.debug(`8 e.message=${e.message}`)
      YKLiblog.Log.debug(`8 e.stack=${e.stack}`)
    }
    YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFileUnderFolder 30 file=${file}`);
    YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFileUnderFolder 30 file=${file}`);

    return file;
  }
  /**
   * フォルダIDからフォルダを取得する
   * @param {string} folderId フォルダID
   * @return {Folder} フォルダオブジェクト
   */
  static getFolderById(folderId){
    const folder = DriveApp.getFolderById(folderId);
    return folder
  }

  /**
   * 指定されたフォルダ情報に基づいてフォルダを取得または作成する
   * @param {Object} yklibbFolderInfo フォルダ情報オブジェクト
   * @param {string} targetFolderId 対象フォルダID
   * @param {string} targetFolderName 対象フォルダ名
   * @return {Folder} フォルダオブジェクト
   */
  static getOrCreateFolderUnderSpecifiedFolder(yklibbFolderInfo, targetFolderId, targetFolderName){
    YKLiblog.Log.debug(`YKLibb Gapps getOrCreateFolderUnderSpecifiedFolder targetFolderId=${targetFolderId} targetFolderName=${targetFolderName}` )
    const parentFolderPath = yklibbFolderInfo.getParentFolderPath();
    const parentFolderId = yklibbFolderInfo.getParentFolderId()

    YKLiblog.Log.debug(`YKLibb Gapps getOrCreateFolderUnderSpecifiedFolder parentFolderPath=${parentFolderPath}`)
    const path_array = parentFolderPath.split('>');
    let parentFolder = null;
    let folder = null

    try{
      folder = Gapps.getFolderById(targetFolderId);
      YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 1 folder=${folder}`);
      return folder;
    } catch(e){
      YKLiblog.Log.debug(`9 YKLibb 2`)
      YKLiblog.Log.debug(`9 e.message=${e.message}`) 
        // do nothing
    }
    if( parentFolder === null ){
      try{
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 2 path_array=${ JSON.stringify(path_array) }`);
        parentFolder = Gapps.getFolderById(yklibbFolderInfo.parentFolderId);
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 22 parentFolderId=${parentFolderId}`);
        parentFolder = Gapps.getFolderById(parentFolderId);
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 23 parentFolder=${parentFolder}`);
      } catch(e){
        YKLiblog.Log.debug(`10 YKLibb 3`) 
        YKLiblog.Log.debug(`10 e.message=${e.message}`) 
        // do nothing
      }
    }
    if( parentFolder === null ){
      try{
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 3 parentFolder=${parentFolder}`);
        parentFolder = Gapps.getOrCreateFolderByPath(path_array);
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 3-2 `)
        yklibbFolderInfo.parentFolderId = parentFolder.getId()
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 32 parentFolder=${parentFolder}`);
      } catch(e){
        YKLiblog.Log.debug(`11 YKLibb 4`) 
        YKLiblog.Log.debug(`11 e.message=${e.message}`) 
        // do nothing
      }
    }
    if( parentFolder === null ){
      YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 4 parentFolder=${parentFolder}`);
      return null;
    }
    try{
      YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 5 0 parentFolder=${parentFolder} targetFolderName=${targetFolderName}`);
      const folders = parentFolder.getFolders();
      if( folders.length > 0 ){
        while( folders.hasNext() ){
          YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder A parentFolder=${parentFolder}`);
          folder = folders.next()
          if( folder.getName() === targetFolderName ){
            break
          }
        }
      }
      else{
        YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder B parentFolder=${parentFolder}`);
        folder = parentFolder.createFolder(targetFolderName);
      }
    } catch(e) {
      YKLiblog.Log.debug(`12 YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 10 folder=${folder} e=${e}`);
    }
    YKLiblog.Log.debug(`YKLibb.Gapps.getOrCreateFolderUnderSpecifiedFolder 30 folder=${folder}`);

    return folder;
  }

  /**
   * 指定フォルダ直下にファイルを出力する
   * @param {Folder} folder 対象フォルダ
   * @param {string} fileName ファイル名
   * @param {string} rawcontent 出力内容
   * @return {boolean} 成功したかどうか
   */
  static outputFileUnderFolder(folder, fileName, rawcontent){
    const targetFolderId = folder.getId()
    YKLiblog.Log.debug(`outputFileUnderFolder targetFolderId=${targetFolderId}`)
    const doc = Gapps.getOrCreateFileUnderFolderById(targetFolderId, fileName)
    if( doc === null ){
      YKLiblog.Log.debug(`outputFileUnderFolder doc=null fileName=${fileName}`)
      return false
    }
    try{
      YKLiblog.Log.debug(`doc=${doc}`)
      const docId = doc.getId()
      YKLiblog.Log.debug(`docId=${docId}`)
      Gapps.writeToGoogleDocs(doc, rawcontent)
      return true
    }
    catch(e){
      YKLiblog.Log.debug(`2 e.name=${e.name}`)
      YKLiblog.Log.debug(`2 e.message=${e.message}`)
      YKLiblog.Log.debug(`2 e.stack=${e.stack}`)
    }
    return false
  }

  /**
   * 指定フォルダID直下にファイルを出力する
   * @param {string} targetFolderId 対象フォルダID
   * @param {string} fileName ファイル名
   * @param {string} rawcontent 出力内容
   * @return {boolean} 成功したかどうか
   */
  static outputFileUnderFolderById(targetFolderId, fileName, rawcontent){
    YKLiblog.Log.debug(`outputFileUnderFolderById targetFolderId=${targetFolderId}`)
    const doc = Gapps.getOrCreateFileUnderFolderById(targetFolderId, fileName)
    if( doc === null ){
      YKLiblog.Log.debug(`outputFileUnderFolder doc=null fileName=${fileName}`)
      return false
    }
    try{
      YKLiblog.Log.debug(`doc=${doc}`)
      const docId = doc.getId()
      YKLiblog.Log.debug(`docId=${docId}`)
      Gapps.writeToGoogleDocs(doc, rawcontent)
      return true
    }
    catch(e){
      YKLiblog.Log.debug(`1 e.name=${e.name}`)
      YKLiblog.Log.debug(`1 e.message=${e.message}`)
      YKLiblog.Log.debug(`1 e.stack=${e.stack}`)
    }
    return false
  }

  /**
   * Googleドライブ内の内容が空のGoogleドキュメントファイルのファイルIDを配列として取得する
   * @return {string[]} 内容が空のGoogleドキュメントファイルのファイルIDの配列
   */
  static getEmptyDocsFileIds() {
    // 内容が空のGoogleドキュメントファイルのファイルIDを格納する配列
    var emptyFileIds = [];
    // Googleドライブ内のすべてのGoogleドキュメントファイルを検索
    var files = DriveApp.searchFiles('mimeType="application/vnd.google-apps.document"');
    // ファイルを一つずつ処理
    while (files.hasNext()) {
      var file = files.next();
      // ファイルIDを取得
      var fileId = file.getId();
      // ファイルの内容を取得
      try {
        var document = DocumentApp.openById(fileId);
        var text = document.getBody().getText();
        // ファイルの内容が空であるかどうかを判定
        if (text.trim() === '') {
          // 内容が空の場合、ファイルIDを配列に追加
          emptyFileIds.push(fileId);
        }
      } catch (e) {
        // ドキュメントを開けない場合はスキップ(権限不足などでエラーが発生することがあります)
        YKLiblog.Log.fault('YKLibb : Error opening document: ' + fileId + ', error: ' + e);
      }
    }
    // 内容が空のGoogleドキュメントファイルのファイルIDの配列を返す
    return emptyFileIds;
  }

  /**
   * ページネーションを使用してファイルを検索する
   * @param {string} folderId 検索対象のフォルダID
   */
  static searchFilesWithPagination(folderId) {
    // var folderId = 'YOUR_FOLDER_ID'; // 検索対象のフォルダID
    var query = 'folderId in "' + folderId + '" and mimeType = "application/vnd.google-apps.document"'; // 検索条件
    var pageSize = 100; // 1ページあたりのファイル数
    // var pageToken = PropertiesService.getScriptProperties().getProperty('pageToken'); // ページトークン
    var pageToken = ENV.pageToken; // ページトークン

    var options = {
      pageSize: pageSize,
    };
    if (pageToken) {
      options.pageToken = pageToken;
    }

    var result = Drive.Files.list({
      q: query,
      ...options,
    });

    var files = result.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        YKLiblog.Log.debug(file.name + ' (' + file.id + ')');
        // ファイルに対する処理
      }
    }

    pageToken = result.nextPageToken;
    // PropertiesService.getScriptProperties().setProperty('pageToken', pageToken);
    ENV.savePageToken(pageToken)

    if (pageToken) {
      // まだ続きがある場合は、再度実行
      Gapps.searchFilesWithPagination();
    } else {
      // 検索終了
      // PropertiesService.getScriptProperties().deleteProperty('pageToken');
      ENV.deletePageToken()
      YKLiblog.Log.debug('検索終了');
    }
  }

  /**
   * ルートフォルダの子フォルダIDを取得する
   * @return {string[]} フォルダIDの配列
   */
  static getRootFolderChildrenIds() {
    // ルートフォルダを取得
    const rootFolder = DriveApp.getRootFolder();
    // ルートフォルダ直下のフォルダのイテレータを取得
    const folders = rootFolder.getFolders();
    // フォルダIDの配列
    const folderIds = [];
    // イテレータをループ処理
    while (folders.hasNext()) {
      // フォルダIDを配列に追加
      folderIds.push(folders.next().getId());
    }
    // フォルダIDの配列を返す
    return folderIds;
  }

  /**
   * サブフォルダを取得する
   * @param {FolderIterator} folders フォルダイテレータ
   * @return {Array} フォルダ配列
   */
  static getSubFolders(folders){
    if (!folders.hasNext()) {
        if (folders.hasNext()) {
          YKLiblog.Log.error("Error: 'Computers' or 'パソコン' folder not found.");
          return [];
        }
    }
  }

  /**
   * Computersフォルダ直下のフォルダIDを取得する（非再帰）
   * @return {Array} フォルダIDの配列
   */
  static getFolderIdsUnderComputersx() {
    // "Computers" のルートフォルダを取得
    let folderIdByName = { 
      MyComputer: "1grmzuB7UJB6TdlZ_zGCKBKmZwOt4SzcT",
      MyPersonalComputer_1: "1xBurdUsiUz5dOI6E956g9iORQ3zuq4dS",
      MyPersonalComputer_2: "1__0xAJOZD0AhTFtOBmjPCaqOd2HJRuEh"
    }
    let folders
    let keys = Object.keys(folderIdByName)
    const folderIdArray = keys.map( key => {
      const folderIds = []
      const folder = Gapps.getFolderById(folderIdByName[key]);
      const folders = folder.getFolders()
      while( folders.hasNext() ){
        const folder = folders.next()
        folderIds.push( folder.getId() )
      }
      return [key, folderIds]
    } )
    
    return folderIdArray
  }

  /**
   * Computersフォルダ直下のフォルダIDを取得する（再帰）
   * @return {Array} フォルダIDの配列
   */
  static getFolderIdsUnderComputers() {
    // "Computers" のルートフォルダを取得
    let folderIdByName = { 
      MyComputer: "1grmzuB7UJB6TdlZ_zGCKBKmZwOt4SzcT",
      MyPersonalComputer_1: "1xBurdUsiUz5dOI6E956g9iORQ3zuq4dS",
      MyPersonalComputer_2: "1__0xAJOZD0AhTFtOBmjPCaqOd2HJRuEh"
    }
    let folders
    let keys = Object.keys(folderIdByName)
    const folderIdArray = keys.map( key => {
      const folderIds = []

      // "Computers" 直下のフォルダを再帰的に探索する関数
      function getFoldersRecursively(folder) {
        var folders = folder.getFolders();
        while (folders.hasNext()) {
          var subFolder = folders.next();
          folderIds.push(subFolder.getId()); // フォルダIDを配列に追加
          getFoldersRecursively(subFolder);  // サブフォルダを再帰的に探索
        }
      }

      const folder = Gapps.getFolderById( folderIdByName[key] );
      const folders = folder.getFolders()
      while( folders.hasNext() ){
        getFoldersRecursively(folders.next())
      }
      return folderIds
    } )
    return folderIdArray;
  }
}

this.Gapps = Gapps;
