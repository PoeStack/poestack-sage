import { Skeleton } from 'echo-common/components-v1'

export default function MainContentSkeleton() {
  return (
    <main className="flex flex-col p-2 gap-4">
      <div className="flex flex-row gap-4 flex-wrap">
        <Skeleton className="min-w-[300px] h-32 grow" />
        <Skeleton className="min-w-[300px] h-32 grow" />
        <Skeleton className="min-w-[300px] h-32 grow" />
      </div>
      <Skeleton className="h-11 grow" />
      <Skeleton className="h-11 grow" />
      <div className="flex flex-row">
        <Skeleton className="h-80 grow" />
      </div>
    </main>
  )
}
