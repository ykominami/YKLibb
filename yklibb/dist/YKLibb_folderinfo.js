/**
 * フォルダ情報クラス
 * Google Driveのフォルダ情報を管理する
 */
class FolderInfo {
  /**
   * FolderInfoクラスのコンストラクタ
   * @param {string} parentFolderPath - ">"で区切られたルートフォルダからのフォルダ階層で示されたパスを表す文字列
   * @param {string} parentFolderId - 親フォルダのID
   */
  constructor (parentFolderPath, parentFolderId){
    this.parentFolderPath = parentFolderPath
    this.parentFolderId = parentFolderId
    YKLiblog.Log.debug(`FolderInfo constructor this.parentFolderPath=${this.parentFolderPath} parentFolderPath=${parentFolderPath}`)
    this.folderName = null
    this.folderId = null
  }
  
  /**
   * 親フォルダのパスを取得する
   * @returns {string} 親フォルダのパス
   */
  getParentFolderPath(){
    return this.parentFolderPath
  }
  
  /**
   * 親フォルダのIDを取得する
   * @returns {string} 親フォルダのID
   */
  getParentFolderId(){
    return this.parentFolderId
  }
}


this.FolderInfo = FolderInfo;