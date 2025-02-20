/**
 * スプレッドシートとシートを指定して、ヘッダー行とデータ行を取得します。
 *
 * @param {string} spreadsheetId スプレッドシートのID
 * @param {string} sheetName シート名
 * @return {Array<any>} [header, values, dataRange] ヘッダー行、データ行、データ範囲
 */
function setupSpreadsheet(spreadsheetId, sheetName){
  // Logger.log(`setupSpreadsheet spreadsheetId=${spreadsheetId}`);
  // Logger.log(`setupSpreadsheet sheetName=${sheetName}`);

  const [spreadsheet, worksheet] = setupForSpreadsheet(spreadsheetId, sheetName);
  // Logger.log(`setupSpreadsheet worksheet=${worksheet}`);
  
  const [values, dataRange] = getValuesFromSheet(worksheet); 
  // Logger.log(`setupSpreadsheet values=${values}`);
  const header =  values.shift();
  // Logger.log(`setupSpreadsheet header=${header}`);

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
  Logger.log(`adjustDataRangeHeight newHeight=${newHeight} sheet=${sheet.getLastColumn()}`)
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
  Logger.log(`1 getOrCreateWorksheet sheetName=${sheetName} sheet${sheet}`)
  // シートが存在しない場合、新しいシートを作成
  if (sheet == null) {
    sheet = ss.insertSheet(sheetName);
    Logger.log(`2 getOrCreateWorksheet sheetName=${sheetName} sheet=${sheet}`);
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
  Logger.log(`setupForSpreadsheet spreadsheetId=${spreadsheetId} worksheet=${worksheet}`);
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
  Logger.log(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

  var [values, dataRange] = getValuesFromSheet(worksheets[count]);
  var header = values.shift();
  let numRowsOfHeader = 0;

  if( count === 0 ){
    // headerに対するコピー先の範囲を指定 (コピー元と同じサイズ)
    numRowsOfHeader = 1;
    Logger.log(`header=${header}`);
    var numColumnsOfHeader = header.length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
    var headerRange = destinationWorksheet.getRange(1, 1, numRowsOfHeader, numColumnsOfHeader); // 開始位置はA1セル (1行目、1列目)
    // データを書き込み
    headerRange.setValues([header]);
  }

  var numRows = values.length;
  var numColumns = values[0].length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
  var leftTop = 0;
  var rightBottom = 0;
  Logger.log(`1 prevNumRows=<span class="math-inline">\{prevNumRows\} numRowsOfHeader\=</span>{numRowsOfHeader}`);
  if( prevNumRows === 0 ){
    leftTop = 1 + numRowsOfHeader;
  }
  else{
    leftTop = prevNumRows;
  }
  Logger.log(`numRowsOfHeader=<span class="math-inline">\{numRowsOfHeader\} leftTop\=</span>{leftTop} numRows=<span class="math-inline">\{numRows\} numColumns\=</span>{numColumns}`);
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
  // Logger.log(`rows=${JSON.stringify(rows)}`);
  var sheetName;
  var rec = {};
  for( var i = 0; i < rows.length; i++){
    var row = rows[i];
    // Logger.log(`row[1]=${JSON.stringify(row[1])}`);
    switch(rows[i][1]){
      case 2014:
        sheetName = "2014-15";
        // Logger.log(`sheetName=${JSON.stringify(sheetName)}`);
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
    // Logger.log(`sheetName=${JSON.stringify(sheetName)}`);
    if( sheetName !== ""){
      [srcSpreadsheet, srcWorksheet] = setupForSpreadsheet(row[4], row[3]);
      dataByYear = {"year": row[1], "sheetname": sheetName, id: row[4], "worksheet": srcWorksheet};
      if( sheetName in rec ){
        rec[sheetName].push(dataByYear);
      }
      else{
        rec[sheetName] = [];
        rec[sheetName].push(dataByYear);
      }
      // Logger.log(`0 rec=${JSON.stringify(rec)}`);
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

function copyWorksheetContentX() {
  // コピー先のスプレッドシートIDとワークシート名
  const destinationSpreadsheetId = PropertiesService.getScriptProperties().getProperty('DESTINATION_SPREADSHEET_ID');
  let destinationSpreadsheet = null;
  let destinationWorksheet = null;
  const infoSpreadsheetId = PropertiesService.getScriptProperties().getPropery('INFO_SPREADSHEET_ID');
  const infoWorksheetName = PropertiesService.getScriptProperties().getPropery('INFO_WORKSHEET_NAME');

  copyWorksheetContent(destinationSpreadsheetId, infoSpreadsheetId, infoWorksheetName)
}
/**
 * ワークシートの内容をコピーする。
 */
function copyWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {
  Logger.log(`ワークシートの内容`);
  let prevNumRows;
  const sourceWorksheets = getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
  // Logger.log(`sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
  for( var destinationWorksheetName in sourceWorksheets){
    //if( ! (/^2022/.test(destinationWorksheetName) ) ){
    //  Logger.log(`continue destinationWorksheetName=${destinationWorksheetName}`)
    //  continue;
    //}
    Logger.log(`XXXXXXXXXXX destinationWorksheetName=${destinationWorksheetName}`)
    Logger.log(`Z 1`);
    if( !destinationWorksheetName ){
      destinationWorksheetName = "book";
    }
    [destinationSpreadsheet, destinationWorksheet] = setupForSpreadsheet(destinationSpreadsheetId,
 destinationWorksheetName);
    Logger.log(`Z 1 A destinationSpreadsheet=${destinationSpreadsheet}`);
    Logger.log(`Z 1 B destinationWorksheet=${destinationWorksheet}`);

    Logger.log(`Z 2`);
    destinationWorksheet = getOrCreateWorksheet(destinationSpreadsheet, destinationWorksheetName);
    Logger.log(`Z 2 destinationWorksheet=${destinationWorksheet}`);
    // 全てに先立ちコピー先のワークシートをクリアしておく
    // 必要に応じて書式もクリアする場合 (今回は内容のみコピーするためコメントアウト)
    destinationWorksheet.clearContents();

    Logger.log(`D sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
    sourceWorksheet = sourceWorksheets[destinationWorksheetName]
    Logger.log(`C sourceWorksheet=${JSON.stringify(sourceWorksheet)}`);
    sourceWorksheet.sort(compareByYearReverse);
    prevNumRows = 0;
    var srcWorksheets = sourceWorksheet.map( it => it.worksheet );
    for(var count=0; count < srcWorksheets.length; count++){
      Logger.log(`B copyWorksheetContent count=${count} srcWorksheets=${JSON.stringify(srcWorksheets)} prevNumRows=${prevNumRows}`);
      [prevNumRows, numColumns] = copyOneWorksheetContent(count, srcWorksheets, destinationWorksheet, prevNumRows);
    }
    Logger.log('ワークシートの内容をコピーしました: ' + ' -> ' + destinationWorksheetName);
  }
}

function showWorksheetContentX() {
  // const infoSpreadsheetId = PropertiesService.getScriptProperties().getPropery('INFO_SPREADSHEET_ID');
  // コピー先のスプレッドシートIDとワークシート名
  const destinationSpreadsheetId = PropertiesService.getScriptProperties().getProperty('DESTINATION_SPREADSHEET_ID');
  let destinationSpreadsheet = null;
  let destinationWorksheet = null;

  const scriptProperties = PropertiesService.getScriptProperties();
  Logger.log(`typeof scriptProperties = ${typeof scriptProperties}`);
  Logger.log(`scriptProperties = ${scriptProperties}`);

  const infoSpreadsheetId = scriptProperties.getProperty('INFO_SPREADSHEET_ID');
  const infoWorksheetName = PropertiesService.getScriptProperties().getProperty('INFO_WORKSHEET_NAME');

  showWorksheetContent(destinationSpreadsheetId, infoSpreadsheetId, infoWorksheetName)
}

function showWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {
  let prevNumRows;
  const sourceWorksheets = getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
  // Logger.log(`sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
  for( var destinationWorksheetName in sourceWorksheets){
    //if( ! (/^2022/.test(destinationWorksheetName) ) ){
    //  Logger.log(`continue destinationWorksheetName=${destinationWorksheetName}`)
    //  continue;
    //}
    Logger.log(`XXXXXXXXXXX destinationWorksheetName=${destinationWorksheetName}`)
    Logger.log(`Z 1`);
    if( !destinationWorksheetName ){
      destinationWorksheetName = "book";
    }
    [destinationSpreadsheet, destinationWorksheet] = setupForSpreadsheet(destinationSpreadsheetId,
 destinationWorksheetName);
    Logger.log(`Z 1 A destinationSpreadsheet=${destinationSpreadsheet}`);
    Logger.log(`Z 1 B destinationWorksheet=${destinationWorksheet}`);

    Logger.log(`Z 2`);
    destinationWorksheet = getOrCreateWorksheet(destinationSpreadsheet, destinationWorksheetName);
    Logger.log(`Z 2 destinationWorksheet=${destinationWorksheet}`);
    // 全てに先立ちコピー先のワークシートをクリアしておく
    // 必要に応じて書式もクリアする場合 (今回は内容のみコピーするためコメントアウト)
    destinationWorksheet.clearContents();

    Logger.log(`D sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
    sourceWorksheet = sourceWorksheets[destinationWorksheetName]
    Logger.log(`C sourceWorksheet=${JSON.stringify(sourceWorksheet)}`);
    sourceWorksheet.sort(compareByYearReverse);
    prevNumRows = 0;
    var srcWorksheets = sourceWorksheet.map( it => it.worksheet );
    for(var count=0; count < srcWorksheets.length; count++){
      Logger.log(`B copyWorksheetContent count=${count} srcWorksheets=${JSON.stringify(srcWorksheets)} prevNumRows=${prevNumRows}`);
      [prevNumRows, numColumns] = showOneWorksheetContent(count, srcWorksheets, destinationWorksheet, prevNumRows);
    }
    Logger.log('ワークシートの内容をコピーしました: ' + ' -> ' + destinationWorksheetName);
  }
}
function showOneWorksheetContent(count, worksheets, destinationWorksheet, prevNumRows) {
  Logger.log(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

  var [values, dataRange] = getValuesFromSheet(worksheets[count]);
  var header = values.shift();
  let numRowsOfHeader = 0;

  const table = new Table(header, values, dataRange);

  var numRows = values.length;
  var numColumns = values[0].length; // values が空でないことを前提 (空の場合はエラーハンドリングが必要)
  var leftTop = 0;
  var rightBottom = 0;
  Logger.log(`1 prevNumRows=<span class="math-inline">\{prevNumRows\} numRowsOfHeader\=</span>{numRowsOfHeader}`);
  if( prevNumRows === 0 ){
    leftTop = 1 + numRowsOfHeader;
  }
  else{
    leftTop = prevNumRows;
  }

  // table.showB();
  table.showB4();
  // table.reformIsbn();
  // table.reformIsbn4();
  // const array = [table.getHeader(), ...table.getValues()];
  // table.storeTable(array);

  return [prevNumRows, numColumns];
}

