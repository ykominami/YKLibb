
/**
 * SimpleTableクラス - スプレッドシートのテーブルデータを管理するクラス
 * BasicTableを継承し、シンプルなテーブル操作機能を提供する
 */
class SimpleTable extends BasicTable{
  /**
   * SimpleTableクラスのコンストラクタ
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 対象のスプレッドシート
   * @param {String} sheetName - シート名
   * @param {Object} yklibbConfig - YKLibb設定オブジェクト
   * @param {boolean} ultimate - 最終処理フラグ
   */
  constructor(spreadsheet, sheetName, yklibbConfig, ultimate = false){
    super(spreadsheet, sheetName, null, yklibbConfig, ultimate)

    // SimpleTable固有の初期化処理
    if( this.dataRowsRange !== null ){
      this.dataRowsValues = this.dataRowsRange.getValues()
      const h = this.dataRowsValues.length
      this.nextDataRowsRange = this.dataRowsRange.offset(h, 0, 1)
      const rs = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`SimpleTable constructor 1 rs=${JSON.stringify(rs)}`)
      this.status = 1
    }
    else{
      this.dataRowsValues = []
      this.nextDataRowsRange = this.headerRange.offset(1, 0, 1)
      const rs2 = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`SimpleTable constructor 2 rs=${JSON.stringify(rs2)}`)
      this.status = 2
    }
    this.arrayOfObjects = Util.createArrayOfObjects(this.dataRowsValues, this.header)
  }


  /**
   * 範囲、ヘッダー、総値の情報を取得する
   * @returns {Array} [worksheet, totalRange, headerRange, dataRowsRange, nextDataRowsRange, header, totalValues, status]
   */
  getRangesAndHeaderAndTotalValues(){
    return [this.worksheet, this.totalRange, this.headerRange, this.dataRowsRange, this.nextDataRowsRange, this.header, this.totalValues, this.status]
  }

  /**
   * ステータスを取得する
   * @returns {number} ステータス値
   */
  getStatus(){
    return this.status
  }

  /**
   * ワークシートを取得する
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} ワークシートオブジェクト
   */
  getWorksheet(){
    return this.worksheet
  }

  /**
   * 全体範囲を取得する
   * @returns {GoogleAppsScript.Spreadsheet.Range} 全体範囲オブジェクト
   */
  getTotalRange(){
    return this.totalRange
  }

  /**
   * ヘッダーを取得する
   * @returns {Array} ヘッダー配列
   */
  getHeader(){
    return this.header
  }

  /**
   * データ行の値を取得する
   * @returns {Array} データ行の値の配列
   */
  getDataRowsValues(){
    if (this.dataRowsRange === null) {
      return []
    }
    return this.dataRowsRange.getValues()
  }

  /**
   * ヘッダーと連想配列からデータを追加する
   * @param {Array} header - ヘッダー配列
   * @param {Object} assoc - 連想配列
   * @returns {GoogleAppsScript.Spreadsheet.Range} 次のデータ行範囲
   */
  add(header, assoc){
    // ヘッダーの検証
    if (JSON.stringify(header) !== JSON.stringify(this.header)) {
      YKLiblog.Log.fault(`SimpleTable add: header mismatch. Expected: ${JSON.stringify(this.header)}, Got: ${JSON.stringify(header)}`)
      throw new Error('Header mismatch in add() method')
    }
    // --- ⑤ データの書き込み ---
    const data = header.map( name => assoc[name])
    const twoDemension = [data]
    YKLiblog.Log.debug(`SimpleTable add twoDemension=${JSON.stringify(twoDemension)}`)
    // 最終行の下に新しいデータを追記します。
    this.nextDataRowsRange.setValues( twoDemension )
    this.nextDataRowsRange = this.nextDataRowsRange.offset(1, 0, 1)

    // arrayOfObjectsを更新して、新しく追加されたデータを反映
    this.arrayOfObjects.push(assoc)
    // dataRowsValuesも更新
    this.dataRowsValues.push(data)

    return this.nextDataRowsRange
  }

  /**
   * 配列オブジェクトから指定されたフィールドと値で検索する
   * @param {Array} arrayOfObjects - 検索対象の配列オブジェクト
   * @param {string} field - 検索フィールド名
   * @param {any} value - 検索値
   * @returns {Array} 検索結果の配列
   */
  find(arrayOfObjects, field, value){
    return arrayOfObjects.filter( assoc => assoc[field] === value )
  }

  /**
   * テーブル構造を調整する
   * ヘッダーの存在確認、データ行の調整、範囲の更新を行う
   */
  adjustTable(){
    if( this.headerRange === null ){
      if( this.dataRowsRange !== null ){
        this.adjustRows()
        const nextDataRowsRangeShape = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
        YKLiblog.Log.debug(`SimpleTable adjustTable nextDataRowsRangeShape=${ JSON.stringify(nextDataRowsRangeShape) }`)
        this.nextDataRowsRange = this.nextDataRowsRange.offset(1, 0, 1)

        // ワークシートのheaderを更新
        this.addHeader(this.worksheet)
        this.totalRange = this.headerRange.offset(0, 0, 1 + this.dataRowsRange.getHeight())
      }
      else{
        // ワークシートのheaderを更新
        this.addHeader(this.worksheet)

        this.dataRowsRange = this.headerRange.offset(1, 0, 1, this.headerRange.getWidth())
        this.dataRowsValues = this.dataRowsRange.getValues()
        this.totalRange = this.headerRange.offset(0, 0, 2, this.headerRange.getWidth())
      }
      if( this.dataRowsRange !== null ){
        this.dataRowsRange.setValues( this.dataRowsValues )
      }
      const totalValues = this.totalRange.getValues()
      this.totalValues = totalValues
    }
    else{
      // headerが存在する場合
      if( this.dataRowsRange !== null ){
        this.adjustRows()
        const totalRange = this.dataRowsRange.offset(-1, 0, 1 + this.dataRowsRange.getHeight() )
        this.totalRange = totalRange
        this.totalValues = totalRange.getValues()
      }
    }
  }
  

  /**
   * スプレッドシートIDとシート名からSimpleTableインスタンスを作成する
   * @param {string} ssId スプレッドシートID
   * @param {string} sheetName シート名
   * @param {string} way 処理方法
   * @returns {SimpleTable|null} SimpleTableインスタンスまたはnull
   */
  static createById(ssId, sheetName, way = Config.NONE()){
    let table = null
    const yklibbConfig = Config.makeYKLibbConfig(way)
    const spreadsheet = SpreadsheetApp.openById(ssId);
    if( spreadsheet !== null){
      table = new SimpleTable(spreadsheet, sheetName, yklibbConfig)
    }
    return table
  }
  
  /**
   * スプレッドシートID、シート名、ヘッダーからSimpleTableインスタンスを作成する
   * @param {string} ssId スプレッドシートID
   * @param {string} sheetName シート名
   * @param {Array} header ヘッダー配列
   * @param {string} way 処理方法
   * @returns {SimpleTable|null} SimpleTableインスタンスまたはnull
   */
  static createByIdWithHeader(ssId, sheetName, header = [], way = Config.NONE()){
    let table = null
    const yklibbConfig = Config.makeYKLibbConfig(header, way)
    const spreadsheet = SpreadsheetApp.openById(ssId);
    if( spreadsheet !== null){
      table = new SimpleTable(spreadsheet, sheetName, yklibbConfig)
    }
    return table
  }

}
this.SimpleTable = SimpleTable
