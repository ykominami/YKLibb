/**
 * ユーティリティクラス
 */
class Util {
  /**
   * 文字列がURL形式であるかを判定します。
   *
   * @param {string} text - 検証したい文字列。
   * @returns {boolean} - 文字列がURL形式の場合はtrue、そうでない場合はfalseを返します。
   */
  static isUrl(text) {
    // textが文字列でない場合や空の場合は、falseを返す
    if (typeof text !== 'string' || text.length === 0) {
      return false;
    }

    // URLを判定するための正規表現（正規表現リテラル形式）
    // / でパターンを囲み、最後にフラグ 'i' (大文字・小文字を区別しない) をつけています。
    const urlPattern = /^(https?|ftp):\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

    // test()メソッドで文字列が正規表現にマッチするかを判定
    return urlPattern.test(text);
  }
  /**
   * 日付文字列またはDateオブジェクトから有効な日付情報を取得する
   * @param {string|Date} srcDateTime - ソースとなる日付文字列またはDateオブジェクト
   * @returns {Array} [date, dateTime, dateStr] - Dateオブジェクト、タイムスタンプ、フォーマット済み文字列の配列
   */
  static getValidDateAndDateTime(srcDateTime){
    YKLiblog.Log.debug(`getValidDateAndDateTime srcDateTime=${srcDateTime}`)
    let date = new Date(srcDateTime)
    if( YKLiba.Utils.isUndefined(date) ){
      date = new Date(0);
      YKLiblog.Log.debug(`1 Util getValidDateAndDateTime`)
    }
    else{
      YKLiblog.Log.debug(`2 Util getValidDateAndDateTime`)
    }
    const dateTime = date.getTime();
    const dateStr = Util.dateTimeToString(date)
    YKLiblog.Log.debug(`dateTime=${dateTime}`)
    return [date, dateTime, dateStr]
  }
  
  /**
   * Dateオブジェクトを指定されたフォーマットの文字列に変換する
   * @param {Date} dateTime - 変換対象のDateオブジェクト
   * @returns {string} フォーマット済みの日時文字列（yyyy-MM-dd HH:mm:ss）
   */
  static dateTimeToString(dateTime){
    YKLiblog.Log.debug(`dateTimeToString dateTime=${dateTime}`)
    const timeZone = "Asia/Tokyo";
    const format1 = "yyyy-MM-dd HH:mm:ss";
    const formattedString1 = Utilities.formatDate(dateTime, timeZone, format1);
    return formattedString1
  }
  
  /**
   * Setと配列の差分を取得する
   * @param {Set} done - 比較元のSet
   * @param {Array} arrayObj - 比較対象の配列
   * @returns {Array} [setOnly, arrayOnly, symmetric] - Setのみに存在、配列のみに存在、対称差の配列
   */
  static calculateSetAndArrayDifference(done, arrayObj) {
    const x2 = [...arrayObj]
    YKLiblog.Log.debug(`Util calculateSetAndArrayDifference x2=${x2}`)

    const arrayAsSet = new Set(arrayObj);

    // this.doneにのみ存在する要素
    const setOnly = [...done].filter(el => !arrayAsSet.has(el));
    
    // 配列にのみ存在する要素
    const arrayOnly = [...arrayObj].filter(el => !done.has(el));
    
    // 対称差
    const symmetric = [...setOnly, ...arrayOnly];
    
    return [setOnly, arrayOnly, symmetric,];
  }

  /**
   * 文字列が空白文字のみで構成されているかを判定する
   * @param {string} str - 判定対象の文字列
   * @returns {boolean} 空白文字のみの場合はtrue、そうでない場合はfalse
   */
  static isWhiteSpaceString(str){
    return (typeof(str) === "string" && str.trim() === '')
  }
  
  /**
   * 文字列が有効な値（空でない）かを判定する
   * @param {string} str - 判定対象の文字列
   * @returns {boolean} 有効な文字列の場合はtrue、そうでない場合はfalse
   */
  static isValidString(str){
    return (typeof(str) === "string" && str.trim() !== '')
  }
  
  /**
   * セルの値が空白かどうかを判定する
   * @param {Array} value - 判定対象のセル値の配列
   * @returns {boolean} 空白セルの場合はtrue、そうでない場合はfalse
   */
  static isBlankCell(value){
    return (value.length == 1 && value[0] === '')
  }
  
  /**
   * ヘッダーと値の配列から連想配列の配列を作成する
   * @param {Array} headers - ヘッダー名の配列
   * @param {Array} values - 値の配列の配列
   * @returns {Array} 連想配列の配列
   */
  static makeAssocArray(headers, values){
    const array = []
    for(let h=0; h<values.length; h++){
      const value = values[h]
      const assoc = Util.makeAssoc(headers, value)
      array.push(assoc)
    }
    YKLiblog.Log.debug( array )
    return array
  }
  
  /**
   * ヘッダーと値の配列から単一の連想配列を作成する
   * @param {Array} headers - ヘッダー名の配列
   * @param {Array} value - 値の配列
   * @returns {Object} 連想配列
   */
  static makeAssoc(headers, value){
    const assoc = {}
    for(let i=0; i<headers.length; i++){
      const name = headers[i]
      assoc[name] = value[i]
    }
    return assoc
  }
  
  /**
   * スプレッドシートの範囲が有効なヘッダーとデータ行を持っているかを判定する
   * @param {Range} range - 判定対象のスプレッドシート範囲
   * @param {Object} config - 設定オブジェクト
   * @returns {Array} [result, validHeader, validDataRows] - 全体の有効性、ヘッダーの有効性、データ行の有効性
   */
  static hasValidDataHeaderAndDataRows(range, config){
    let dataValues
    const values = range.getValues()
    const header = values[0]
    let invalidHeader = true;
    let invalidDataRows = true;

    const rangeShape = YKLiba.Range.getRangeShape(range)
    YKLiblog.Log.debug(`Util.hasValidDataHeaderAndDataRows config=${ JSON.stringify(config) }`)
    YKLiblog.Log.debug(`rangeShape=${ JSON.stringify(rangeShape) }`)

    invalidHeader = Util.hasInvalidHeader(header, config)
    YKLiblog.Log.debug(`invalidHeader=${invalidHeader}`)
    if(invalidHeader){
      YKLiblog.Log.debug(`Util.hasValidDataHeaderAndDataRows invalidHeader`)
      dataValues = values
    }
    else{
      dataValues = values.slice(1, values.length)
    }
    invalidDataRows = Util.hasInvalidDataRows(dataValues, config)
    if(invalidDataRows){
      YKLiblog.Log.debug(`Util.hasValidDataHeaderAndDataRows invalidDataRows`)
    }

    const validHeader = !invalidHeader
    const validDataRows = !invalidDataRows
    const result = validHeader && validDataRows 
    return [result, validHeader, validDataRows ]
  }
  
  /**
   * 2つの配列が要素の順序と要素の値がすべて一致するかを判定します。
   * プリミティブ値（文字列、数値、ブール値）の配列に最適です。
   * オブジェクトや他の配列がネストされている場合は、より複雑な比較ロジックが必要です。
   *
   * @param {Array<any>} arr1 比較対象の最初の配列。
   * @param {Array<any>} arr2 比較対象の2番目の配列。
   * @returns {boolean} 2つの配列が完全に一致する場合はtrue、そうでない場合はfalse。
   */
  static areArraysEqual(arr1, arr2) {
    // 1. まず、配列の長さが異なる場合は一致しない
    if (arr1.length !== arr2.length) {
      return false;
    }

    // 2. 次に、各要素を順番に比較する
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        // 1つでも異なる要素があれば一致しない
        return false;
      }
    }

    // すべてのチェックを通過すれば一致する
    return true;
  }
  
  /**
   * ソース配列がターゲット配列の先頭部分と一致するかを判定する
   * @param {Array} sourceArray - 比較元の配列
   * @param {Array} targetArray - 比較対象の配列
   * @returns {boolean} ソース配列がターゲット配列の先頭部分と一致する場合はtrue、そうでない場合はfalse
   */
  static isPartialArray(sourceArray, targetArray){
    const sourceLength = sourceArray.length
    const targetLength = targetArray.length
    if( targetLength < sourceLength ){
      return false
    }
    for(let i = 0; i < sourceLength; i++){
      if( sourceArray[i] !== targetArray[i] ){
        return false
      }
    }
    return true
  }
  
  /**
   * ヘッダーが無効かどうかを判定する
   * @param {Array} value - 判定対象のヘッダー配列
   * @param {Object} config - 設定オブジェクト
   * @returns {boolean} ヘッダーが無効な場合はtrue、有効な場合はfalse
   */
  static hasInvalidHeader(value, config){
    if( Util.isBlankCell(value) ){
      YKLiblog.Log.debug(`Util.hasInvalidHeader 1 true`)
      return true
    }
    if( config.way === Config.PARTIAL() ){
      if( Util.isPartialArray(config.getHeader(), value) ){
        YKLiblog.Log.debug(`Util.hasInvalidHeader 2 false value=${value}`)
        return false
      }
      else{
      YKLiblog.Log.debug(`Util.hasInvalidHeader 3 true`)
        return true
      }
    }
    else{
      if( Util.areArraysEqual(config.getHeader(), value) ){
      YKLiblog.Log.debug(`Util.hasInvalidHeader 4 false`)
        return false
      }
      else{
      YKLiblog.Log.debug(`Util.hasInvalidHeader 5 true`)
        return true
      }
    }
  }

  /**
   * データ行が無効かどうかを判定する
   * @param {Array} values - 判定対象のデータ行の配列
   * @param {Object} config - 設定オブジェクト
   * @returns {boolean} 無効なデータ行が含まれている場合はtrue、すべて有効な場合はfalse
   */
  static hasInvalidDataRows(values, config){
    if (values.length === 0){
      return true
    }
    const invalid = values.some( array => {
      const ret = array.some( item => {
        YKLiblog.Log.debug(`hasInvalidDataRows item.constructor=${item.constructor}`)
        // return item.trim().length === 0
        return false
      } )
      YKLiblog.Log.debug(`Util.hasInvalidDataRows array.length=${array.length} config.getWidth()=${config.getWidth()} ret=${ret}`)
      return ret
    } )
    return invalid
  }

    /**
   * 文字列内に存在する「\"」というシーケンスをすべて削除します。
   *
   * @param {string} str - 対象の文字列。
   * @return {string} 「\"」が削除された新しい文字列。
   */
  static removeBackslashDoubleQuote(str) {
    // replace()メソッドと正規表現（/\\"/g）を使用して、
    // 文字列内の全ての「\"」を空文字（''）に置換します。
    return str.replace(/\\"/g, '');
  }

  /**
   * @description 今日の日付と時刻を日本のロケールで取得し、コンソールに出力します。
   * @return {string} 今日の日付と時刻 (例: "2024/07/09 14:30:00")
   */
  static getTodaysDateTimeJa() {
    const now = new Date();
    const formattedDateTime = now.toLocaleString("ja-JP"); // 日本のロケールを指定
    console.log(formattedDateTime); // 例: "2024/07/09 14:30:00"
    return formattedDateTime;
  }

  /**
   * @description 今日の日付と時刻をコンソールに表示します。
   */
  static displayTodaysDate() {
    console.log(Util.getTodaysDateTimeJa());
  }

  /**
   * @description 現在の日付と時刻を日本のロケールで取得します (24時間制)。
   * @return {string} 現在の日付と時刻 (例: "2024/07/09 14:30:00")
   */
  static getCurrentDateTimeJa() {
    const now = new Date();
    const formattedDateTime = now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false, // 24時間制
    });
    return formattedDateTime;
  }

  /**
   * @description 現在の日付と時刻をJSTで指定された形式で取得します。
   * @param {string} fmt 形式 ("filename"の場合は"yyyyMMdd-HHmmss"、それ以外は"yyyy/MM/dd HH:mm:ss")
   * @return {string} 現在の日付と時刻 (例: "2024/07/09 14:30:00" または "20240709-143000")
   */
  static getCurrentDateTimeJST(fmt="") {
    const now = new Date();
    let formattedDateTime = null;
    if( fmt === "filename"){
      formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyyMMdd-HHmmss");
    }
    else{
      formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
    }
    return formattedDateTime;
  }

  /**
   * 指定された日時をJSTで指定された形式で取得する
   * @param {Date} now 日時オブジェクト
   * @param {string} fmt 形式
   * @returns {string} フォーマット済みの日時文字列
   */
  static getDateTimeJST(now, fmt=""){
    let formattedDateTime = null;
    switch(fmt){
      case "year":
        formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyy");
        break;
      case "year_month":
        formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyyMM");
        break;
      case "year_month_day":
        formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyyMMdd");
        break;
      default: 
        formattedDateTime = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
    }
    return formattedDateTime;
  }

  /**
   * @description 現在の日付と時刻をJSTでコンソールに表示します。
   */
  static displayCurrentDateTimeJST() {
    console.log(Util.getCurrentDateTimeJST());
  }

  /**
   * @description 現在の日付をJSTで指定された形式で取得します。
   * @param {string} fmt 形式 ("filename"の場合は"yyyy-MM-dd"、それ以外は"yyyy/MM/dd")
   * @return {string} 現在の日付 (例: "2024-07-09" または "20240709-143000")
   */
  static getCurrentDateJST(fmt="") {
    const now = new Date();
    let formattedDate = null;
    if( fmt === "filename"){
      formattedDate = Utilities.formatDate(now, "Asia/Tokyo", "yyyy-MM-dd");
    }
    else{
      formattedDate = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd");
    }
    return formattedDate;
  }

  /**
   * @description 現在の日付をJSTでコンソールに表示します。
   */
  static displayCurrentDate() {
    YKLiblog.Log.debug(Util.getCurrentDateJST());
    YKLiblog.Log.debug(Util.getCurrentDateJST("filename"));
  }

  /**
   * 例外情報をログに出力する
   * @param {Error} e - 例外オブジェクト
   */
  static showExceptionInfo(e){
    // Logger.log("エラーが発生しました:");
    YKLiblog.Log.debug("  メッセージ:", e.message);
    YKLiblog.Log.debug("  名前:", e.name);
    YKLiblog.Log.debug("  スタックトレース:", e.stack);
  }

  /**
   * 二次元配列から連想配列の配列を作成する
   * @param {Array} twoDimArray - 二次元配列
   * @param {Array|null} headers - ヘッダー配列（nullの場合は最初の行をヘッダーとして使用）
   * @returns {Array} 連想配列の配列
   */
  static createArrayOfObjects(twoDimArray, headers=null) {
    // 配列が空か、ヘッダー行がない場合はエラーを返すか、空の配列を返します。
    if (!twoDimArray || twoDimArray.length === 0) {
      YKLiblog.Log.error("入力配列が空か無効です。");
      return [];
    }
  
    // 最初の行をヘッダーとして取得します。
    if(headers === null){
      headers = twoDimArray[0];
      twoDimArray = twoDimArray.slice(1)
    }
  
    // 結果となる連想配列の配列を格納する変数です。
    const result = [];
  
    // 2行目からデータの処理を開始します。
    // 各データ行をループ処理します。
    for (let i = 0; i < twoDimArray.length; i++) {
      const row = twoDimArray[i]; // 現在のデータ行
      const obj = {}; // 現在の行に対応する新しいオブジェクト
  
      // ヘッダーとデータ行の各要素をペアにしてオブジェクトに格納します。
      for (let j = 0; j < headers.length; j++) {
        // ヘッダーのキーと対応するデータ行の値をペアにします。
        // データ行の要素がヘッダーの数より少ない場合でもエラーにならないようにします。
        obj[headers[j]] = row[j] !== undefined ? row[j] : null;
      }
      result.push(obj); // 作成したオブジェクトを結果配列に追加します。
    }
  
    return result; // 連想配列の配列を返します。
  }

  /**
   * 指定された名前で終わるYouTubeスプレッドシートを移動する
   * @param {string} name - ファイル名の末尾に含まれる文字列
   */
  static moveYouTubeSpreadsheets(name) {
    // 移動先のフォルダIDを指定してください
    const destinationFolderId = ENV.youtubeScribeFolderId; // ★ここに移動先のフォルダIDを入力

    const destinationFolder = DriveApp.getFolderById(destinationFolderId);
    const rootFolder = DriveApp.getRootFolder();
    const files = rootFolder.getFiles();

    while (files.hasNext()) {
      const file = files.next();
      if (file.getMimeType() === "application/vnd.google-apps.spreadsheet" && file.getName().endsWith(name)) {
        file.moveTo(destinationFolder);
        YKLiblog.Log.debug(`Moved: ${file.getName()}`);
      }
    }
  }

  /**
   * " - YouTube"で終わるYouTubeスプレッドシートを移動する
   */
  static moveYouTubeSpreadsheetsEndYoutube() {
    Util.moveYouTubeSpreadsheets(" - YouTube")
  }

  /**
   * .jsonで終わるGoogleドキュメントファイルを移動する
   */
  static moveJsonFiles() {
    // 移動先のフォルダIDを指定
    const destinationFolderId = "YOUR_DESTINATION_FOLDER_ID";

    // ルートディレクトリにあるファイルを取得
    const rootFiles = DriveApp.getRootFolder().getFiles();

    // 移動先のフォルダを取得
    const destinationFolder = DriveApp.getFolderById(destinationFolderId);

    // ファイルをループ処理
    while (rootFiles.hasNext()) {
      const file = rootFiles.next();

      // ファイルがGoogleドキュメントで、ファイル名の末尾が「.json」の場合
      if (file.getMimeType() === MimeType.GOOGLE_DOCS && file.getName().endsWith(".json")) {
        // ファイルを移動
        file.moveTo(destinationFolder);
        YKLiblog.Log.debug(`Moved file: ${file.getName()}`);
      }
    }
  }
}
this.Util=Util

/**
 * スプレッドシートの設定とヘッダー・データを取得するテスト関数
 * @param {string} sheetId - スプレッドシートID
 * @param {string} sheetName - シート名
 * @returns {Array} [spreadsheet, worksheet, header, values, headerRange, dataRowsRange, totalRange]
 */
function test_has_re(sheetId, sheetName){
  const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(sheetId, sheetName)
  // const tableDef = this.getTargetedEmailIdsConfigTableDef()
  const nameOfId = "id"
  const headerx = [nameOfId, "from", "subject", "dateStr", "plainBody"]
  const yklibbConfig = new Config( headerx.length, headerx, Config.COMPLETE() )
  const [header, values, headerRange, dataRowsRange, totalRange] = Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig)
  YKLiblog.Log.debug(`values=${values}`)
  return [spreadsheet, worksheet, header, values, headerRange, dataRowsRange, totalRange]
}

/**
 * スプレッドシートの設定とヘッダー・データを取得するテスト関数（COMPLETE設定）
 * @param {string} sheetId - スプレッドシートID
 * @param {string} sheetName - シート名
 * @returns {Array} [spreadsheet, worksheet, header, values, headerRange, dataRowsRange, totalRange]
 */
function test_has_t(sheetId, sheetName){
  const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(sheetId, sheetName)
  const headerIdx = "id"
  const headerx = [headerIdx, "from", "subject", "dateStr", "plainBody"]
  const yklibbConfig = new Config( headerx.length, headerx, Config.COMPLETE )
  const [header, values, headerRange, dataRowsRange, totalRange] = Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig)
  YKLiblog.Log.debug(`values=${values}`)
  return [spreadsheet, worksheet, header, values, headerRange, dataRowsRange, totalRange]
}

/**
 * スプレッドシートの値のみを取得するテスト関数
 * @param {string} sheetId - スプレッドシートID
 * @param {string} sheetName - シート名
 * @returns {Array} [spreadsheet, worksheet, values, totalRange]
 */
function test_has_info(sheetId, sheetName){
  const [spreadsheet, worksheet, values, totalRange] = Gssx.setupSpreadsheetValues(sheetId, sheetName)
  YKLiblog.Log.debug(`values=${values}`)
  return [spreadsheet, worksheet, values, totalRange]
}

/**
 * ログデバッグを初期化してスプレッドシートの値を取得するテスト関数
 */
function test_has_tc(){
  YKLiblog.Log.initLogDebug()
  const sheetId = "1KtGdnnpj8k_bkxfYITalK193nRlVXiN0o_YiASO5KNs"
  const sheetName = "INFO2"
  const [spreadsheet, worksheet, values, totalRange] = test_has_info(sheetId, sheetName)
  // YKLiblog.Log.debug(`values=${values}`)
}

/**
 * 複数のシートでテストを実行する関数
 */
function test_has(){
  YKLiblog.Log.initLogDebug()
  const sheetId = "1Mz4pqoclYFPSmbNlpf_g18CUNTcxt68KkKFVTNEJGg4"
  const sheetName = "Hotwire Weekly"
  test_has_re(sheetId, sheetName)
  const sheetName_t = "Hotwire Weekly"
  test_has_t(sheetId, sheetName_t)
  const sheetName_tf = "Frontend Focus"
  test_has_t(sheetId, sheetName_tf)
}