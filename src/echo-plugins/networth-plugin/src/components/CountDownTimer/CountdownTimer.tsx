import { observer } from 'mobx-react-lite'
import dayjs from 'dayjs'
import React, { useRef } from 'react'
import { useEffect, useState } from 'react'

type CountdownTimerProps = {
  comparison: number
  timeOverCb?: () => void
}

const CountdownTimer = ({ comparison, timeOverCb }: CountdownTimerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout[]>([])
  const calculateTimeLeft = () => {
    const difference = dayjs.utc(comparison).diff(dayjs.utc())
    let timeLeft = 0

    if (difference > 0) {
      timeLeft = Math.round(difference / 1000)
    } else {
      timeOverCb?.()
    }

    if (timeLeft > 59) {
      return dayjs
        .duration(timeLeft, 'seconds')
        .format(`m [minute${timeLeft > 119 ? 's' : ''}], s [seconds]`)
    }
    return dayjs.duration(timeLeft, 'seconds').format('s [seconds]')
  }

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft())

  useEffect(() => {
    const timeout = setTimeout(() => {
      const index = timeoutRef.current.indexOf(timeout)
      if (index > -1) {
        timeoutRef.current.splice(index, 1)
      }
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    timeoutRef.current.push(timeout)
  })

  useEffect(
    () => () => {
      timeoutRef.current.forEach((timeout) => clearTimeout(timeout))
    },
    []
  )

  return <>{timeLeft}</>
}

export default observer(CountdownTimer)
