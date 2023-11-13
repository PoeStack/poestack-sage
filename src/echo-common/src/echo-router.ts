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
    if (!this.routes$.value.some((r) => r.plugin === route.plugin && r.path === route.path)) {
      this.routes$.next([...this.routes$.value, route])
    }
  }

  public unregisterRoute(route: EchoRoute) {
    this.routes$.next(
      this.routes$.value.filter((r) => r.plugin !== route.plugin && r.path !== route.page)
    )
  }

  public push(next: { plugin: string; path: string }) {
    const nextRoute = this.routes$.value.find(
      (e) => e.plugin === next.plugin && e.path === next.path
    )

    if (this.currentRoute$.value !== nextRoute) {
      this.currentRoute$.next(nextRoute ?? null)
    }
  }
}

export const ECHO_ROUTER = new EchoRouter()
