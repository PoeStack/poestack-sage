import { Skeleton } from 'echo-common/components-v1'

export default function ToolbarContentSkeleton() {
  return (
    <div className="divide-x divide-solid flex flex-1 flex-row items-center justify-end">
      <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="py-1 px-1 h-full flex justify-center items-center">
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  )
}
