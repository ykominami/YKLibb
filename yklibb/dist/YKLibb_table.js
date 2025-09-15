/**
 * テーブルデータを管理するクラス
 */
class Table {
  /**
   * @constructor
   * @description テーブルオブジェクトを初期化します。
   * @param {Array<string>} header テーブルのヘッダー行の配列
   * @param {Array<Array<any>>} values テーブルのデータ行の二次元配列
   * @param {Range} dataRange テーブルのデータ行の二次元配列
   */
  constructor(header, values, dataRange) {
    /**
     * @property {Array<string>} header テーブルのヘッダー行
     */
    this.header = header;
    this.header_index = {};
    for(let i = 0; i < header.length; i++ ){
      this.header_index[ header[i] ] = i;
    }
    /**
     * @property {Array<Array<any>>} values テーブルのデータ行
     */
    this.values = values;

    this.dataRange = dataRange;
  }

  /**
   * @method getRow
   * @description 指定したインデックスのデータ行を取得します。
   * @param {number} index 取得する行のインデックス
   * @returns {Array<any>} 指定したインデックスのデータ行
   */
  getRow(index){
    return this.values[index];
  }

  /**
   * @method getCol
   * @description 指定した行から指定した列名の値を取得します。
   * @param {Array<any>} row データ行
   * @param {string} name 列名
   * @returns {any} 指定した列の値
   */
  getCol(row, name){
    return row[ this.header_index[name] ];
  }

  /**
   * @method setColValue
   * @description 指定した行の指定した列名の値を設定します。
   * @param {Array<any>} row データ行
   * @param {string} name 列名
   * @param {any} value 設定する値
   */
  setColValue(row, name, value){
    row[ this.header_index[name] ] = value;
  }

  /**
   * @method setRow
   * @description 指定したインデックスのデータ行を設定します。
   * @param {number} index 設定する行のインデックス
   * @param {Array<any>} row 設定するデータ行
   */
  setRow(index, row){
    this.values[index] = row;
  }

  /**
   * @method reformIsbn
   * @description ISBN列を修正します。形態が'本'の場合、ISBNの前後の空白を削除し、978-プレフィックスを978に変更します。
   */
  reformIsbn(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      if( this.getCol(row, '形態') == '本' ){
        let value = this.getCol(row, 'ISBN');
        if( (typeof value) === "string" ){
          value = value.trim();
          value = value.replace(/^978-/, "978");
          YKLiblog.Log.debug( `value=${value}` );
          YKLiblog.Log.debug(`typeof value=${typeof value}`);
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }

  /**
   * @method reformIsbn2
   * @description ISBN列を修正します。長さが15文字のISBNの空白を削除し、978-プレフィックスを978に変更します。
   */
  reformIsbn2(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      let value = this.getCol(row, 'ISBN');
      if( (typeof value) === "string" ){
        if( value.length === 15){
          YKLiblog.Log.debug( `0 length=${value.length}` );
          value = value.replace(/\s+/g, "");
          value = value.replace(/^978-/, "978");
          YKLiblog.Log.debug( `value=${value}` );
          YKLiblog.Log.debug( `1 length=${value.length}` );
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }

  /**
   * @method reformIsbn3
   * @description ISBN列を修正します。長さが10文字のISBNの空白を削除し、978-プレフィックスを978に変更します。
   */
  reformIsbn3(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      let value = this.getCol(row, 'ISBN');
      if( (typeof value) === "string" ){
        if( value.length === 10){
          YKLiblog.Log.debug( `0 length=${value.length}` );
          value = value.replace(/\s+/g, "");
          value = value.replace(/^978-/, "978");
          YKLiblog.Log.debug( `value=${value}` );
          YKLiblog.Log.debug( `1 length=${value.length}` );
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }

  /**
   * @method storeTable
   * @description テーブルデータをスプレッドシートの範囲に保存します。
   * @param {Array<Array<any>>} array 保存するデータの二次元配列
   */
  storeTable(array){
    this.dataRange.setValues(array);
  }

  /**
   * @method getHeader
   * @description ヘッダー行を取得します。
   * @returns {Array<string>} ヘッダー行の配列
   */
  getHeader() {
    return this.header;
  }

  /**
   * @method getValues
   * @description データ行を取得します。
   * @returns {Array<Array<any>>} データ行の二次元配列
   */
  getValues() {
    return this.values;
  }

  /**
   * @method getValue
   * @description 指定した行と列のデータを取得します。
   * @param {number} row 行インデックス
   * @param {number} col 列インデックス
   * @returns {any} 指定した行と列のデータ
   */
  getValue(row, col) {
    return this.values[row][col];
  }

  /**
   * @method addRow
   * @description データ行を追加します。
   * @param {Array<any>} row 追加するデータ行
   */
  addRow(row) {
    this.values.push(row);
  }

  /**
   * @method addColumn
   * @description データ列を追加します。
   * @param {any} value 追加する列の値
   */
  addColumn(value) {
    this.values.forEach(row => row.push(value));
  }

  /**
   * @method showB
   * @description デバッグ用：各データ行のshapeとasinの値をログに出力します。
   */
  showB(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const shape = this.getCol(row, 'shape');
      const asin = this.getCol(row, 'asin');
      YKLiblog.Log.debug(`shape=${shape} asin=${asin}`);
    }
  }

  /**
   * @method showB4
   * @description デバッグ用：ISBNの長さと形態に基づいてデータを分類し、ログに出力します。
   */
  showB4(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'asin');
      const shape = this.getCol(row, 'shape');
      if( (typeof isbn) === "string" ){
        if( isbn.length === 10){
          // Kindle Kindle-U
          if( shape === 3){
            // YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
          }
          else if( shape === 4){
            // YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 11){
          // Kindle
          YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 13){
          // 本
          if( shape !== "本"){
            YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 14){
          // 本
          YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 15){
          // 本
          YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 5){
          // EBOOK
          //YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 6){
          // "Kindle"
          //YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 8){
          // "Kindle-U"
          //YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 1){
          // "本"
          // YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
        else{
          YKLiblog.Log.debug(`${shape}|${isbn.length}|${isbn}`);
        }
      }
    }
  }

  /**
   * @method show
   * @description デバッグ用：状態が'読了'のデータの形態とISBNをログに出力します。
   */
  show(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      if( this.getCol(row, '状態') === '読了' ){
        const shape = this.getCol(row, '形態');
        const isbn = this.getCol(row, 'ISBN');
        YKLiblog.Log.info/* The `getCol1` method in the `BasicTable` class is a method that retrieves
        the values from the first column (column index 1) of the specified
        worksheet based on the provided YKLibb configuration object. It is used to
        extract the values from the first column of the data range in the
        spreadsheet. */
        (`shape=${shape} isbn=${isbn}`);
      }
    }
  }

  /**
   * @method show2
   * @description デバッグ用：状態、形態、ISBNの各値の種類をログに出力します。
   */
  show2(){
    let status_asoc = {};
    let shape_asoc = {};
    let isbn_asoc = {};

     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      status_asoc[this.getCol(row, '状態')] = 0;
      shape_asoc[this.getCol(row, '形態')] = 0;
      isbn_asoc[this.getCol(row, 'ISBN')] = 0;
    }
    YKLiblog.Log.info(`status=${ Object.keys(status_asoc)}` );
    YKLiblog.Log.info(`shape =${ Object.keys(shape_asoc)}` );
    YKLiblog.Log.info(`isbn  =${ Object.keys(isbn_asoc)}` );
  }

  /**
   * @method show3
   * @description デバッグ用：読了、速読、図-読了の状態と形態の組み合わせ、およびISBNの分布をログに出力します。
   */
  show3(){
    let status_asoc = {};
    let isbn_asoc = {};

     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const status = this.getCol(row, '状態');
      const shape = this.getCol(row,'形態');
      if(status === '読了' || status === '速読' || status === '図-読了' ){
        if( !status_asoc[status] ){
          status_asoc[status] = {};
        }
        status_asoc[status][shape] = 0;        
      }
      const isbn = this.getCol(row, 'ISBN');
      if( (typeof isbn) === "string" ){
        if( !isbn_asoc[shape] ){
          isbn_asoc[shape] = {};
        }
        if( !isbn_asoc[shape][status] ){
          isbn_asoc[shape][status] = {};
        }
        isbn_asoc[shape][status][isbn] = 0;
      }
    }
    YKLiblog.Log.info(`status=${ Object.keys(status_asoc)}` );
    Object.keys(status_asoc).map( key => YKLiblog.Log.info( `key=${key} ${Object.keys( status_asoc[key] )}` ) );
    YKLiblog.Log.info(`====`);
    YKLiblog.Log.info(`isbn=${ Object.keys(isbn_asoc)}` );
    Object.keys(isbn_asoc).map( shape => {
      YKLiblog.Log.info( `shape=${shape}` );
      Object.keys( isbn_asoc[shape] ).map( status => {
        YKLiblog.Log.info( `  status=${status}` );
        YKLiblog.Log.info( `    isbn=${  Object.keys( isbn_asoc[shape][status] ) }` );
      } );
    } );
  }

  /**
   * @method show4
   * @description デバッグ用：ISBNの長さと形態の組み合わせをログに出力します。
   */
  show4(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'ISBN');
      const shape = this.getCol(row, '形態');
      if( (typeof isbn) === "string" ){
        if( isbn.length === 10){
          // Kindle Kindle-U
          if( shape === "Kindle"){
            // YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
          }
          else if( shape === "Kindle-U"){
            // YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 11){
          // Kindle
          YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 13){
          // 本
          if( shape !== "本"){
            YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 14){
          // 本
          YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 15){
          // 本
          YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 5){
          // EBOOK
          // YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 6){
          // "Kindle"
          // YKLiblog.Log.info`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 8){
          // "Kindle-U"
          // YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 1){
          // "本"
          // YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
        else{
          YKLiblog.Log.info(`${shape}|${isbn.length}|${isbn}`);
        }
      }
    }
  }

  /**
   * @method reformIsbn4
   * @description ISBN列を修正します。長さが13文字または14文字のISBNを数値に変換します。
   */
  reformIsbn4(){
    let num;
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'ISBN');
      const shape = this.getCol(row, '形態');
      if( (typeof isbn) === "string" ){
        if( isbn.length === 13 || isbn.length === 14){
          num = Number(isbn)
          this.setColValue(row, 'ISBN', num);
          this.setRow(i, row);
        }
      }
    }
  }

  /**
   * @method show6
   * @description デバッグ用：状態が'読了'のデータのISBNをログに出力します。
   */
  show6(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'ISBN');
      const shape = this.getCol(row, '形態');
      const status = this.getCol(row, '状態');
      if( status === "読了"){
        YKLiblog.Log.info(`${isbn}`);
      }
    }
  }
}
this.Table = Table;