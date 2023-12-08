import { Plugin } from 'rollup'
import { zip, COMPRESSION_LEVEL } from 'zip-a-folder'

interface IPluginOptions {
  srcDir: string
  file: string
}

type RollupPluginZip = (options: IPluginOptions) => Plugin

const zipPlugin: RollupPluginZip = (options) => ({
  name: 'zip',
  closeBundle(): Promise<any> {
    return zip(options.srcDir, options.file, {
      compression: COMPRESSION_LEVEL.high
    })
  }
})

export default zipPlugin
