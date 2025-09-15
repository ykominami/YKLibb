/**
 * 環境設定クラス
 * スクリプトプロパティを使用して環境設定を管理する
 */
class Env {
  /**
   * 環境設定クラスのコンストラクタ
   * インスタンス作成時に自動的に設定を読み込みます
   */
  constructor(){
    this.load()
  }
  
  /**
   * 現在の環境設定をスクリプトプロパティに保存します
   * URL_HEAD_PART、ROOT_FOLDER_ID_ARRAY、pageTokenの値を保存します
   */
  save(){
    PropertiesService.getScriptProperties().setProperty('URL_HEAD_PART', this.urlHeadPart)
    PropertiesService.getScriptProperties().setProperty('ROOT_FOLDER_ID_ARRAY', this.rootFolderIdArray)
    PropertiesService.getScriptProperties().setProperty('pageToken', this.pageToken)
  }
  
  /**
   * スクリプトプロパティから環境設定を読み込みます
   * URL_HEAD_PART、ROOT_FOLDER_ID_ARRAY、pageTokenの値を読み込みます
   */
  load(){
    this.urlHeadPart = PropertiesService.getScriptProperties().getProperty('URL_HEAD_PART');
    this.rootFolderIdArray = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID_ARRAY');
    this.pageToken = PropertiesService.getScriptProperties().getProperty('pageToken');
  }
  
  /**
   * ページトークンを更新してスクリプトプロパティに保存します
   * @param {string} pageToken - 新しいページトークン
   */
  savePageToken(pageToken){
    this.pageToken = pageToken
    PropertiesService.getScriptProperties().setProperty('pageToken', this.pageToken)
  }
  
  /**
   * ページトークンをスクリプトプロパティから削除します
   */
  deletePageToken(){
    PropertiesService.getScriptProperties().deleteProperty('pageToken');
  }
}
const ENV = new Env();