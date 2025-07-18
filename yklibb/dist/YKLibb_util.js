class Util {
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
  static dateTimeToString(dateTime){
    YKLiblog.Log.debug(`dateTimeToString dateTime=${dateTime}`)
    const timeZone = "Asia/Tokyo";
    const format1 = "yyyy-MM-dd HH:mm:ss";
    const formattedString1 = Utilities.formatDate(dateTime, timeZone, format1);
    return formattedString1
  }
  /**
   * Setと配列の差分を取得する
   * @param {Set} setObj - 比較元のSet
   * @param {Array} arrayObj - 比較対象の配列
   * @returns {{setOnly: Array, arrayOnly: Array, symmetric: Array}} 3種類の差分を含むオブジェクト
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

  static isWhiteSpaceString(str){
    return (typeof(str) === "string" && str.trim() === '')
  }
  static isValidString(str){
    return (typeof(str) === "string" && str.trim() !== '')
  }
  static isBlankCell(value){
    return (value.length == 1 && value[0] === '')
  }
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
  static makeAssoc(headers, value){
    const assoc = {}
    for(let i=0; i<headers.length; i++){
      const name = headers[i]
      assoc[name] = value[i]
    }
    return assoc
  }
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
      YKLiblog.Log.debug(`Util.hasValidDataHeaderAndDataRows invalidHeader`)
      dataValues = values
    }
    else{
      dataValues = values.slice(1, values.length)
    }
    invalidDataRows = Util.hasInvalidDataRows(dataValues, config)
    if(invalidDataRows){
      YKLiblog.Log.debug(`Util.hasValidDataHeaderAndDataRows invalidDataRows`)
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

  static hasInvalidDataRows(values, config){
    const invalid = values.some( item => {
      const ret = item.length !== config.getWidth()
      YKLiblog.Log.debug(`Util.hasInvalidDataRows item.length=${item.length} config.getWidth()=${config.getWidth()} ret=${ret}`)
      return ret
    } )
    return invalid
  }
}
this.Util=Util

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

function test_has_t(sheetId, sheetName){
  const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(sheetId, sheetName)
  const headerIdx = "id"
  const headerx = [headerIdx, "from", "subject", "dateStr", "plainBody"]
  const yklibbConfig = new Config( headerx.length, headerx, Config.COMPLETE )
  const [header, values, headerRange, dataRowsRange, totalRange] = Gssx.setupSpreadsheetAndHeaderAndData(worksheet, yklibbConfig)
  YKLiblog.Log.debug(`values=${values}`)
  return [spreadsheet, worksheet, header, values, headerRange, dataRowsRange, totalRange]
}

function test_has_info(sheetId, sheetName){
  const [spreadsheet, worksheet, values, totalRange] = Gssx.setupSpeadsheetValues(sheetId, sheetName)
  YKLiblog.Log.debug(`values=${values}`)
  return [spreadsheet, worksheet, values, totalRange]
}

function test_has_tc(){
  YKLiblog.Log.initLogDebug()
  const sheetId = "1KtGdnnpj8k_bkxfYITalK193nRlVXiN0o_YiASO5KNs"
  const sheetName = "INFO2"
  const [spreadsheet, worksheet, values, totalRange] = test_has_info(sheetId, sheetName)
  // YKLiblog.Log.debug(`values=${values}`)
}
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