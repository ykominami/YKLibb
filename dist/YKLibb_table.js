/**
 * @class Table
 * @description テーブルデータを管理するクラスです。
 * @param {Array<string>} header テーブルのヘッダー行の配列
 * @param {Array<Array<any>>} values テーブルのデータ行の二次元配列
 * @param {Range} dataRange テーブルのデータ行の二次元配列
 */
class Table {
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

  getRow(index){
    return this.values[index];
  }
  getCol(row, name){
    return row[ this.header_index[name] ];
  }
  setColValue(row, name, value){
    row[ this.header_index[name] ] = value;
  }
  setRow(index, row){
    this.values[index] = row;
  }
  /**
   * @method getHeader
   * @description isbn列を修正する。
   */
  reformIsbn(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      if( this.getCol(row, '形態') == '本' ){
        let value = this.getCol(row, 'ISBN');
        if( (typeof value) === "string" ){
          value = value.trim();
          value = value.replace(/^978-/, "978");
          Logger.log( `value=${value}` );
          Logger.log(`typeof value=${typeof value}`);
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }
  reformIsbn2(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      let value = this.getCol(row, 'ISBN');
      if( (typeof value) === "string" ){
        if( value.length === 15){
          Logger.log( `0 length=${value.length}` );
          value = value.replace(/\s+/g, "");
          value = value.replace(/^978-/, "978");
          Logger.log( `value=${value}` );
          Logger.log( `1 length=${value.length}` );
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }
  reformIsbn3(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      let value = this.getCol(row, 'ISBN');
      if( (typeof value) === "string" ){
        if( value.length === 10){
          Logger.log( `0 length=${value.length}` );
          value = value.replace(/\s+/g, "");
          value = value.replace(/^978-/, "978");
          Logger.log( `value=${value}` );
          Logger.log( `1 length=${value.length}` );
          this.setColValue(row, 'ISBN', value);
          this.setRow(i, row);
        }
      }
    }
  }
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
   * @method getRow
   * @description 指定したインデックスのデータ行を取得します。
   * @param {number} index 取得する行のインデックス
   * @returns {Array<any>} 指定したインデックスのデータ行
   */
  getRow(index) {
    return this.values[index];
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
  showB(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const shape = this.getCol(row, 'shape');
      const asin = this.getCol(row, 'asin');
      Logger.log(`shape=${shape} asin=${asin}`);
    }
  }
  showB4(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'asin');
      const shape = this.getCol(row, 'shape');
      if( (typeof isbn) === "string" ){
        if( isbn.length === 10){
          // Kindle Kindle-U
          if( shape === 3){
            // Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else if( shape === 4){
            // Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 11){
          // Kindle
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 13){
          // 本
          if( shape !== "本"){
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 14){
          // 本
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 15){
          // 本
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 5){
          // EBOOK
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 6){
          // "Kindle"
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 8){
          // "Kindle-U"
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 1){
          // "本"
          // Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else{
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
      }
    }
  }

  show(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      if( this.getCol(row, '状態') === '読了' ){
        const shape = this.getCol(row, '形態');
        const isbn = this.getCol(row, 'ISBN');
        Logger.log(`shape=${shape} isbn=${isbn}`);
      }
    }
  }
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
    Logger.log(`status=${ Object.keys(status_asoc)}` );
    Logger.log(`shape =${ Object.keys(shape_asoc)}` );
    Logger.log(`isbn  =${ Object.keys(isbn_asoc)}` );
  }
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
    Logger.log(`status=${ Object.keys(status_asoc)}` );
    Object.keys(status_asoc).map( key => Logger.log( `key=${key} ${Object.keys( status_asoc[key] )}` ) );
    Logger.log(`====`);
    Logger.log(`isbn=${ Object.keys(isbn_asoc)}` );
    Object.keys(isbn_asoc).map( shape => {
      Logger.log( `shape=${shape}` );
      Object.keys( isbn_asoc[shape] ).map( status => {
        Logger.log( `  status=${status}` );
        Logger.log( `    isbn=${  Object.keys( isbn_asoc[shape][status] ) }` );
      } );
    } );
  }
  show4(){
     for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'ISBN');
      const shape = this.getCol(row, '形態');
      if( (typeof isbn) === "string" ){
        if( isbn.length === 10){
          // Kindle Kindle-U
          if( shape === "Kindle"){
            // Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else if( shape === "Kindle-U"){
            // Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 11){
          // Kindle
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 13){
          // 本
          if( shape !== "本"){
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
          else{
            Logger.log(`${shape}|${isbn.length}|${isbn}`);
          }
        }
        else if( isbn.length === 14){
          // 本
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 15){
          // 本
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 5){
          // EBOOK
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 6){
          // "Kindle"
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 8){
          // "Kindle-U"
          //Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else if( isbn.length === 1){
          // "本"
          // Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
        else{
          Logger.log(`${shape}|${isbn.length}|${isbn}`);
        }
      }
    }
  }
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
  show6(){
    for(let i=0; i<this.values.length; i++){
      const row = this.getRow(i);
      const isbn = this.getCol(row, 'ISBN');
      const shape = this.getCol(row, '形態');
      const status = this.getCol(row, '状態');
      if( status === "読了"){
        Logger.log(`${isbn}`);
      }
    }
  }
}
this.Table = Table;