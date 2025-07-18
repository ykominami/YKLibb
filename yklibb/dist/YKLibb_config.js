class Config {
  constructor(width, header, way){
    this.width = width
    this.header = header
    this.headerWidth = header.length
    if( this.headerWidth === 0 ){
      throw new Error(`this.headerWidth=${this.headerWidth}`)
    }

    this.way = way
  }
  getWidth(){
    return this.width
  }
  getHeader(){
    return this.header
  }
  getHeaderWidth(){
    return this.headerWidth
  }
  transform(col, width){
    let newConfig = this
    let newHeader = this.header
    const length = this.header.length
    if( length > 0 ){
      if( col >= 0){
        if( width > 0){
          newHeader = this.header.slice( col, width )
          const way = Config.PARTIAL()
          newConfig = new Config(width, newHeader, way)
        }
      }
    }
    return newConfig
  }
  static PARTIAL(){
    return 'PARTIAL'
  }
  static COMPLETE(){
    return 'COMPLETE'
  }
}
this.Config = Config
