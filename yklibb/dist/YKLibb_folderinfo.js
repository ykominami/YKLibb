class FolderInfo {
  constructor (parentFolderPath, parentFolderId){
    // ">"で区切られたルートフォルダからのフォルダ階層で示されたパスを表す文字列
    this.parentFolderPath = parentFolderPath
    this.parentFolderId = parentFolderId
    YKLiblog.Log.debug(`FolderInfo constructor this.parentFolderPath=${this.parentFolderPath} parentFolderPath=${parentFolderPath}`)
    this.folderName = null
    this.folderId = null
  }
  getParentFolderPath(){
    return this.parentFolderPath
  }
  getParentFolderId(){
    return this.parentFolderId
  }
}


this.FolderInfo = FolderInfo;