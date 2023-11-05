import { BehaviorSubject } from 'rxjs'

export type EchoRoute = {
  plugin: string
  path: string
  page: any
  navItems?: EchoRouterNavItem[] | null
}

export type RouterNavLocation = 'l-sidebar-m' | 'l-sidebar-b'

export type EchoRouterNavItem = {
  location: RouterNavLocation
  icon: any
}

export class EchoRouter {
  routes$ = new BehaviorSubject<EchoRoute[]>([])
  currentRoute$ = new BehaviorSubject<EchoRoute | null>(null)

  public registerRoute(route: EchoRoute) {
    this.routes$.next([...this.routes$.value, route])
  }

  public removeRoute(next: { plugin: string; path: string }) {}

  public push(next: { plugin: string; path: string }) {
    const nextRoute = this.routes$.value.find(
      (e) => e.plugin === next.plugin && e.path === next.path
    )
    this.currentRoute$.next(nextRoute ?? null)
  }
}

export const ECHO_ROUTER = new EchoRouter()
