import {
  ArrowPathIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  TrashIcon,
  UsersIcon,
  XCircleIcon
} from '@heroicons/react/20/solid'
import { ProfileMenu } from './ProfileMenu'
import { AddProfileDialog } from './AddProfileDialog'

export type ToolbarProps = {}

export function Toolbar({}: ToolbarProps) {
  return (
    <header className="sticky top-0 z-50 divide-x divide-solid bg-black flex flex-row items-center justify-end">
      <div className="py-3 px-3 h-full flex justify-center items-center gap-2.5">
        <Cog6ToothIcon className="w-5 h-5" />
        <ProfileMenu />
        <AddProfileDialog />
        <TrashIcon className="w-5 h-5" />
      </div>
      <div className="py-3 px-3 h-full flex justify-center items-center gap-2.5">
        <button className="border p-1 pr-1.5 rounded">
          <div className="flex flex-row justify-center text-sm items-center gap-1">
            <ArrowPathIcon className="w-4 h-4" />
            <p>TAKE SNAPSHOT</p>
          </div>
        </button>
        <XCircleIcon className="w-5 h-5" />
        <TrashIcon className="w-5 h-5" />
      </div>
      <div className="py-3 px-3 h-full flex justify-center items-center">
        <PlusCircleIcon className="w-5 h-5" />
      </div>
      <div className="py-3 px-3 h-full flex justify-center items-center">
        <UsersIcon className="w-5 h-5" />
      </div>
    </header>
  )
}
