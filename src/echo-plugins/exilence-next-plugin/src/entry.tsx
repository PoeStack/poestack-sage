import React from 'react'
import { EchoPluginHook } from 'echo-common'
import { destroy, start } from '.'

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
