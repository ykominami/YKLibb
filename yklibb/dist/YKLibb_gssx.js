/**
 * スプレッドシートとシートを指定して、ヘッダー行とデータ行を取得します。
 *
 * @param {string} spreadsheetId スプレッドシートのID
 * @param {string} sheetName シート名
 * @return {Array<any>} [header, values, dataRange] ヘッダー行、データ行、データ範囲
 */
function setupSpreadsheet(spreadsheetId, sheetName){
  const [spreadsheet, worksheet] = setupForSpreadsheet(spreadsheetId, sheetName);
  return setupSpreadsheetX(worksheet);
}
/**
 * ワークシートからヘッダー行とデータ行を取得します。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} worksheet 取得元のワークシート
 * @return {Array<any>} [header, values, dataRange] ヘッダー行、データ行、データ範囲
 */
function setupSpreadsheetX(worksheet){
  const [values, dataRange] = getValuesFromSheet(worksheet); 
  const header =  values.shift();

  return [header, values, dataRange];
}

/**
 * ワークシートのRangeの高さを、A列の連続した空白でないセルの並びの最大のものを含むように修正します。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 修正対象のワークシート
 */
function adjustDataRangeHeight(sheet) {
  // A列のデータを取得
  const aColumnValues = sheet.getRange("A2:A").getValues();

  // 連続した空白でないセルの数をカウント
  let maxConsecutiveCells = 0;
  let currentConsecutiveCells = 0;
  for (const value of aColumnValues) {
    if (value[0] !== "") {
      currentConsecutiveCells++;
    } else {
      maxConsecutiveCells = Math.max(maxConsecutiveCells, currentConsecutiveCells);
      currentConsecutiveCells = 0;
    }
  }
  maxConsecutiveCells = Math.max(maxConsecutiveCells, currentConsecutiveCells);

  // データの最終行を取得
  const lastRow = sheet.getLastRow();

  // 修正後の高さを計算
  const newHeight = Math.max(maxConsecutiveCells, lastRow);

  // Rangeの高さを修正
  YKLiblog.Log.debug(`adjustDataRangeHeight newHeight=${newHeight} sheet=${sheet.getLastColumn()}`)
  let range;
  if( newHeight > 1){
    range = sheet.getRange(1, 1, newHeight, sheet.getLastColumn())
    range.activate();
  } else {
    range = sheet.getDataRange();
  }
  return range;
}

/**
 * ワークシートから値を取得する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} worksheet 取得元のワークシート
 * @returns {Array} ワークシートの値の二次元配列
 */
function getValuesFromSheet(worksheet){
  // データ範囲を取得
  var dataRange = adjustDataRangeHeight(worksheet);
  // データ範囲の値を取得 (二次元配列)
  var values = dataRange.getValues();

  return [values, dataRange];
}

/**
 * 指定した名前のシートが存在しない場合、新しいシートを作成する。
 * @param {Spreadsheet} Spreadsheet スプレッドシート
 * @param {string} sheetName シート名
 */
function getOrCreateWorksheet(ss, sheetName) {
  // 指定した名前のシートが存在するか確認
  var sheet = ss.getSheetByName(sheetName);
  // シートが存在しない場合、新しいシートを作成
  if (sheet == null) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * スプレッドシートとワークシートをセットアップする。
 *
 * @param {string} spreadsheetId スプレッドシートID
 * @param {string} sheetName ワークシート名
 * @returns {Array} スプレッドシートとワークシート
 */
function setupForSpreadsheet(spreadsheetId, sheetName){
  // スプレッドシートを開く (IDで指定)
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // ワークシートを取得 (名前で指定)
  var worksheet = getOrCreateWorksheet(spreadsheet,sheetName);
  return [spreadsheet, worksheet]; 
}
/**
 * 1つのワークシートの内容をコピーする。
 *
 * @param {number} count ワークシートのカウント
 * @param {Array} worksheets ワークシートの配列
 * @param {GoogleAppsScript.Spreadsheet.Sheet} destinationWorksheet コピー先のワークシート
 * @param {number} prevNumRows 前回の行数
 * @returns {Array} 前回の行数と列数
 */
function copyOneWorksheetContent(count, worksheets, destinationWorksheet, prevNumRows) {
  YKLiblog.Log.debug(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

  var [values, dataRange] = getValuesFromSheet(worksheets[count]);
  var header = values.shift();
  let numRowsOfHeader = 0;

  if( count === 0 ){
    // headerに対するコピー先の範囲を指定 (コピー元と同じサイズ)
    numRowsOfHeader = 1;
    YKLiblog.Log.debug(`header=${header}`);
    var numColumnsOfHeader = header.length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
    var headerRange = destinationWorksheet.getRange(1, 1, numRowsOfHeader, numColumnsOfHeader); // 開始位置はA1セル (1行目、1列目)
    // データを書き込み
    headerRange.setValues([header]);
  }

  var numRows = values.length;
  var numColumns = values[0].length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
  var leftTop = 0;
  var rightBottom = 0;
  YKLiblog.Log.debug(`1 prevNumRows=<span class="math-inline">\{prevNumRows\} numRowsOfHeader\=</span>{numRowsOfHeader}`);
  if( prevNumRows === 0 ){
    leftTop = 1 + numRowsOfHeader;
  }
  else{
    leftTop = prevNumRows;
  }
  YKLiblog.Log.debug(`numRowsOfHeader=<span class="math-inline">\{numRowsOfHeader\} leftTop\=</span>{leftTop} numRows=<span class="math-inline">\{numRows\} numColumns\=</span>{numColumns}`);
  var destinationRange = destinationWorksheet.getRange(leftTop, 1, numRows, numColumns); // 開始位置はA1セル (1行目、1列目)

  // データを書き込み
  destinationRange.setValues(values);
  prevNumRows = prevNumRows + numRows;
  return [prevNumRows, numColumns];
}

/**
 * コピー元のワークシートを取得する。
 *
 * @param {string} spreadsheetId スプレッドシートID
 * @param {string} worksheetName ワークシート名
 * @returns {object} ワークシートの情報を持つオブジェクト
 */
function getSourceWorksheets(spreadsheetId, worksheetName){
  var [spreadsheet, worksheet] = setupForSpreadsheet(spreadsheetId, worksheetName);
  var [values, dataRange] = getValuesFromSheet(worksheet);
  var rows = values.filter( row => row[0] === "book" && /^\d+$/.test(row[1]) );
  // YKLiblog.Log.debug(`rows=${JSON.stringify(rows)}`);
  var sheetName;
  var rec = {};
  for( let i = 0; i < rows.length; i++){
    var row = rows[i];
    // YKLiblog.Log.debug(`row[1]=${JSON.stringify(row[1])}`);
    const year = row[1];
    switch(year){
      case 2014:
        sheetName = "2014-15";
        // YKLiblog.Log.debug(`sheetName=${JSON.stringify(sheetName)}`);
        break;
      case 2015:
        sheetName = "2014-15";
        break;
      case 2016:
        sheetName = "2016-17";
        break;
      case 2017:
        sheetName = "2016-17";
        break;
      case 2018:
        sheetName = "2018-19";
        break;
      case 2019:
        sheetName = "2018-19";
        break;
      case 2020:
        sheetName = "2020-21";
        break;
      case 2021:
        sheetName = "2020-21";
        break;
      case 2022:
        // sheetName = "2022-25";
        sheetName = "2022-25";
        // sheetName = "2022";
        break;
      case 2023:
        // sheetName = "2022-25";
        sheetName = "2022-25";
        // sheetName = "2023";
        break;
      case 2024:
        // sheetName = "2022-25";
        sheetName = "2022-25";
        break;
      case 2025:
        // sheetName = "2022-25";
        sheetName = "2022-25";
        break;
      default:
        sheetName = "";
    }
    // YKLiblog.Log.debug(`sheetName=${JSON.stringify(sheetName)}`);
    if( sheetName !== ""){
      const spreadsheetId = row[4];
      const [srcSpreadsheet, srcWorksheet] = setupForSpreadsheet(spreadsheetId, sheetName);
      const dataByYear = {"year": row[1], "sheetname": sheetName, id: spreadsheetId, "worksheet": srcWorksheet};
      if( sheetName in rec ){
        rec[sheetName].push(dataByYear);
      }
      else{
        rec[sheetName] = [];
        rec[sheetName].push(dataByYear);
      }
      // YKLiblog.Log.debug(`0 rec=${JSON.stringify(rec)}`);
    }
  }

  return rec;
}

/**
 * 年で比較する関数
 * @param {object} a 比較対象のオブジェクト
 * @param {object} b 比較対象のオブジェクト
 * @returns {number} 比較結果
 */
function compareByYear(a, b) {
  if (a.year > b.year) {
    return -1; // 降順の場合は、大小関係を逆にする
  }
  if (a.year < b.year) {
    return 1;
  }
  return 0;
}

/**
 * 年で逆順に比較する関数
 * @param {object} a 比較対象のオブジェクト
 * @param {object} b 比較対象のオブジェクト
 * @returns {number} 比較結果
 */
function compareByYearReverse(a, b) {
  if (a.year > b.year) {
    return 1; // 降順の場合は、大小関係を逆にする
  }
  if (a.year < b.year) {
    return -1;
  }
  return 0;
}

/**
 * 環境変数からパラメータを取得してワークシートの内容をコピーします。
 *
 * @param {object} env 環境変数オブジェクト
 * @param {string} env.destinationSpreadsheetId コピー先スプレッドシートID
 * @param {string} env.sourceSpreadsheetId コピー元スプレッドシートID
 * @param {string} env.sourceWorksheetName コピー元ワークシート名
 * @return {void}
 */
function copyWorksheetContentX(env) {
  const destinationSpreadsheetId = env.get("destinationSpreadsheetId");
  const sourceSpreadsheetId = env.get("sourceSpreadsheetId");
  const sourceWorksheetName = env.get("sourceWorksheetName");
  // YKLiblog.Log.debug(`destinationSpreadsheetId=${destinationSpreadsheetId} sourceSpreadsheetId=${sourceSpreadsheetId} sourceWorksheetName=${sourceWorksheetName}`);
  return copyWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName);
}
/**
 * ワークシートの内容をコピーする。
 */
function copyWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {

  const rec = getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
  // YKLiblog.Log.debug(`rec=${JSON.stringify(rec)}`);
  const keys = Object.keys(rec);
  const [spreadsheet, worksheet] = setupForSpreadsheet(destinationSpreadsheetId, sourceWorksheetName);
  const allSheetNames = getAllWorksheetNames(destinationSpreadsheetId);
  for( var i = 0; i < allSheetNames.length; i++){
    var sheetName = allSheetNames[i];
    if( !keys.includes(sheetName)){
      var sheet = spreadsheet.getSheetByName(sheetName);
      // YKLiblog.Log.debug(`deleteSheet ${sheetName}`);
      spreadsheet.deleteSheet(sheet);
    }
  }
  for( var i = 0; i < keys.length; i++){
    var key = keys[i];
    var sheet = getOrCreateWorksheet(spreadsheet, key);
    // YKLiblog.Log.debug(`sheet.clear()`);
    sheet.clear();
    var values = rec[key];
    // YKLiblog.Log.debug(`values=${JSON.stringify(values)}`);
    values.sort(compareByYearReverse);
    var prevNumRows = 0;
    for( var j = 0; j < values.length; j++){
      var value = values[j];
      var worksheet = value["worksheet"];
      var [prevNumRows, numColumns] = copyOneWorksheetContent(j, [worksheet], sheet, prevNumRows);
    }
    // break;
  }
}

/**
 * 環境変数からパラメータを取得してワークシートの内容を表示します。
 *
 * @param {object} env 環境変数オブジェクト
 * @param {string} env.destinationSpreadsheetId 表示先スプレッドシートID
 * @param {string} env.sourceSpreadsheetId 表示元スプレッドシートID
 * @param {string} env.sourceWorksheetName 表示元ワークシート名
 * @return {void}
 */
function showWorksheetContentX(env) {
  const destinationSpreadsheetId = env.get("destinationSpreadsheetId");
  const sourceSpreadsheetId = env.get("sourceSpreadsheetId");
  const sourceWorksheetName = env.get("sourceWorksheetName");
  // YKLiblog.Log.debug(`destinationSpreadsheetId=${destinationSpreadsheetId} sourceSpreadsheetId=${sourceSpreadsheetId} sourceWorksheetName=${sourceWorksheetName}`);
  return showWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName);
}

function showWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {
  var rec = getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
  var keys = Object.keys(rec);
  var [spreadsheet, worksheet] = setupForSpreadsheet(destinationSpreadsheetId);
  var allSheetNames = getAllWorksheetNames(destinationSpreadsheetId);
  for( var i = 0; i < allSheetNames.length; i++){
    var sheetName = allSheetNames[i];
    if( !keys.includes(sheetName)){
      var sheet = spreadsheet.getSheetByName(sheetName);
      // YKLiblog.Log.debug(`deleteSheet ${sheetName}`);
      spreadsheet.deleteSheet(sheet);
    }
  }
  for( var i = 0; i < keys.length; i++){
    var key = keys[i];
    var sheet = getOrCreateWorksheet(spreadsheet, key);
    sheet.clear();
    var values = rec[key];
    values.sort(compareByYear);
    // YKLiblog.Log.debug(`values=${JSON.stringify(values)}`);
    var prevNumRows = 0;
    for( var j = 0; j < values.length; j++){
      var value = values[j];
      var worksheet = value["worksheet"];
      var [prevNumRows, numColumns] = showOneWorksheetContent(j, [worksheet], sheet, prevNumRows);
    }
    break;
  }
}

/**
 * 1つのワークシートの内容を表示用にコピーします。
 *
 * @param {number} count ワークシートのカウント
 * @param {Array} worksheets ワークシートの配列
 * @param {GoogleAppsScript.Spreadsheet.Sheet} destinationWorksheet コピー先のワークシート
 * @param {number} prevNumRows 前回の行数
 * @returns {Array} 前回の行数と列数
 */
function showOneWorksheetContent(count, worksheets, destinationWorksheet, prevNumRows) {
  // YKLiblog.Log.debug(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

  var [values, dataRange] = getValuesFromSheet(worksheets[count]);
  var header = values.shift();
  let numRowsOfHeader = 0;

  if( count === 0 ){
    // headerに対するコピー先の範囲を指定 (コピー元と同じサイズ)
    numRowsOfHeader = 1;
    // YKLiblog.Log.debug(`header=${header}`);
    var numColumnsOfHeader = header.length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
    var headerRange = destinationWorksheet.getRange(1, 1, numRowsOfHeader, numColumnsOfHeader); // 開始位置はA1セル (1行目、1列目)
    // データを書き込み
    headerRange.setValues([header]);
  }

  var numRows = values.length;
  var numColumns = values[0].length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
  var leftTop = 0;
  var rightBottom = 0;
  // YKLiblog.Log.debug(`1 prevNumRows=<span class="math-inline">\{prevNumRows\} numRowsOfHeader\=</span>{numRowsOfHeader}`);
  if( prevNumRows === 0 ){
    leftTop = 1 + numRowsOfHeader;
  }
  else{
    leftTop = prevNumRows;
  }
  // YKLiblog.Log.debug(`numRowsOfHeader=<span class="math-inline">\{numRowsOfHeader\} leftTop\=</span>{leftTop} numRows=<span class="math-inline">\{numRows\} numColumns\=</span>{numColumns}`);
  var destinationRange = destinationWorksheet.getRange(leftTop, 1, numRows, numColumns); // 開始位置はA1セル (1行目、1列目)

  // データを書き込み
  destinationRange.setValues(values);
  prevNumRows = prevNumRows + numRows;
  return [prevNumRows, numColumns];
}
/**
 * 指定されたスプレッドシートのすべてのワークシートの名前を取得します。
 *
 * @param {string} spreadsheetId 取得したいスプレッドシートのID
 * @return {string[]} ワークシート名の配列
 */
function getAllWorksheetNames(spreadsheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    return sheetNames;
  } catch (error) {
    YKLiblog.Log.fault("スプレッドシートの取得に失敗しました:", error);
    return []; // エラー発生時は空の配列を返します
  }
}

/**
 * 受け取ったデータをJSON形式の文字列に変換します。
 *
 * @param {any} data JSONに変換したいデータ
 * @return {string} JSON形式の文字列
 */
function convertToJSON(data) {
  return JSON.stringify(data, null, 2); // null, 2 はJSONを見やすく整形するための引数です
}

