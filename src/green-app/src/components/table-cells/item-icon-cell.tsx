import { getRarity, rarityColors } from '@/lib/item-util'
import Image from 'next/image'

type ItemIconCellProps = {
  value: string
  frameType?: number
  showRarityIndicator?: boolean
}

export const ItemIconCell = ({ value, frameType, showRarityIndicator }: ItemIconCellProps) => {
  return (
    <div className="flex flex-row gap-2 shrink-0">
      {showRarityIndicator && frameType !== undefined && (
        <div
          style={{
            borderLeft: `5px solid ${rarityColors[getRarity(frameType)]}`
            // background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, rgba(0,0,0,0) 100%)`
          }}
          className="flex justify-start items-center h-full pr-[4px]"
        />
      )}
      <Image
        src={typeof value === 'string' ? value : ''}
        alt={''}
        height={32}
        width={32}
        sizes="33vw"
        style={{
          width: 'auto',
          height: '32px',
          objectFit: 'contain',
          flexShrink: 0,
          paddingBlock: '0.125rem'
        }}
      />
    </div>
  )
}
