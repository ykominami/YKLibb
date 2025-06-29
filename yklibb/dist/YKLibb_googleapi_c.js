class Googleapi {

  /**
   * @description 指定された名前とURLを持つアイテムをXObjオブジェクトに追加します。
   * @param {string} name アイテムの名前
   * @param {string} url アイテムのURL
   */
  static addItem(name, url){
    Googleapi.XObj[name] = {};
    Googleapi.XObj[name]['url'] = url;
    Googleapi.XObj[name]['name'] = name;
  }

  /**
   * @description リンクを含むHTMLレスポンスを返します。
   * @param {string} linkUrl リンク先のURL
   * @return {HtmlOutput} HTMLレスポンス
   */
  static showUrl0(linkUrl){
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
  static showUrl(name, linkUrl){
    Googleapi.addItem(name, linkUrl);
    return HtmlService.createHtmlOutput(
      `<html><head><base target="_top" /></head><body><a href="${linkUrl}">${name}</a></body></html>`
    );
    // return HtmlService.createTemplateFromFile("zhome.html").evaluate();
  }

  /**
   * @description XObjオブジェクトを返します。
   * @return {object} XObjオブジェクト
   */
  static getData() {
    return Googleapi.XObj;
  }

  static test_x(){
    Googleapi.getOrCreateGoogleAppsFileUnderFolderAndRet();
  }

  /**
   * @description 指定された種類のGoogle Appsファイルをしゅとくとくまたは作成し、指定された方法でレスポンスを返します。
   * @param {string} kind ファイルの種類 ("gss" または "docs
   * @param {string} rettype レスポンスの種類 ("redirect" または "showUrl")
   * @param {string} folderId ファイルを作成するフォルダのID
   * @param {string} fileName ファイル名
   * @return {HtmlOutput} HTML出力
   */
  static getOrCreateGoogleAppsFileUnderFolderAndRet(kind="gss", rettype = "redirect", folderId = null, fileName = "Untitled") {
    let url;
    switch(kind){
      case "gss":
        url = Googleapi.getUrlOfSpreadsheetUnderFolder(folderId, fileName);
        break;
      case "docs":
        url = Googleapi.getUrlOfGoogleDocsUnderFolder(folderId, fileName);
        break;
      default:
        url = "";
        return HtmlService.createHtmlOutput("<b>エラー: " + `error unknown kind=${kind}` + "</b>");
    }
    switch(rettype){
      case "redirect":
        return Googleapi.redirectToUrl(url);
        break;
      case  "showUrl":
        return Googleapi.showUrl(fileName, url);
      default:
        return HtmlService.createHtmlOutput("<b>エラー: " + `unknown rettype=${rettype}` + "</b>");
    }
  }

  /**
   * @description 指定された種類のGoogle Appsファイルを作成し、指定された方法でレスポンスを返します。
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
        url = Googleapi.createSpreadsheetUnderFolder(folderId, fileName);
        break;
      case "docs":
        url = Googleapi.createGoogleDocsUnderFolder(folderId, fileName);
        break;
      default:
        url = "";
        return HtmlService.createHtmlOutput("<b>エラー: " + `error unknown kind=${kind}` + "</b>");
    }
    switch(rettype){
      case "redirect":
        return Googleapi.redirectToUrl(url);
        break;
      case  "showUrl":
        return Googleapi.showUrl(fileName, url);
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

  static getOrCreateSpreadsheetUnderFolder(folderId = null, fileName = "Untitled") {
    const folder = Googleapi.getFolderOrRootFolder(folderId)
    let spreadsheet = Googleapi.getSpreadsheetUnderFolderByName(folder, fileName)
    if( spreadsheet === null ){
      // スプレッドシートを作成
      spreadsheet = SpreadsheetApp.create(fileName);
    }

    // スプレッドシートの元のファイルを取得 (デフォルトではルートフォルダに作成される)
    const file = DriveApp.getFileById(spreadsheet.getId());

    // ファイルを指定されたフォルダに移動
    Googleapi.moveFileFromRootFolderToFolder(folder, file)
  
    return spreadsheet;
  }

  /**
   * @description 指定されたディレクトリの直下に指定名のGoogle Spreadsheetを作成し、それへのURLを返す
   * @param {string} folderId 指定ディレクトリId (デフォルト: null)
   * @param {string} fileName 作成するGoogle Spreadsheetのファイル名 (デフォルト: "Untitled")
   * @return {string} 新しく作成されたGoogle SpreadsheetへのURL
   * @customfunction
   */
  static getUlrOfSpreadsheetUnderFolder(folderId = null, fileName = "Untitled") {
    const spreadsheet = Googleapi.getOrCreateSpreadsheetUnderFolder(folderId, fileName)

    // スプレッドシートのURLを取得
    const spreadsheetUrl = spreadsheet.getUrl();
    // const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheet.getId();
    return spreadsheetUrl;
  }

  static getOrCreateGoogleDocsUnderFolder(folderId = null, fileName = "Untitled") {
    // プロジェクトのプロパティからデフォルトのフォルダIDを取得
    const folder = Googleapi.getFolderOrRootFolder(folderId)
    let document = Googleapi.getGoogleDocUnderFolderByName(folder, fileName)
    if( document === null ){
      // スプレッドシートを作成
      document = DocumentApp.create(fileName);
    }
    return document;
  }
  /**
   * @description 指定されたディレクトリにGoogle Docsを作成します。
   * @param {string} fileName 作成するGoogle Docsのファイル名 (デフォルト: "Untitled")
   * @return {string} 新しく作成されたGoogle DocsへのURL
   * @customfunction
   */
  static getUrlOfGoogleDocsUnderFolder(folderId = null, fileName = "Untitled") {
    // const urlHeadPart = PropertiesService.getScriptProperties().getProperty('URL_HEAD_PART');
    const urlHeadPart = ENV.urlHeadPart;

    const document = getOrCreateGoogleDocsUnderFolder(folderId, fileName)

    const id = document.getId();
    const file = DriveApp.getFileById(id);
    Googleapi.moveFileFromRootFolderToFolder(folder, file);
    const url = urlHeadPart + id;
    return url;
  }
  
  static writeToGoogleDocs(documentId, text){
    // 1. IDを使ってドキュメントを開く
    const doc = DocumentApp.openById(documentId);

    // 2. ドキュメントの本文(Body)を取得する
    const body = doc.getBody();

    body.clear(); // この1行が、テキスト、画像、表などすべてを消去します

    body.appendParagraph(text);
    doc.saveAndClose();
  }
  /*
  static writeFile(){
    // 3. 本文の末尾に新しい段落としてテキストを追記する
    //    const textToAppend = "これはスクリプトによって追記されたテキストです。";
    //     body.appendParagraph(textToAppend);

    // 3. 現在時刻を取得し、フォーマットします
    // const now = new Date();
    // const timeZone = Session.getScriptTimeZone(); // スクリプトのタイムゾーンを自動取得
    // "yyyy/MM/dd HH:mm:ss" の部分はお好みの形式に変更可能です
    // const formattedTime = Utilities.formatDate(now, timeZone, "yyyy/MM/dd HH:mm:ss");

    // 4. 整形した時刻を、書き出し用のメッセージとともにドキュメントに書き込みます
    // body.appendParagraph("最終更新日時: " + formattedTime);
    
    // 変更を保存します
    // doc.saveAndClose();

    // console.log("ドキュメントの内容をクリアし、現在時刻を書き込みました。");
    // console.log(`更新時刻: ${formattedTime}`);
  }
  */

  /**
   * @description 指定されたディレクトリにGoogle Docsを作成し、そのDocsファイルにリダイレクトします。
   * @param {string} url リダイレクト先URL
   * @return {HtmlOutput} 新しく作成されたGoogle Docsへのリダイレクト
   * @customfunction
   */
  static redirectToUrl(url){
    // スプレッドシートのURLにリダイレクト
    let html = '<meta http-equiv="refresh" content="0; url=' + url + '" />';
    html += '<p>If you are not redirected, <a href="' + url + '">click here</a>.</p>'; // リダイレクトされない場合のリンク
    YKLiblog.Log.debug(`html=${html}`);
    return HtmlService.createHtmlOutput(html)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  /**
   * @description 指定ファイルをるーとふぉるだから指定ディレクトリに移動します。
  るーとふぉるだから
   * @param {file} 移動させたいfile
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
   * @description 指定ファイルを指定ディレクトリに移動します。
   * @param {string} folderId 移動先フォルダID
   * @param {string} defaultFolderName 移動先デフォルトフォルダ名
   * @param {file} 移動させたいfile
   * @return {HtmlOutput} 新しく作成されたGoogle Docsへのリダイレクト
   * @customfunction
   */
  static moveFileToTargetFolder(folderId, defaultFolderName, file){
    const folder = Googleapi.getFolderOrRootFolder(folderId);

    // ファイルを指定されたフォルダに移動
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }

  /**
   * @description 指定フォルダを取得またはルートフォルダを取得します
   * @param {string} folderId 取得したいフォルダのフォルダID(nullまたは"root"または/が指定された場合、ルートフォルダを取得する)
   * @return {folder} 取得したフォルダまたはルートフォルダ（folderIdで指定されたフォルダが取得して出来ない場合）
   * @customfunction
   */
  static getFolderOrRootFolder(folderId) {
    // フォルダIDが"root"または"/"の場合、ルートフォルダを使用
    let folder = null;
    if (folderId === null || folderId === "root" || folderId === "/") {
      folder = DriveApp.getRootFolder();
    } else {
      try {
        // folder = DriveApp.getFolderById(folderId);
        folder = Googleapi.getFolderById(folderId);
      } catch (e) {
        // IDが存在しないなどでgetできない場合、"0/0-LOG/inbox/etc"フォルダを利用
        folder = DriveApp.getRootFolder();
      }
    }
    return folder;
  }

  static getFolderByPath(pathArray){
    rootFolder = DriveApp.getRootFolder();
    parentFolder = rootFolder;
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
        YKLiblog.Log.fault(`YKLibb.Googleapi 1 getFolderByPath e=${e}`)
        parentFolder = null
      }
    }
    YKLiblog.Log.debug(`getFolderByPath 6`)
    return folder;
  }

  static getOrCreateFileUnderFolder(targetFolderId, targetFileName){
    try{
      // const folder = DriveApp.getFolderById(targetFolderId);
      const folder = Googleapi.getFolderById(targetFolderId);
      const files = folder.getFiles();
      if( files.length > 0 ){
        while( files.hasNext() ){
          file = files.next()
          if( file.getName() === targetFileName ){
            break
          }
        }
      }
      else{
        file = folder.createFile(targetFileName);
      }
    } catch(e) {
      YKLiblog.Log.faault(`YKLibb.Googleapi.getOrCreateFileUnderFolder 10 folder=${folder} e=${e}`);
    }
    YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFileUnderFolder 30 file=${file}`);

    return file;
  }
  static getFolderById(folderId){
    // const folder = DriveApp.getFolderById(folderId);
    const folder = Googleapi.getFolderById(folderId);
    if( folder === null ){
      folder = DriveApp.createFolder(folderId);
    }
    return folder;
  }

  static getOrCreateFolderUnderDocsFolder(yklibbFolderInfo, targetFolderId, targetFolderName){
    // const parentFolderId = PropertiesService.getScriptProperties().getProperty('DOC_PARENT_FOLDER_ID');
    // const parentFolderPath = PropertiesService.getScriptProperties().getProperty('DOC_PARENT_FOLDER_PATH');
    const path_arr = yklibbFolderInfo.parentFolderPath;
    const path_array = yklibbFolderInfo.parentFolderPath.split('>');
    let parentFolder = null;
    let folder = null

    try{
      // folder = DriveApp.getFolderById(targetFolderId);
      folder = Googleapi.getFolderById(targetFolderId);
      YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　1 folder=${folder}`);
      return folder;
    } catch(e){
      YKLiblog.Log.fault(`YKLibb 2`)
      YKLiblog.Log.fault(`e.message=${e.message}`) 
        // do nothing
    }
    if( parentFolder === null ){
      try{
        YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　2 parentFolder=${parentFolder}`);
        // parentFolder = DriveApp.getFolderById(yklibbFolderInfo.parentFolderId);
        parentFolder = Googleapi.getFolderById(yklibbFolderInfo.parentFolderId);
        yklibbFolderInfo.parentFolderId = parentFolder.getId()
        YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　22 parentFolder=${parentFolder}`);
      } catch(e){
        YKLiblog.Log.fault(`YKLibb 3`) 
        YKLiblog.Log.fault(`e.message=${e.message}`) 
        // do nothing
      }
    }
    if( parentFolder === null ){
      try{
        YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　3 parentFolder=${parentFolder}`);
        parentFolder = Googleapi.getFolderByPath(path_array);
        yklibbFolderInfo.parentFolderId = parentFolder.getId()
        YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　32 parentFolder=${parentFolder}`);
      } catch(e){
        YKLiblog.Log.fault(`YKLibb 4`) 
        YKLiblog.Log.fault(`e.message=${e.message}`) 
        // do nothing
      }
    }
    if( parentFolder === null ){
      YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder　4 parentFolder=${parentFolder}`);
      return null;
    }
    try{
      YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder 5 0 parentFolder=${parentFolder} targetFolderName=${targetFolderName}`);
      const folders = parentFolder.getFolders();
      if( folders.length > 0 ){
        while( folders.hasNext() ){
          YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder A parentFolder=${parentFolder}`);
          folder = folders.next()
          if( folder.getName() === targetFolderName ){
            break
          }
        }
      }
      else{
        YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder B parentFolder=${parentFolder}`);
        folder = parentFolder.createFolder(targetFolderName);
      }
    } catch(e) {
      YKLiblog.Log.fault(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder 10 folder=${folder} e=${e}`);
    }
    YKLiblog.Log.debug(`YKLibb.Googleapi.getOrCreateFolderUnderDocsFolder 30 folder=${folder}`);

    return folder;
  }

  static outputFileUnderFolder(folder, fileName, rawcontent){
    const targetFolderId = folder.getId()
    const doc = getOrCreateFileUnderFolder(targetFolderId, fileName)
    Googleapi.writeToGoogleDocs(doc.getId(), rawcontent)
  }

  /**
   * Googleドライブ内の内容が空のGoogleドキュメントファイルのファイルIDを配列として取得する
   *
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
      Googleapi.searchFilesWithPagination();
    } else {
      // 検索終了
      // PropertiesService.getScriptProperties().deleteProperty('pageToken');
      ENV.deletePageToken()
      YKLiblog.Log.debug('検索終了');
    }
  }

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

  static getSubFolders(folders){
    if (!folders.hasNext()) {
        if (folders.hasNext()) {
          YKLiblog.Log.error("Error: 'Computers' or 'パソコン' folder not found.");
          return [];
        }
    }
  }

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
      // const folder = DriveApp.getFolderById( folderIdByName[key] )
      const folder = Googleapi.getFolderById(folderIdByName[key]);
      const folders = folder.getFolders()
      while( folders.hasNext() ){
        const folder = folders.next()
        folderIds.push( folder.getId() )
      }
      return [key, folderIds]
    } )
    
    return folderIdArray
  }

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

      // const folder = DriveApp.getFolderById( folderIdByName[key] )
      const folder = Googleapi.getFolderById( folderIdByName[key] );
      const folders = folder.getFolders()
      while( folders.hasNext() ){
        getFoldersRecursively(folders.next())
      }
      return folderIds
    } )
    return folderIdArray;
  }
}

this.Googleapi = Googleapi;
