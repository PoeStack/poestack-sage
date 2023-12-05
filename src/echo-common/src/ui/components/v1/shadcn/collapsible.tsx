'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

const CollapsibleRoot = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export const Collapsible: typeof CollapsibleRoot & {
  Trigger: typeof CollapsibleTrigger
  Content: typeof CollapsibleContent
} = Object.assign(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent
})
