class Env {
  constructor(){
    this.load()
  }
  save(){
    PropertiesService.getScriptProperties().setProperty('URL_HEAD_PART', this.urlHeadPart)
    PropertiesService.getScriptProperties().setProperty('ROOT_FOLDER_ID_ARRAY', this.rootFolderIdArray)
    PropertiesService.getScriptProperties().setProperty('pageToken', this.pageToken)
  }
  load(){
    this.urlHeadPart = PropertiesService.getScriptProperties().getProperty('URL_HEAD_PART');
    this.rootFolderIdArray = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID_ARRAY');
    this.pageToken = PropertiesService.getScriptProperties().getProperty('pageToken');
  }
  savePageToken(pageToken){
    this.pageToken = pageToken
    PropertiesService.getScriptProperties().setProperty('pageToken', this.pageToken)
  }
  deletePageToken(){
    PropertiesService.getScriptProperties().deleteProperty('pageToken');
  }
}
const ENV = new Env();