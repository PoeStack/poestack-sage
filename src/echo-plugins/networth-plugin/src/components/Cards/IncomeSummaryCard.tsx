import { Button, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { TrendingUp, XCircle } from 'lucide-react'
import { convertToCurrency } from '../../utils/currency.utils'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

interface IncomeSummaryCardProps {
  className?: string
}

const IncomeSummaryCard: React.FC<IncomeSummaryCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const { accountStore, priceStore, settingStore } = useStore()
  const incomeStartDate =
    dayjs(accountStore.activeAccount.activeProfile?.incomeResetAt).utc() ??
    dayjs().subtract(1, 'hour').utc()
  const latestNetWorthChange = convertToCurrency({
    value: accountStore.activeAccount.activeProfile?.netWorthChange(incomeStartDate.valueOf()) ?? 0,
    toCurrency: settingStore.currency,
    divinePrice: priceStore.divinePrice
  }).toFixed(2)

  // TODO i18n for message
  const incomeTimeFrameMessage = incomeStartDate.fromNow()

  const handleResetIncome = () => {
    accountStore.activeAccount.activeProfile?.setIncomeResetAt(dayjs().utc().valueOf())
  }

  return (
    <Card className={className}>
      <Card.Content className="p-2 py-1">
        <div className="flex flex-row items-center justify-between min-h-[64px]">
          <div className="flex flex-row items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <span>{`${latestNetWorthChange} ${settingStore.activeCurrency.short} / hr`}</span>
            <Button size="icon" variant="ghost" onClick={handleResetIncome}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="border-t p-3">
        <div className="text-sm flex flex-row grow items-center justify-between">
          <span>{t('label.income')}</span>
          <span>{`Since ${incomeTimeFrameMessage}`}</span>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(IncomeSummaryCard)
