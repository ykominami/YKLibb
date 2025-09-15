/**
 * BasicTableクラス - スプレッドシートのテーブルデータを管理する基底クラス
 * HeaderTableとSimpleTableの共通機能を提供する
 */
class BasicTable {
  /**
   * BasicTableクラスのコンストラクタ
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 対象のスプレッドシート
   * @param {String} sheetName - シート名
   * @param {Object} config - テーブル設定オブジェクト（HeaderTable用）
   * @param {Object} yklibbConfig - YKLibb設定オブジェクト
   * @param {boolean} ultimate - 最終処理フラグ
   */
  constructor(spreadsheet, sheetName, config, yklibbConfig, ultimate = false){
    this.ultimate = ultimate
    if( typeof(ultimate) !== "boolean" ){
      throw new Error(`${ typeof(ultimate) } ultimate is not boolean`)
    }
    this.config = config
    this.spreadsheet = spreadsheet
    this.spreadsheetUrl = spreadsheet.getUrl();
    this.sheetName = sheetName

    if( yklibbConfig !== null){
      this.yklibbConfig = yklibbConfig
      this.sourceHeader = yklibbConfig.getHeader()
      // Assuming the first column is the ID column, or you can implement a method to get the ID column index
      this.indexOfHeaderId = 0
    }
    else{
      throw new Error("yklibbConfig is required when tableDef is not provided")
    }

    this.worksheet = null
    this.header = null
    this.totalValues = null
    this.headerRange = null
    this.dataRowsRange = null
    this.nextDataRowsRange = null
    this.totalRange = null
    this.sheetId = null
    this.sheetUrl = null
    this.status = null

    // 初期化処理
    if (spreadsheet && yklibbConfig) {
      this.setup(spreadsheet, sheetName, yklibbConfig, ultimate)
    }
  }

  /**
   * スプレッドシートとシートをセットアップする
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 対象のスプレッドシート
   * @param {String} sheetName - シート名
   * @param {Object} yklibbConfig - YKLibb設定オブジェクト
   * @param {boolean} ultimate - 最終処理フラグ
   */
  setup(spreadsheet, sheetName, yklibbConfig, ultimate=false){
    this.ultimate = ultimate
    this.spreadsheet = spreadsheet
    this.spreadsheetUrl = spreadsheet.getUrl();
    this.sheetName = sheetName
    this.yklibbConfig = yklibbConfig
    this.sourceHeader = yklibbConfig.getHeader()
    this.indexOfHeaderId = 0

    const [worksheet, totalRange, headerRange, dataRowsRange, nextDataRowsRange, header, totalValues, status] = Gssx.getHeaderAndDataFromWorksheet(spreadsheet.getSheetByName(sheetName), yklibbConfig)
    this.worksheet = worksheet
    this.totalRange = totalRange
    this.headerRange = headerRange
    this.dataRowsRange = dataRowsRange
    this.nextDataRowsRange = nextDataRowsRange
    this.header = header
    this.totalValues = totalValues
    this.status = status

    if( dataRowsRange !== null ){
      this.sheetId = dataRowsRange.getSheet().getSheetId()
      this.sheetUrl = this.spreadsheetUrl + "#gid=" + this.sheetId
    }
  }

  /**
   * テーブルを調整する
   */
  adjustTable(){
    YKLiblog.Log.debug(`adjustTable this.headerRange=${this.headerRange}`)
    if( this.headerRange === null ){
      if( this.dataRowsRange !== null ){
        this.addHeader(this.worksheet)
      }
    }
    else{
      YKLiblog.Log.debug(`adjustTable this.dataRowsRange=${this.dataRowsRange}`)
      if( this.dataRowsRange !== null ){
        this.adjustRows()
      }
    }
  }

  /**
   * ヘッダーを追加する
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 対象のシート
   */
  addHeader(sheet){
    if( this.header === null ){
      this.header = this.sourceHeader
    }
    const headerRange = sheet.getRange(1, 1, 1, this.header.length)
    headerRange.setValues([this.header])
    this.headerRange = headerRange
  }

  /**
   * データ配列を登録する
   * @param {Array} dataArray - データ配列
   * @param {String} op - 操作タイプ
   */
  registerDataArray(dataArray, op){
    YKLiblog.Log.debug(`registerDataArray dataArray=${dataArray} op=${op}`)
    if( this.header === null ){
      this.addHeader(this.worksheet)
    }
    const validHeaderAndDataRows = Util.hasValidDataHeaderAndDataRows(this.totalRange, this.yklibbConfig)
    YKLiblog.Log.debug(`registerDataArray validHeaderAndDataRows=${validHeaderAndDataRows}`)
    if( validHeaderAndDataRows ){
      this.adjustRows()
    }
  }

  /**
   * 行を調整する
   */
  adjustRows(){
    const needsChange = this.adjustCol1()
    if( !needsChange ){
      return
    }
    const length = this.totalValues.length
    if( length > 0 ){
      this.shrinkRows(this.totalValues, length)
    }
  }

  /**
   * 行を縮小する
   * @param {Array} rows - 行データの配列
   * @param {number} length - 長さ
   */
  shrinkRows(rows, length){
    const [idSet, selectedRows] = this.distinctValues(rows)
    this.totalValues = selectedRows
    this.dataRowsRange = this.totalRange.offset(1, 0, selectedRows.length, this.totalRange.getWidth())
  }

  /**
   * ヘッダーとデータの範囲を取得する
   * @param {GoogleAppsScript.Spreadsheet.Sheet} worksheet - 対象のワークシート
   * @param {Object} yklibbConfig - YKLibb設定オブジェクト
   * @param {boolean} ultimate - 最終処理フラグ
   * @return {Array} 範囲情報の配列
   */
  getRangeForHeaderAndData(worksheet, yklibbConfig, ultimate=false){
    YKLiblog.Log.debug(`getRangeForHeaderAndData worksheet=${worksheet} yklibbConfig=${yklibbConfig} ultimate=${ultimate}`)
    if( worksheet === null ){
      return [null, null, null, null, null, null, null, null]
    }
    const [header, values, headerRange, dataRowsRange, totalRange] = Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig, ultimate)
    const nextDataRowsRange = null
    const status = null
    if(headerRange === null || dataRowsRange === null){
      return [worksheet, totalRange, headerRange, dataRowsRange, nextDataRowsRange, header, values, status]
    }
    return [worksheet, totalRange, headerRange, dataRowsRange, nextDataRowsRange, header, values, status]
  }

  /**
   * スプレッドシートIDを取得する
   * @return {String} スプレッドシートID
   */
  getSpreadsheetId(){
    return this.spreadsheet.getId()
  }

  /**
   * シートURLを取得する
   * @return {String} シートURL
   */
  getSheetUrl(){
    return this.sheetUrl
  }

  /**
   * 全体範囲をクリアする
   */
  clearTotalRange(){
    this.totalRange.clear()
  }

  /**
   * クリアしてリセットする
   */
  clearAndReset(){
    this.clearTotalRange()
    this.header = null
    this.totalValues = null
    this.headerRange = null
    this.dataRowsRange = null
    this.nextDataRowsRange = null
    this.totalRange = null
    this.sheetId = null
    this.sheetUrl = null
  }

  /**
   * ヘッダーを追加して更新する
   */
  addHeaderAndUpdate(){
    this.addHeader(this.worksheet)
  }

  /**
   * データ行を追加して更新する
   * @param {Array} oneRowValue - 1行のデータ
   */
  addDataRowsAndUpdate(oneRowValue){
    YKLiblog.Log.debug(`addDataRowsAndUpdate oneRowValue=${oneRowValue}`)
    if( this.dataRowsRange === null ){
      this.addHeaderAndUpdate()
    }
    const dataRowsRange = this.worksheet.getRange(this.dataRowsRange.getRow() + this.dataRowsRange.getHeight(), 1, 1, this.dataRowsRange.getWidth())
    dataRowsRange.setValues([oneRowValue])
    this.dataRowsRange = this.worksheet.getRange(this.dataRowsRange.getRow(), 1, this.dataRowsRange.getHeight() + 1, this.dataRowsRange.getWidth())
  }

  /**
   * 1列目の値を調整する
   * 重複チェックを行い、必要に応じてデータを整理する
   * @return {boolean} 再構築が必要かどうか
   */
  adjustCol1(){
    let needsChange = false

    const valuesCol1 = this.getValuesFromCol1()
    const [idSet, selectedRows] = this.distinctValues(valuesCol1)
    if( idSet.size > 0 ){
      if( valuesCol1.length !== idSet.size ){
        needsChange = true
      }
    }
    return needsChange
  }

  /**
   * 行データから重複を除去した値と選択された行を取得する
   * @param {Array} rows - 行データの配列
   * @return {Array} [IDセット, 選択された行の配列]
   */
  distinctValues(rows){
    YKLiblog.Log.debug(`this.indexOfHeaderId=${this.indexOfHeaderId}`)
    const idSetInit = new Set()
    const [idSet, selectedRows] = rows.reduce( (accumulator, currentValue) => {
      const id = currentValue[this.indexOfHeaderId]
      YKLiblog.Log.debug(`id=${id}`)
      if( id !== null && typeof(id) !== "undefined" && id.trim().length > 0){
        if( !accumulator[0].has(id) ){
          accumulator[0].add(id)
          accumulator[1].push(currentValue)
        }
      }
      return accumulator
    }, [idSetInit, []])
    return [idSet, selectedRows]
  }
  
  /**
   * 1列目から値を取得する
   * @return {Array} 1列目の値の配列
   */
  getValuesFromCol1(){
    const values =  this.getCol1(this.worksheet, this.yklibbConfig)
    return values
  }

  getCol1(worksheet, yklibbConfig){
    const values = Gssx.getValuesOfCol1FromSheet(worksheet)
    return values
  }
}

/**
 * SimpleTableクラス - BasicTableを継承
 */
class SimpleTable extends BasicTable{
  // SimpleTable固有のメソッドはここに追加
}
