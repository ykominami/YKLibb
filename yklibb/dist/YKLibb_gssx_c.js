/**
 * Gssxクラス - Google Apps Script スプレッドシート操作用のユーティリティクラス
 */
class Gssx {
  /**
   * スプレッドシートとシートを指定して、ヘッダー行とデータ行を取得します。
   *
   * @param {string} spreadsheetId スプレッドシートのID
   * @param {string} sheetName シート名
   * @return {Array<any>} [header, dataValues, totalRange] ヘッダー行、データ行、全範囲
   */
  static setupSpreadsheet(spreadsheetId, sheetName, ultimate=false){
    const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
    const [header, dataValues, totalRange] = Gssx.setupSpreadsheetForHeaderAndValues(worksheet, ultimate);
    return [header, dataValues, totalRange]
  }

  /**
   * スプレッドシートとシートを指定して、スプレッドシート、ワークシート、値、データ範囲を取得します。
   *
   * @param {string} spreadsheetId スプレッドシートのID
   * @param {string} sheetName シート名
   * @return {Array<any>} [spreadsheet, worksheet, values, totalRange] スプレッドシート、ワークシート、値、データ範囲
   */
  static setupSpreadsheetValues(spreadsheetId, sheetName, ultimate = false){
    const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
    const totalRange = Gssx.getMinimalContentRange(worksheet, ultimate)
    if( totalRange === null){
      return [spreadsheet, worksheet, null, null]
    }
    const values = totalRange.getValues()
    return [spreadsheet, worksheet, values, totalRange]
  }

  /**
   * スプレッドシートとシート名を指定して、ワークシートとデータ範囲を取得します。シートが存在しない場合は新規作成します。
   *
   * @param {Spreadsheet} spreadsheet スプレッドシートオブジェクト
   * @param {string} sheetName シート名
   * @return {Array<any>} [worksheet, range] ワークシート、データ範囲
   */
  static getDataSheetRange(spreadsheet, sheetName, ultimate = false){
    YKLiblog.Log.debug(`Util.getDataSheetRange sheetName=${sheetName}`)
    let worksheet = spreadsheet.getSheetByName(sheetName);
    if(worksheet === null){
      worksheet = spreadsheet.insertSheet(sheetName)
      YKLiblog.Log.debug(`Util.getDataSheetRange insert sheetName=${sheetName}`)
    }
    const range = Gssx.getMinimalContentRange(worksheet, ultimate)
    // throw new Error('getDataSheetRange')
    return [worksheet, range]
  }

  /**
   * 指定された範囲からヘッダー行の範囲を取得します。
   *
   * @param {Range} range 対象の範囲
   * @return {Range} ヘッダー行の範囲（1行目）
   */
  static getHeaderRange(range){
    if( range === null){
      return null
    }
    const shape = YKLiba.Range.getRangeShape(range)
    const headerRange = range.offset(0,0, 1, shape.w)
    return headerRange
  }

  /**
   * 指定された範囲からデータ行の範囲を取得します。
   *
   * @param {Range} range 対象の範囲
   * @return {Range} データ行の範囲（2行目以降）
   */
  static getDataRowsRange(range){
    if( range === null ){
      return null
    }
    const shape = YKLiba.Range.getRangeShape(range)
    const dataRowsRange =  range.offset(1,0)
    return dataRowsRange
  }

  /**
   * ワークシートから値とデータ範囲を取得します。
   *
   * @param {Sheet} worksheet 対象のワークシート
   * @return {Array<any>} [values, totalRange] 値の二次元配列、データ範囲
   */
  static getValuesFromSheet(worksheet, ultimate=false){
    // データ範囲を取得
    const totalRange = Gssx.getMinimalContentRange(worksheet, ultimate);
    if(totalRange === null){
      return [null, null]
    }
    // データ範囲の値を取得 (二次元配列)
    const totalValues = totalRange.getValues();

    return [totalValues, totalRange];
  }

  /**
   * ワークシートを指定して、ヘッダー行とデータ行を取得します。
   *
   * @param {Sheet} worksheet 対象のワークシート
   * @return {Array<any>} [header, dataValues, totalRange] ヘッダー行、データ行、全範囲
   */
  static setupSpreadsheetForHeaderAndValues(worksheet, ultimate=false){
    const [totalValues, totalRange] = Gssx.getValuesFromSheet(worksheet, ultimate); 
    // const header =  values.shift();
    // const header =  totalValues.slice(0, 1);
    const header =  totalValues[0];
    const dataValues =  totalValues.slice(1);

    return [header, dataValues, totalRange];
  }

  /**
   * ワークシートの1列目のみを使用してヘッダーとデータを取得します。
   *
   * @param {Sheet} worksheet 対象のワークシート
   * @param {Object} config 設定オブジェクト
   * @return {Array<any>} ヘッダーとデータの情報
   */
  static setupSpreadsheetAndHeaderAndDataOfCol1(worksheet, config, ultimate = false){
    const totalRange = Gssx.getMinimalContentRange(worksheet, ultimate);
    if( totalRange === null ){
      return [null, null, null, null, null]
    }
    const totalVallues = totalRange.getValues()
    // YKLiblog.Log.debug(`setupSpreadsheetAndHeaderAndDataOfCol1 totalVallues=${totalVallues}`)
    const col1Config = config.transform(0,1)
    const col1Range = totalRange.offset(0, 0, totalRange.getHeight(), 1)
    const col1Values = col1Range.getValues()
    const [header, values, headerRange, dataRowsRange, totalRange1] = Gssx.getHeaderAndData(col1Values, col1Range, col1Config)
    return [header, values, headerRange, dataRowsRange, totalRange1]
  }

  /**
   * ワークシートと設定を指定して、ヘッダー行とデータ行を取得します。
   *
   * @param {Sheet} worksheet 対象のワークシート
   * @param {Object} yklibbconfig 設定オブジェクト
   * @return {Array<any>} ヘッダーとデータの情報
   */
  static setupSpreadsheetAndHeaderAndData(worksheet, yklibbconfig, ultimate=false){
    const [totalValues0, totalRange0] = Gssx.getValuesFromSheet(worksheet, ultimate);
    const [header, values, headerRange, dataRowsRange, totalRange] =  Gssx.getHeaderAndData(totalValues0, totalRange0, yklibbconfig, ultimate)
    return [header, values, headerRange, dataRowsRange, totalRange]
  }

  /**
   * ワークシートとYKLibb設定を指定して、ヘッダーとデータを取得します。
   *
   * @param {Sheet} worksheet 対象のワークシート
   * @param {Object} yklibbconfig YKLibb設定オブジェクト
   * @return {Array<any>} ヘッダーとデータの情報
   */
  static getHeaderAndDataFromWorksheet(worksheet, yklibbconfig){
    const [totalValues0, totalRange0] = Gssx.getValuesFromSheet(worksheet);
    const [header, values, headerRange, dataRowsRange, totalRange] =  Gssx.getHeaderAndData(totalValues0, totalRange0, yklibbconfig)
    return [header, values, headerRange, dataRowsRange, totalRange]
  }

  /**
   * 値、データ範囲、設定を指定して、ヘッダーとデータの情報を取得します。
   *-
   * @param {Array<Array<any>>} values 値の二次元配列
   * @param {Range} totalRange データ範囲
   * @param {Object} config 設定オブジェクト
   * @return {Array<any>} [header, values, headerRange, dataRowsRange, totalRange] ヘッダー、値、ヘッダー範囲、データ行範囲、全体範囲
   */
  static getHeaderAndData(values, totalRange, config){
    let result, validHeader, validDataRows
    let header = null
    let headerRange = null
    let dataRowsRange = null
    let totalValues 
    if( totalRange === null){
      return [header, totalValues, headerRange, dataRowsRange, totalRange];
    }
    const totalRangeShape = YKLiba.Range.getRangeShape(totalRange)
    const t = totalRangeShape
    YKLiblog.Log.debug(`totalRangeShape t.r=${t.r} t.c=${t.c} t.h=${t.h} t.w=${t.w}`)
    if( config.way == Config.NONE()){
      result = true
      validHeader = true
      validDataRows = true
    }
    else{
      [result, validHeader, validDataRows] = Util.hasValidDataHeaderAndDataRows(totalRange, config)
    }
    YKLiblog.Log.debug(`getHeaderAndData result=${result} validHeader=${validHeader} validDataRows=${validDataRows}`)
    // ValidHeader
    if( validHeader ){
      header = values.slice(0,1)[0]
      if( validDataRows ){
        headerRange = totalRange.offset(0, 0, 1, totalRangeShape.w)
        let h = totalRangeShape.h - 1
        if( h === 0 ){
          h = 1
        }
        dataRowsRange = totalRange.offset(1, 0, h, totalRangeShape.w)
      }
      // InvalidDataRows
      else{
        headerRange = totalRange.offset(0, 0, 1, config.getHeaderWidth())
        dataRowsRange = null
      }
    }
    // InvalidHeader
    else{
      header = null
      // headerRange = totalRange.offset(0, 0, 1, config.getHeaderWidth())
      headerRange   = null
      // ValidDataRows
      if( validDataRows ){
        dataRowsRange = totalRange
      }
      else{
        values = null
        dataRowsRange = null
      }
    }
    totalValues = values
    return [header, totalValues, headerRange, dataRowsRange, totalRange];
  }

  /**
   * スプレッドシートとワークシートをセットアップする。
   *
   * @param {string} spreadsheetId スプレッドシートID
   * @param {string} sheetName ワークシート名
   * @returns {Array} スプレッドシートとワークシート
   */
  static setupForSpreadsheet(spreadsheetId, sheetName){
    YKLiblog.Log.debug(`spreadsheetId=${spreadsheetId} sheetName=${sheetName}`)
    // スプレッドシートを開く (IDで指定)
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    // ワークシートを取得 (名前で指定)
    const worksheet = Gssx.getOrCreateWorksheet(spreadsheet,sheetName);
    return [spreadsheet, worksheet]; 
  }

  static getMinimalContentRange(sheet, ultimate=false) {
    if (!sheet) {
      YKLiblog.Log.debug("シートが指定されていません。");
      return null
    }
    let range
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    // シートにデータがない場合
    if (lastRow === 0 || lastColumn === 0) {
      YKLiblog.Log.debug("シートにデータがありません。");
      return sheet.getRange(1, 1, 1, 1);
    }

    // 初期値として、非常に大きな値と小さな値を設定
    let minRow = lastRow + 1;    // 実際の行番号より大きい値
    let maxRow = 0;             // 実際の行番号より小さい値
    let minCol = lastColumn + 1; // 実際の列番号より大きい値
    let maxCol = 0;             // 実際の列番号より小さい値

    // シート全体の値をまとめて取得して処理を高速化
    // getDisplayValues() を使用すると、数式の結果なども取得できる
    const values = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();

    let foundLine = -1
    // 各セルをループして空白でないセルを検索
    for (let r = 0; r < lastRow && foundLine < 0; r++) {       // rは0ベースインデックス
      for (let c = 0; c < lastColumn && foundLine < 0; c++) {  // cは0ベースインデックス
        if (values[r][c] !== "") {
          // 空白でないセルが見つかった場合、最小/最大値を更新
          minRow = Math.min(minRow, r + 1); // 1ベースに変換して保存
          maxRow = Math.max(maxRow, r + 1);
          minCol = Math.min(minCol, c + 1); // 1ベースに変換して保存
          maxCol = Math.max(maxCol, c + 1);
        }
        else{
          if( ultimate ){
            YKLiblog.Log.debug(`getMinimalContentRange r=${r} c=${c}`)
            foundLine = r
          }
        }
      }
    }

    // データが見つからなかった場合（minRowが初期値のまま）
    if (maxRow === 0) {
      YKLiblog.Log.debug("シートに空白でないセルが見つかりませんでした。");
      // return null;
      return sheet.getRange(1, 1, 1, 1);
    }

    // 最小領域を作成
    if( foundLine < 0){
      range = sheet.getRange(minRow, minCol, maxRow - minRow + 1, maxCol - minCol + 1);
    }
    else{
      range = sheet.getRange(minRow, minCol, foundLine, maxCol - minCol + 1);
    }
    const rangeShape = YKLiba.Range.getRangeShape(range)
    return range
  }

  /**
   * ワークシートのRangeの高さを、A列の連続した空白でないセルの並びの最大のものを含むように修正します。
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 修正対象のワークシート
   * @return {Range} 修正された範囲
   */
  static adjustDataRangeHeight(sheet) {
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
   * ワークシートの1列目の値と範囲を取得します。
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} worksheet 取得元のワークシート
   * @returns {Array} [values, col1Range, totalRange] 1列目の値、1列目の範囲、全体の範囲
   */
  static getValuesOfCol1FromSheet(worksheet){
    // データ範囲を取得
    const totalRange = Gssx.getMinimalContentRange(worksheet);
    if( totalRange === null){
      return [null, null, null];
    }
    const height = totalRange.getHeight()
    const col1Range = totalRange.offset(0,0, height,1)
    // データ範囲の値を取得 (二次元配列)
    const values = col1Range.getValues();
    return [values, col1Range, totalRange];
  }

  /**
   * 指定した名前のシートが存在しない場合、新しいシートを作成する。
   * @param {Spreadsheet} ss スプレッドシート
   * @param {string} sheetName シート名
   * @return {Sheet} ワークシート
   */
  static getOrCreateWorksheet(ss, sheetName) {
    // 指定した名前のシートが存在するか確認
    var sheet = ss.getSheetByName(sheetName);
    // シートが存在しない場合、新しいシートを作成
    if (sheet == null) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
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
  static copyOneWorksheetContent(count, worksheets, destinationWorksheet, prevNumRows) {
    YKLiblog.Log.debug(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

    var [values, dataRange] = Gssx.getValuesFromSheet(worksheets[count]);
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
  static getSourceWorksheets(spreadsheetId, worksheetName){
    var [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, worksheetName);
    var [values, dataRange] = Gssx.getValuesFromSheet(worksheet);
    var rows = values.filter( row => row[0] === "book" && /^\d+$/.test(row[1]) );
    // YKLiblog.Log.debug(`rows=${JSON.stringify(rows)}`);
    var sheetName;
    var rec = {};
    for( var i = 0; i < rows.length; i++){
      var row = rows[i];
      // YKLiblog.Log.debug(`row[1]=${JSON.stringify(row[1])}`);
      switch(rows[i][1]){
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
        let srcSpreadsheet, srcWorksheet;
        [srcSpreadsheet, srcWorksheet] = Gssx.setupForSpreadsheet(row[4], row[3]);
        dataByYear = {"year": row[1], "sheetname": sheetName, id: row[4], "worksheet": srcWorksheet};
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
   * 年で比較する関数（降順）
   * @param {object} a 比較対象のオブジェクト
   * @param {object} b 比較対象のオブジェクト
   * @returns {number} 比較結果
   */
  static compareByYear(a, b) {
    if (a.year > b.year) {
      return -1; // 降順の場合は、大小関係を逆にする
    }
    if (a.year < b.year) {
      return 1;
    }
    return 0;
  }

  /**
   * 年で逆順に比較する関数（昇順）
   * @param {object} a 比較対象のオブジェクト
   * @param {object} b 比較対象のオブジェクト
   * @returns {number} 比較結果
   */
  static compareByYearReverse(a, b) {
    if (a.year > b.year) {
      return 1; // 降順の場合は、大小関係を逆にする
    }
    if (a.year < b.year) {
      return -1;
    }
    return 0;
  }

  /**
   * 環境設定を使用してワークシートの内容をコピーする。
   *
   * @param {Object} env 環境設定オブジェクト
   */
  static copyWorksheetContentX(env) {
    Gssx.copyWorksheetContent(env.destinationSpreadsheetId, env.infoSpreadsheetId, env.infoWorksheetName)
  }

  /**
   * ワークシートの内容をコピーする。
   *
   * @param {string} destinationSpreadsheetId コピー先スプレッドシートID
   * @param {string} sourceSpreadsheetId コピー元スプレッドシートID
   * @param {string} sourceWorksheetName コピー元ワークシート名
   */
  static copyWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {
    YKLiblog.Log.debug(`ワークシートの内容`);
    let prevNumRows;
    const sourceWorksheets = Gssx.getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
    // YKLiblog.Log.debug(`sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
    for( var destinationWorksheetName in sourceWorksheets){
      //if( ! (/^2022/.test(destinationWorksheetName) ) ){
      //  YKLiblog.Log.debug(`continue destinationWorksheetName=${destinationWorksheetName}`)
      //  continue;
      //}
      YKLiblog.Log.debug(`XXXXXXXXXXX destinationWorksheetName=${destinationWorksheetName}`)
      YKLiblog.Log.debug(`Z 1`);
      if( !destinationWorksheetName ){
        destinationWorksheetName = "book";
      }
      const [destinationSpreadsheet, destinationWorksheet] = Gssx.setupForSpreadsheet(destinationSpreadsheetId,
   destinationWorksheetName);
      YKLiblog.Log.debug(`Z 1 A destinationSpreadsheet=${destinationSpreadsheet}`);
      YKLiblog.Log.debug(`Z 1 B destinationWorksheet=${destinationWorksheet}`);

      YKLiblog.Log.debug(`Z 2`);
      destinationWorksheet = Gssx.getOrCreateWorksheet(destinationSpreadsheet, destinationWorksheetName);
      YKLiblog.Log.debug(`Z 2 destinationWorksheet=${destinationWorksheet}`);
      // 全てに先立ちコピー先のワークシートをクリアしておく
      // 必要に応じて書式もクリアする場合 (今回は内容のみコピーするためコメントアウト)
      destinationWorksheet.clearContents();

      YKLiblog.Log.debug(`D sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
      sourceWorksheet = sourceWorksheets[destinationWorksheetName]
      YKLiblog.Log.debug(`C sourceWorksheet=${JSON.stringify(sourceWorksheet)}`);
      sourceWorksheet.sort(Gssx.compareByYearReverse);
      prevNumRows = 0;
      var srcWorksheets = sourceWorksheet.map( it => it.worksheet );
      for(var count=0; count < srcWorksheets.length; count++){
        YKLiblog.Log.debug(`B copyWorksheetContent count=${count} srcWorksheets=${JSON.stringify(srcWorksheets)} prevNumRows=${prevNumRows}`);
        [prevNumRows, numColumns] = Gssx.copyOneWorksheetContent(count, srcWorksheets, destinationWorksheet, prevNumRows);
      }
      YKLiblog.Log.debug('ワークシートの内容をコピーしました: ' + ' -> ' + destinationWorksheetName);
    }
  }

  /**
   * 環境設定を使用してワークシートの内容を表示する。
   *
   * @param {Object} env 環境設定オブジェクト
   */
  static showWorksheetContentX(env) {
    Gssx.showWorksheetContent(env.destinationSpreadsheetId, env.infoSpreadsheetId, env.infoWorksheetName)
  }

  /**
   * ワークシートの内容を表示する。
   *
   * @param {string} destinationSpreadsheetId 表示先スプレッドシートID
   * @param {string} sourceSpreadsheetId 表示元スプレッドシートID
   * @param {string} sourceWorksheetName 表示元ワークシート名
   */
  static showWorksheetContent(destinationSpreadsheetId, sourceSpreadsheetId, sourceWorksheetName) {
    let prevNumRows;
    const sourceWorksheets = Gssx.getSourceWorksheets(sourceSpreadsheetId, sourceWorksheetName);
    // YKLiblog.Log.debug(`sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
    for( var destinationWorksheetName in sourceWorksheets){
      //if( ! (/^2022/.test(destinationWorksheetName) ) ){
      //  YKLiblog.Log.debug(`continue destinationWorksheetName=${destinationWorksheetName}`)
      //  continue;
      //}
      YKLiblog.Log.debug(`XXXXXXXXXXX destinationWorksheetName=${destinationWorksheetName}`)
      YKLiblog.Log.debug(`Z 1`);
      if( !destinationWorksheetName ){
        destinationWorksheetName = "book";
      }
      const [destinationSpreadsheet, destinationWorksheet] = Gssx.setupForSpreadsheet(destinationSpreadsheetId,
   destinationWorksheetName);
      YKLiblog.Log.debug(`Z 1 A destinationSpreadsheet=${destinationSpreadsheet}`);
      YKLiblog.Log.debug(`Z 1 B destinationWorksheet=${destinationWorksheet}`);

      YKLiblog.Log.debug(`Z 2`);
      destinationWorksheet = Gssx.getOrCreateWorksheet(destinationSpreadsheet, destinationWorksheetName);
      YKLiblog.Log.debug(`Z 2 destinationWorksheet=${destinationWorksheet}`);
      // 全てに先立ちコピー先のワークシートをクリアしておく
      // 必要に応じて書式もクリアする場合 (今回は内容のみコピーするためコメントアウト)
      destinationWorksheet.clearContents();

      YKLiblog.Log.debug(`D sourceWorksheets=${JSON.stringify(sourceWorksheets)}`);
      sourceWorksheet = sourceWorksheets[destinationWorksheetName]
      YKLiblog.Log.debug(`C sourceWorksheet=${JSON.stringify(sourceWorksheet)}`);
      sourceWorksheet.sort(Gssx.compareByYearReverse);
      prevNumRows = 0;
      var srcWorksheets = sourceWorksheet.map( it => it.worksheet );
      for(var count=0; count < srcWorksheets.length; count++){
        YKLiblog.Log.debug(`B copyWorksheetContent count=${count} srcWorksheets=${JSON.stringify(srcWorksheets)} prevNumRows=${prevNumRows}`);
        [prevNumRows, numColumns] = Gssx.showOneWorksheetContent(count, srcWorksheets, destinationWorksheet, prevNumRows);
      }
      YKLiblog.Log.debug('ワークシートの内容をコピーしました: ' + ' -> ' + destinationWorksheetName);
    }
  }

  /**
   * 1つのワークシートの内容を表示する。
   *
   * @param {number} count ワークシートのカウント
   * @param {Array} worksheets ワークシートの配列
   * @param {GoogleAppsScript.Spreadsheet.Sheet} destinationWorksheet 表示先のワークシート
   * @param {number} prevNumRows 前回の行数
   * @returns {Array} 前回の行数と列数
   */
  static showOneWorksheetContent(count, worksheets, destinationWorksheet, prevNumRows) {
    YKLiblog.Log.debug(`#################### A count=<span class="math-inline">\{count\} prevNumRows\=</span>{prevNumRows}`);

    var [values, dataRange] = Gssx.getValuesFromSheet(worksheets[count]);
    var header = values.shift();
    let numRowsOfHeader = 0;

    const table = new Table(header, values, dataRange);

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

    // table.showB();
    table.showB4();
    // table.reformIsbn();
    // table.reformIsbn4();
    // const array = [table.getHeader(), ...table.getValues()];
    // table.storeTable(array);

    return [prevNumRows, numColumns];
  }

  /**
   * 指定されたスプレッドシートのすべてのワークシートの名前を取得します。
   *
   * @param {string} spreadsheetId 取得したいスプレッドシートのID
   * @return {string[]} ワークシート名の配列
   */
  static getAllWorksheetNames(spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheetNames = spreadsheet.getSheets().map(sheet => sheet.getName());
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
  static convertToJSON(data) {
    const jsonString = JSON.stringify(data, null, 2); // null, 2 はJSONを見やすく整形するための引数です
    return jsonString
  }
}

this.Gssx = Gssx;

function getSpreadsheetIdAndSheetName(){
  const spreadsheetId = '1Mz4pqoclYFPSmbNlpf_g18CUNTcxt68KkKFVTNEJGg4' 
  const sheetName = 'Mindstream'
  return [spreadsheetId, sheetName]
}
function getSpreadsheetAndWorksheet(){
  const [spreadsheetId, sheetName] = getSpreadsheetIdAndSheetName()

  const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
  return [spreadsheetId, sheetName, spreadsheet, worksheet]
}
function getConfigForTest(){
  const header0 = ["id", "from", "subject", "dateStr", "plainBody"]
  const yklibbConfig = new Config(header0.length, header0, Config.COMPLETE())
  return yklibbConfig
}
function getConfigWIthNoneForTest(){
  const header0 = ["id", "from", "subject", "dateStr", "plainBody"]
  const yklibbConfig = new Config(header0.length, header0, Config.NONE())
  return yklibbConfig
}
function test_gssx(){
  const yklibbConfig = getConfigForTest()

  const [spreadsheetId, sheetName, spreadsheet, worksheet] = getSpreadsheetAndWorksheet()

  const [header, totalValues, totalRange] = Gssx.setupSpreadsheet(spreadsheetId, sheetName)

  const [spreadsheet1, worksheet1, values1, totalRange1] = Gssx.setupSpreadsheetValues(spreadsheetId, sheetName)
}
function test_gssx_2(){
  const yklibbConfig = getConfigForTest()

  const [spreadsheetId, sheetName, spreadsheet, worksheet] = getSpreadsheetAndWorksheet()
  let ultimate
  ultimate = true
  // ultimate = false
  const [header, values, headerRange, dataRowsRange, totalRange] = Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig, ultimate)
}
function test_gssx_3(){
  const yklibbConfig = getConfigForTest()

  const [spreadsheetId, sheetName, spreadsheet, worksheet] = getSpreadsheetAndWorksheet()
  const sheetNames = Gssx.getAllWorksheetNames(spreadsheetId)
  const exceptNames=  ["GAS-Gmail","_B","_A","Clasp-ts-etc","_config"]
  const names = sheetNames.filter( name => !exceptNames.includes(name))
  Logger.log(`sheetNames=${ JSON.stringify(names)}`)
  Logger.log(`===`)

  Logger.log(`exceptNames=${ JSON.stringify(exceptNames)}`)
}