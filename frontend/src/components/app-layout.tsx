import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Home, Plus, CalendarDays, LayoutGrid, Bell, MapPin } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { aktuellerNutzer, getStandort } from "@/lib/mock-data"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/buchen", label: "Raum buchen", icon: Plus },
  { to: "/buchungen", label: "Meine Buchungen", icon: CalendarDays },
  { to: "/uebersicht", label: "Übersicht", icon: LayoutGrid },
]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 font-bold text-primary-foreground shadow-sm shadow-primary/30">
        C
      </div>
      <span className="text-lg font-semibold tracking-tight">Calvin</span>
    </div>
  )
}

export function AppLayout() {
  const location = useLocation()
  const standort = getStandort(aktuellerNutzer.standortId)

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t p-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Dein Standort: <strong className="text-foreground">{standort?.name}</strong>
            </span>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-svh flex-col md:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {aktuellerNutzer.initialen}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {aktuellerNutzer.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-card md:hidden">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
