/**
 * Gaクラス - Google Apps Script用のユーティリティクラス
 * スプレッドシートの設定と操作を簡単に行うためのメソッドを提供する
 */
class Ga{
  /**
   * 表示用のメソッド
   * @returns {string} 固定文字列"A"
   */
  static disp(){
    return "A"
  }
  
  /**
   * スプレッドシートとシートを指定して、ヘッダー、値、範囲を取得する
   * @param {string} spreadsheetId - スプレッドシートID
   * @param {string} sheetName - シート名
   * @param {boolean} ultimate - 最終処理フラグ
   * @returns {Array} [header, totalValues, totalRange] - ヘッダー、値、範囲の配列
   */
  static setupForSpreadsheet(spreadsheetId, sheetName, ultimate=false){
    const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
    const [header, totalValues, totalRange] = Gssx.setupSpreadsheetForHeaderAndValues(worksheet, ultimate);
    return [header, totalValues, totalRange]
  }
  
  /**
   * スプレッドシートとシートを指定して、ヘッダー、値、範囲を取得する
   * @param {string} spreadsheetId - スプレッドシートID
   * @param {string} sheetName - シート名
   * @param {boolean} ultimate - 最終処理フラグ
   * @returns {Array} [header, totalValues, totalRange] - ヘッダー、値、範囲の配列
   */
  static setup(spreadsheetId, sheetName, ultimate=false){
    const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
    const [header, totalValues, totalRange] = Gssx.setupSpreadsheetForHeaderAndValues(worksheet, ultimate);
    // return [worksheet]
//    return [header]
    // return [totalValues]
    // return [totalRange]
    return [header, totalValues, totalRange]
  }

}
this.Ga = Ga;
