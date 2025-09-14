/**
 * HeaderTableクラス - スプレッドシートのテーブルデータを管理するクラス
 * スプレッドシートの特定のシートをテーブルとして扱い、ヘッダーとデータの追加・更新機能を提供する
 */
class HeaderTable extends BasicTable{
  /**
   * HeaderTableクラスのコンストラクタ
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 対象のスプレッドシート
   * @param {String} sheetName - シート名
   * @param {Object} config - テーブル設定オブジェクト
   */
  constructor(spreadsheet, sheetName, config, yklibbConfig, ultimate = false){
    super(spreadsheet, sheetName, config, yklibbConfig, ultimate)

    // HeaderTable固有の初期化処理
    if( this.dataRowsRange !== null ){
      this.dataRowsValues = this.dataRowsRange.getValues()
      this.nextDataRowsRange = this.dataRowsRange.offset(1,0, 1)
      const rs = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`HeaderTable constructor 1 rs=${JSON.stringify(rs)}`)
    }
    else{
      this.dataRowsValues = [[]]
      this.nextDataRowsRange = this.headerRange.offset(1,0, 1)
      const rs2 = YKLiba.Range.getRangeShape(this.nextDataRowsRange)
      YKLiblog.Log.debug(`HeaderTable constructor 2 rs=${JSON.stringify(rs2)}`)
    }
  }

  /**
   * テーブルの初期設定を行う
   * スプレッドシートの指定されたシートを取得または作成し、ヘッダーとデータ範囲を設定する
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 対象のスプレッドシート
   * @param {string} sheetName - シート名
   * @param {Object} yklibbConfig - YKLibb設定オブジェクト
   */

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
  addHeader(sheet){
    const r = 1
    const c = 1
    const h = 1
    const headers = this.sourceHeader || []
    const range = sheet.getRange(r, c, h, headers.length)
    const rangeShape = YKLiba.Range.getRangeShape(range)
    YKLiblog.Log.debug(`rangeShape=${JSON.stringify(rangeShape)}`)
    range.setValues( [headers] )
    this.header = headers
    this.headerRange = range
  }

  /**
   * データ配列をスプレッドシートに登録する
   * @param {Array} dataArray - 登録するデータの配列
   * @param {string} op - 操作タイプ（REWRITE または addUnderRow）
   */
  registerDataArray(dataArray, op){
    const totalRangeShape = YKLiba.Range.getRangeShape(this.totalRange)
    YKLiblog.Log.debug(`RegisteredEmail (${this.sheetName}) registerDataArray totalRangeShape=${ JSON.stringify(totalRangeShape)}`)

    let range2;
    let range3;
    let rangeShape2;
    let rangeShape3;
    // ワークシート全体の書き換えを指定された場合は、正しいヘッダーが存在しなければ、既存のRangeをクリアし、正しいヘッダーを追加した状態にする
    if( op === YKLiba.Config.REWRITE() ){
      if( this.header === null ){
        this.totalRange.deleteCells(SpreadsheetApp.Dimension.ROWS);
        this.addHeader(this.worksheet)
      }
      range2 = this.headerRange.offset(1,0) 
      rangeShape2 = YKLiba.Range.getRangeShape(range2)
      YKLiblog.Log.debug(`1`)
    }
    // ワークシートの値が存在する範囲の直下から追加することを指定された場合
    else{
      // YKLiba.Config.addUnderRow
      // 正しいヘッダーとデータが存在する場合は、既存のrangeの最後のROWの直下から追加する
      const [validHeaderAndDataRows, validHeader, validDataRows ] = YKLibb.Util.hasValidDataHeaderAndDataRows(this.totalRange, this.yklibbConfig)
      if( validHeaderAndDataRows ){
        // rangeShape2 = this.dataRowsRange
        range2 = this.dataRowsRange.offset(1,0)
      }
      // 正しいヘッダーとデータが存在しない場合は、既存のRangeをクリアし、さらに正しいヘッダーを追加した状態にする
      else{
        this.totalRange.deleteCells(SpreadsheetApp.Dimension.ROWS);
        this.addHeader(this.worksheet)
        range2 = this.headerRange.offset(1,0)
      }
      rangeShape2 = YKLiba.Range.getRangeShape(range2)
      YKLiblog.Log.debug(`2 rangeShape2.h=${rangeShape2.h} rangeShape2.c=${rangeShape2.c}`)
    }
    YKLiblog.Log.debug(`dataArray=${ JSON.stringify(dataArray)}`)
    range3 = this.worksheet.getRange(rangeShape2.r, rangeShape2.c, dataArray.length, dataArray[0].length)
    rangeShape3 = YKLiba.Range.getRangeShape(range3)
    // YKLiblog.Log.debug(`rangeShape2=${JSON.stringify(rangeShape2)}` )
    // YKLiblog.Log.debug(`rangeShape3=${JSON.stringify(rangeShape3)}` )
    // YKLiblog.Log.debug(`dataArray.length=${ dataArray.length }` )
    // YKLiblog.Log.debug(`dataArray[0] .length=${ dataArray[0].length }` )
    // YKLiblog.Log.debug(`########### RegisteredEmail registerDataArray this.sheetName=${this.sheetName}` )
    // YKLiblog.Log.debug(`dataArray=${ JSON.stringify(dataArray) }` )
    const range3shape = YKLiba.Range.getRangeShape(range3)
    YKLiblog.Log.debug(`RegisteredEmail registerDataArray range3shape=${ JSON.stringify(range3shape)}`)
    range3.setValues( dataArray );
    // this.addToIdSet( dataArray )
    // this.idSet = new Set( [...this.idSet, ...dataArray] )
    // this.ids = [...this.idSet]
    this.totalRange = this.worksheet.getRange(1, 1, rangeShape2.h + rangeShape3.h, rangeShape2.c)
    this.totalValues = this.totalRange.getValues()

    this.dataRowsRange = this.totalRange.offset(1, 0, this.totalRange.getHeight() - 1)
    const dataRowsRangeShape = YKLiba.Range.getRangeShape(this.dataRowsRange)
  }

  /**
   * データ行を調整する
   * 重複チェック、行の削除・追加、ワークシートの更新を行う
   */
  adjustRows(){
    const needsChange = this.adjustCol1()
    if( !needsChange ){
      return
    }
    const [idSet, selectedRows] = this.distinctValues(this.dataRowsValues)
    const length = selectedRows.length
    if( length > 0 ){
      this.shrinkRows(selectedRows, length)
    }
  }
  shrinkRows(rows, length){
    const range = this.dataRowsRange.offset(0, 0, length)
    // 書き換えが必要な場合は、行数が減るということだから、書換え前の行が残らないように、あらかじめクリアしておく
    this.dataRowsRange.clearContent()
    const rangeShape = YKLiba.Range.getRangeShape(range)
    YKLiblog.Log.debug(`HeaderTable adjustRows rangeShape=${JSON.stringify(rangeShape)}`)
    range.setValues(rows)
    this.dataRowsRange = range
    this.dataRowsValues = rows
    this.nextDataRowsRange = this.dataRowsRange.offset(1,0,1)
  }
  getRangeForHeaderAndData(worksheet, yklibbConfig, ultimate=false){
    // yklibbConfigで指定したヘッダーが存在しない場合、返値のheaderはnull
    // 正しいヘッダが存在することが必須であるため、存在しなければ、worksheetの内容をクリアする
    if( worksheet === null ){
      return [null, null, null, null, null]
    }
    let dataRowsRange = null
    let dataRowsValues = [[]]
    let header, totalValues, headerRange, totalRange
    const [header0, totalValues0, headerRange0, dataRowsRange0, totalRange0] = YKLibb.Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig, ultimate)
    if(headerRange0 === null || dataRowsRange0 === null){
      worksheet.clear()
      this.addHeader(worksheet)
      // addHeaderにより、以下が設定される
      // this.header
      // this.headerRange
      header = this.header
      headerRange = this.headerRange

      dataRowsRange = null
      dataRowsValues = null
      totalRange = this.headerRange.offset(0, 0, 1)
      totalValues = totalRange.getValues()
      return [header, totalValues, headerRange, dataRowsRange, totalRange]
    }
    else{
      return [header0, totalValues0, headerRange0, dataRowsRange0, totalRange0]
    }
  }
  
  getSpreadsheetId(){
    return this.spreadsheet.getId()
  }
  getSheetUrl(){
    return this.sheetUrl
  }

  clearTotalRange(){
    this.totalRange.clear()
  }
  clearAndReset(){
    YKLiblog.Log.debug(`HeaderTable ${this.sheetName} clearAndReset`)
    this.worksheet.clear({formatOnly: true, contentsOnly: true})
    this.addHeaderAndUpdate()
    this.dataRowsRange = null
    this.dataRowsValues = null
    this.nextdataRowsRange = this.headerRange.offset(1,0)
    const nextdataRowsRangeShape = YKLiba.Range.getRangeShape(this.nextdataRowsRange)
    YKLiblog.Log.debug(`HeaderTable ${this.sheetName} clearAndReset nextdataRowsRangeShape=${ JSON.stringify(nextdataRowsRangeShape)}`)

  }
  /**
   * ヘッダーを追加して更新する
   * テーブル定義のヘッダー情報をスプレッドシートのヘッダー範囲に設定する
   */
  addHeaderAndUpdate(){
    this.headerRange.setValues( [this.sourceHeader || []] )
  }
  /**
   * データ行を追加して更新する
   * 指定された値の配列をデータ行として追加し、データ範囲を次の行に移動する
   * @param {Array} oneRowValue - 追加するデータ行の値の配列
   */
  addDataRowsAndUpdate(oneRowValue){
    YKLiblog.Log.debug(`Table addDataRowsAndUpdate (${this.sheetName}) values=${ JSON.stringify(values) }`)
    const dataRowsRangeShape = YKLiba.Range.getRangeShape(this.dataRowsRange) 
    YKLiblog.Log.debug(`HeaderTable (${this.sheetName}) dataRowsRangeShape=${ JSON.stringify(dataRowsRangeShape) }`)
    const nextDataRowsRangeShape = YKLiba.Range.getRangeShape(this.nextDataRowsRange) 
    YKLiblog.Log.debug(`HeaderTable (${this.sheetName}) nextDataRowsRangeShape=${ JSON.stringify(nextDataRowsRangeShape) }`)

    YKLiblog.Log.debug(`HeaderTable (${this.sheetName}) addDataRowsAndUpdate this.sheetName=${this.sheetName}`)
    YKLiblog.Log.debug(` (${this.sheetName}) values.length=${values.length}`)
    YKLiblog.Log.debug(` (${this.sheetName}) values=${JSON.stringify(values)}`)

    this.nextDataRowsRange.setValues([oneRowValue])

    if( this.dataRowsRange === null ){
      this.dataRowsRange = this.nextDataRowsRange
    }
    else{
      this.dataRowsRange = this.dataRowsRange.offset(0,0, this.dataRowsRange.getHeight() + 1)
    }
    this.totalRange = this.totalRange.offset(0,0, this.totalRange.getHeight() + 1 )

    const rangeShape2 = YKLiba.Range.getRangeShape(this.dataRowsRange)
    YKLiblog.Log.debug(`Table (${this.sheetName}) addDataRowsAndUpdate rangeShape2=${ JSON.stringify(rangeShape2) }`)

    this.nextDataRowsRange = this.nextDataRowsRange.offset(1,0,1)
  }
}