
function initx3(env){
  let [header, values, dataRange] = Gssx.setupSpreadsheet(env.ss_id, env.sheet_name);

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
