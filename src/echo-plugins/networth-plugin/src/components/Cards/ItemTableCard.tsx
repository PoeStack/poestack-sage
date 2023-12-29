import * as React from 'react'
import { Accordion, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { ListIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ItemTableContainer from '../ItemTable/ItemTableContainer'

interface ItemTableCardProps {
  className?: string
}

const ItemTableCard: React.FC<ItemTableCardProps> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <Accordion type="single" collapsible className={className}>
      <Card className="w-full">
        <Accordion.Item value="item-1" className="border-b-0">
          <Accordion.Trigger className="pr-2 py-0">
            <Card.Header className="flex flex-row justify-between items-center p-3 space-y-0">
              <ListIcon className="h-5 w-5" />
              <div className="pl-2 uppercase">{t('title.itemsCard')}</div>
            </Card.Header>
          </Accordion.Trigger>
          <Accordion.Content>
            <Card.Content className="p-2 border-t">
              <ItemTableContainer />
            </Card.Content>
          </Accordion.Content>
        </Accordion.Item>
      </Card>
    </Accordion>
  )
}

export default observer(ItemTableCard)
