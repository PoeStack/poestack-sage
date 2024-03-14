'use client'

import { listNotifications, postNotifications } from "@/lib/http-util"
import { useEffect } from "react"

export default function Test() {
  useEffect(() => {
    postNotifications({
      targetId: "d3d595b6-6982-48f9-9358-048292beb8a7",
      type: "test",
      body: { test: "asdasd" }
    })

    listNotifications(Date.now() - (1000 * 60 * 60)).then((e) => {
      console.log("notis", e)
    })
  }, [])


  return (
    <div>
      Home
    </div>
  )
}
