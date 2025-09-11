
/**
 * スプレッドシートの初期化を行う
 * @param {Object} env - 環境設定オブジェクト（ss_id, sheet_nameを含む）
 * @returns {Array} [header, values, dataRange] - ヘッダー、値、データ範囲の配列
 */
function initx3(env){
  let [header, values, dataRange] = Gssx.setupSpreadsheet(env.ss_id, env.sheet_name);

  return  [header, values, dataRange];
}

/**
 * シートの内容を取得し、ISBNを正規化してテーブルに保存する
 */
function getSheetContent(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn4();
  const array = [table.getHeader(), ...table.getValues()];
  table.storeTable(array);
}

/**
 * 状態を同期し、ISBNを正規化する（表示なし）
 */
function syncState(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn4();
  //table.show();
}

/**
 * 状態を同期し、show2メソッドで表示する
 */
function syncState2(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show2();
}

/**
 * 状態を同期し、show3メソッドで表示する
 */
function syncState3(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show3();
}

/**
 * 状態を同期し、show4メソッドで表示する
 */
function syncState4(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show4();
}

/**
 * 状態を同期し、ISBNを正規化してテーブルに保存する（reformIsbn2使用）
 */
function syncState5(env){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn2();
  const array = [table.getHeader(), ...table.getValues()];
  table.storeTable(array);
}

/**
 * 状態を同期し、show6メソッドで表示する
 */
function syncState6(env){
  let [header, values, dataRange] = initx3(env);

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show6();
}
