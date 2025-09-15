/**
 * 設定クラス
 * 幅、ヘッダー、処理方法を管理する
 */
class Config {
  /**
   * コンストラクタ
   * @param {number} width - 設定の幅
   * @param {Array} header - ヘッダー配列
   * @param {string} way - 処理方法
   * @throws {Error} ヘッダー幅が0の場合にエラーを投げる
   */
  constructor(width, header, way){
    this.width = width
    this.header = header
    this.headerWidth = header.length
    /*
    if( this.headerWidth === 0 ){
      throw new Error(`this.headerWidth=${this.headerWidth}`)
    }
    */
    this.way = way
  }
  /**
   * 幅を取得する
   * @returns {number} 設定の幅
   */
  getWidth(){
    return this.width
  }
  /**
   * ヘッダーを取得する
   * @returns {Array} ヘッダー配列
   */
  getHeader(){
    return this.header
  }
  /**
   * ヘッダー幅を取得する
   * @returns {number} ヘッダー配列の長さ
   */
  getHeaderWidth(){
    return this.headerWidth
  }
  /**
   * 設定を変換する
   * @param {number} col - 開始列インデックス
   * @param {number} width - 新しい幅
   * @returns {Config} 変換された設定オブジェクト
   */
  transform(col, width){
    let newConfig = this
    let newHeader = this.header
    const length = this.header.length
    if( length > 0 ){
      if( col >= 0){
        if( width > 0){
          newHeader = this.header.slice( col, width )
          const way = Config.PARTIAL()
          newConfig = new Config(width, newHeader, way)
        }
      }
    }
    return newConfig
  }
  /**
   * 部分処理方式を取得する
   * @returns {string} 'PARTIAL'文字列
   */
  static PARTIAL(){
    return 'PARTIAL'
  }
  /**
   * 完全処理方式を取得する
   * @returns {string} 'COMPLETE'文字列
   */
  static COMPLETE(){
    return 'COMPLETE'
  }
  /**
   * 無処理方式を取得する
   * @returns {string} 'NONE'文字列
   */
  static NONE(){
    return 'NONE'
  }
  
  /**
   * YKLibb設定オブジェクトを作成する
   * @param {Array} header - ヘッダー配列
   * @param {string} way - 処理方法
   * @returns {Config} YKLibb設定オブジェクト
   */
  static makeYKLibbConfig(header = [], way = Config.NONE()){
    const yklibbConfig = new Config(header.length, header, way)
    return yklibbConfig
  }
}
this.Config = Config
