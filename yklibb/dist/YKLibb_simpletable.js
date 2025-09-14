
/**
 * HeaderTableクラス - スプレッドシートのテーブルデータを管理するクラス
 * スプレッドシートの特定のシートをテーブルとして扱い、ヘッダーとデータの追加・更新機能を提供する
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
      const h = this.totalValues.length
      this.nextDataRowsRange = this.totalRange.offset(h, 0, 1)
      const rs = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`SimpleTable constructor 1 rs=${JSON.stringify(rs)}`)
      this.status = 1
    }
    else{
      this.dataRowsValues = [[]]
      this.nextDataRowsRange = this.headerRange.offset(1,0, 1)
      const rs2 = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`SimpleTable constructor 2 rs=${JSON.stringify(rs2)}`)
      this.status = 2
    }
    this.arrayOfObjects = Util.createArrayOfObjects(this.dataRowsValues, this.header)
  }


  getRangesAndHeaderAndTotalValues(){
    return [this.worksheet, this.totalRange, this.headerRange, this.dataRowsRange, this.nextDataRowsRange, this.header, this.totalValues, this.status]
  }

  getStatus(){
    return this.status
  }

  getWorksheet(){
    return this.worksheet
  }

  getTotalRange(){
    return this.totalRange
  }

  getHeader(){
    return this.header
  }

  getDataRowsValues(){
    return this.dataRowsRange.getValues()
  }

  add(header, assoc){  
    // --- ⑤ データの書き込み ---
    const data = header.map( name => assoc[name])
    const twoDemension = [data]
    Logger.log(twoDemension)
    // 最終行の下に新しいデータを追記します。
    this.nextDataRowsRange.setValues( twoDemension )
    this.nextDataRowsRange = this.nextDataRowsRange.offset(1,0)

    return this.nextDataRowsRange
  }

  find(arrayOfObjects, field, value){
    return this.arrayOfObjects.filter( assoc => assoc[field] === value )
  }

  /**
   * テーブル構造を調整する
   * ヘッダーの存在確認、データ行の調整、範囲の更新を行う
   */
  adjustTable(){
    let dataRowsRange
    const headerRange = this.headerRange
    const headerRangeShape = YKLiba.Range.getRangeShape(headerRange)

    if( this.headerRange === null ){
      if( this.dataRowsRange !== null ){
        this.adjustRows()
        const nextDataRowsRangeShape = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
        YKLiblog.Log.debug(`HeaderTable adjustTable nextDataRowsRangeShape=${ JSON.stringify(nextDataRowsRangeShape) }`)
        this.nextDataRowsRange = this.nextDataRowsRange.offset(1,0, 1)

        // ワークシートのheaderを更新
        this.addHeader(this.worksheet)
        this.totalRange = this.headerRange.offset(0, 0, this.dataRowsRange.getRow() )
      }
      else{
        // ワークシートのheaderを更新
        this.addHeader(this.worksheet)

        dataRowsRange = this.headerRange.offset(1,0)
        this.dataRowsRange = dataRowsRange
        this.dataRowsValues = this.dataRowsRange.getValues()
        this.totalRange = this.headerRange.offset(0,0, 2, this.headerRange.getWidth() )
      }      
      this.dataRowsRange.setValues( this.dataRowsValues )
      const totalValues = this.totalRange.getValues()
      this.totalValues = totalValues
    }
    else{
      // headerが存在する場合
      const dataRowsRange = this.dataRowsRange 
      if( this.dataRowsRange !== null ){
        this.adjustRows()
        const dataRowsRangeShape = YKLiba.Range.getRangeShape(this.dataRowsRange)
        const totalRange = this.dataRowsRange.offset(-1, 0, 1 + this.dataRowsRange.getHeight() )
        this.totalRange = totalRange
        const totalRangeShape = YKLiba.Range.getRangeShape(totalRange)
        this.totalValues = totalRange.getValues()
      }
    }
  }
  
  /**
   * ワークシートにヘッダーを追加する
   * @param {Worksheet} sheet - 対象ワークシート
   */

  /**
   * データ配列をスプレッドシートに登録する
   * @param {Array} dataArray - 登録するデータの配列
   * @param {string} op - 操作タイプ（REWRITE または addUnderRow）
   */

  /**
   * データ行を調整する
   * 重複チェック、行の削除・追加、ワークシートの更新を行う
   */

  /**
   * ヘッダーを追加して更新する
   * テーブル定義のヘッダー情報をスプレッドシートのヘッダー範囲に設定する
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
  
  static createById(ssId, sheetName, header = [], way = Config.NONE()){
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