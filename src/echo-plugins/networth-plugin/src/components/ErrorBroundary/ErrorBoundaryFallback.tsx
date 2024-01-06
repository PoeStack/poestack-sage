import { observer } from 'mobx-react-lite'
import React from 'react'
import { Button, Card } from 'echo-common/components-v1'
import { FallbackProps, useErrorBoundary } from 'react-error-boundary'
import { resetStore } from '../..'
import { resetAll } from '../../db'
import { app } from '@electron/remote'

const ErrorBoundaryFallback: React.FC<FallbackProps> = ({ error }) => {
  // const { resetBoundary } = useErrorBoundary()

  return (
    <div className="flex justify-center w-full h-full items-center">
      <Card className="max-w-[380px] w-full">
        <Card.Header>
          <Card.Title>Ouch.... the plugin crashed...</Card.Title>
          <Card.Description>
            The plugin creashed, please send us more information...
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <p>
            The plugin is probably corrupted. The only option currently is to reset the plugin. If
            you know what this issue might be, please create an issue on Github{' '}
            <a href="https://github.com/C3ntraX/poestack-sage/issues" className="underline">
              here.
            </a>
          </p>
          <span></span>
        </Card.Content>
        <Card.Footer>
          <Button
            className="w-full"
            onClick={() => {
              resetAll().then(() => {
                app.relaunch()
                app.quit()
                // --- This following is somehow not working
                // resetStore()
                // resetBoundary()
              })
            }}
          >
            Reset & Restart app
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}

export default observer(ErrorBoundaryFallback)
