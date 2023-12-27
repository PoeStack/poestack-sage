import { useRef, useState } from 'react'
import { Card, Collapsible } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { ChevronDownIcon, ChevronRightIcon, ListIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ItemTableContainer from '../ItemTable/ItemTableContainer'

interface ItemTableCardProps {
  className?: string
}

const ItemTableCard: React.FC<ItemTableCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <Card className="w-full">
        <Collapsible.Trigger className="!mt-0 cursor-pointer" asChild>
          <Card.Header className="flex flex-row justify-between items-center p-3">
            <div className="flex flex-row items-center">
              <ListIcon />
              <Card.Title className="text-base pl-2 uppercase">{t('title.itemsCard')}</Card.Title>
            </div>

            {open ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Card.Header>
        </Collapsible.Trigger>
        {/* Keep the table mounted */}
        <Collapsible.Content forceMount={true} hidden={!open}>
          <Card.Content className="w-full px-8 py-4">
            <ItemTableContainer />
          </Card.Content>
        </Collapsible.Content>
      </Card>
    </Collapsible>
  )
}

export default observer(ItemTableCard)
