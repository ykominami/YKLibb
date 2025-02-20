function initx(){
  YKLiba.Log.setLogLevel(YKLiba.Log.DEBUG())
  const env2 = getEnv2()
  YKLiba.Log.debug(env2)
  values = YKLiba.get_simple_rows_with_env(env2)
  YKLiba.Log.debug(values)
  /*
  get_simple_rows_with_env(env2, maxRange = null)
  [ssId, sheet] = YKLiba.get_spreadsheet(env2.ssId, env2.sheetName)
  YKLiba.get
  */
}

function initx3(env){
  // YKLiba.Log.setLogLevel(YKLiba.Log.DEBUG())
  // const env3 = getEnv3()
  // YKLiba.Log.debug(env3)
  // values = YKLiba.get_simple_rows_with_env(env3)
  let [header, values, dataRange] = setupSpreadsheet(env.ss_id, env.sheet_name);
  // YKLiba.Log.debug(header)
  // YKLiba.Log.debug(values)

  return  [header, values, dataRange];
}

function getSheetContent(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn4();
  const array = [table.getHeader(), ...table.getValues()];
  table.storeTable(array);
}

function syncState(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn4();
  //table.show();
}
function syncState2(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show2();
}
function syncState3(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show3();
}
function syncState4(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show4();
}
function syncState5(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.reformIsbn2();
  const array = [table.getHeader(), ...table.getValues()];
  table.storeTable(array);
}
function syncState6(){
  let [header, values, dataRange] = initx3();

  const table = new Table(header, values, dataRange);
  // table.reformIsbn();
  table.show6();
}
