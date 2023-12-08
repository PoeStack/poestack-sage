import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from '../echo-context-factory'
import { Button, Form, Switch } from 'echo-common/components-v1'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PoeStackSettings } from 'echo-common'
import { dialog, getCurrentWindow } from '@electron/remote'
import { FolderOpenDotIcon, XCircle } from 'lucide-react'

const [usePoeStackSettings] = bind(APP_CONTEXT.poeStackSettings.poeStackSettings$)

export const PoeStackSettingsPage = () => {
  const { t } = useTranslation()
  const settings = usePoeStackSettings()

  const form = useForm<PoeStackSettings>({ defaultValues: settings })

  const { handleSubmit } = form

  const onSubmit = (formData: PoeStackSettings) => {
    APP_CONTEXT.poeStackSettings.writePoeStackSettings(formData)
  }

  const handleClientLogSelect = async (onChange) => {
    const { filePaths } = await dialog.showOpenDialog(getCurrentWindow(), {
      properties: ['openFile'],
      filters: [{ name: 'Client', extensions: ['txt'] }]
    })
    if (filePaths && filePaths.length > 0) {
      onChange(filePaths[0])
      handleSubmit(onSubmit)()
    }
  }

  return (
    <div className="p-4 w-full h-full overflow-y-scroll">
      <div className="flex flex-row">
        <h1 className="font-semibold text-accent-foreground">{t('title.poeStackSettings')}</h1>
      </div>
      <div>
        <Form {...form}>
          <div className="flex flex-col gap-4">
            <Form.Field
              control={form.control}
              name="poeClientLogPath"
              render={({ field: { value, onChange } }) => (
                <Form.Item>
                  <Form.Label>{t('label.clientLogPath')}</Form.Label>
                  <Form.Control>
                    <div className="flex flex-row w-full max-w-sm items-center justify-between border gap-2 rounded-md">
                      <Button
                        onClick={() => handleClientLogSelect(onChange)}
                        variant="ghost"
                        className="border-r rounded-md"
                        size="icon"
                      >
                        <FolderOpenDotIcon className="h-4 w-4" />
                      </Button>
                      <span className="text-sm truncate w-4/5">
                        {value ? `...${value.slice(-35)}` : t('label.chooseFile')}
                      </span>
                      {value && (
                        <Button
                          onClick={() => {
                            onChange('')
                            handleSubmit(onSubmit)()
                          }}
                          className="rounded-md"
                          variant="ghost"
                          size="icon"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="minimizeToTrayOnClose"
              render={({ field: { value, onChange } }) => (
                <Form.Item>
                  <div className="flex flex-col gap-3">
                    <Form.Label>{t('label.minimizeToTray')}</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={value}
                        onCheckedChange={(value) => {
                          onChange(value)
                          handleSubmit(onSubmit)()
                        }}
                      />
                    </Form.Control>
                  </div>

                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </Form>
      </div>
      <div className="basis-1/4"></div>
    </div>
  )
}
