class Ga{
  static disp(){
    return "A"
  }
  static setupForSpreadsheet(spreadsheetId, sheetName, ultimate=false){
    const [spreadsheet, worksheet] = Gssx.setupForSpreadsheet(spreadsheetId, sheetName);
    const [header, totalValues, totalRange] = Gssx.setupSpreadsheetForHeaderAndValues(worksheet, ultimate);
    return [header, totalValues, totalRange]
  }
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
