'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Package, Settings, X, ClipboardCheck, Users, Ship } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const publicNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Containers', href: '/dashboard/containers', icon: Package },
  { name: 'Tracking', href: '/dashboard/tracking', icon: Ship },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const staffNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Inspections', href: '/admin/inspections', icon: ClipboardCheck },
  { name: 'Containers', href: '/admin/containers', icon: Package },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Determine navigation based on user type
  const navigation = user?.user_type === 'staff' ? staffNavigation : publicNavigation

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Close Button */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <span className="text-sm font-bold">GT</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">GTMS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                    onClose()
                  }}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t p-4">
            {user && (
              <div className="mb-3 rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {user.user_type === 'staff' ? 'Staff Member' : 'Public User'}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
