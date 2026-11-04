import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  LogOut,
  CheckCircle,
  Clock,
  Flower,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../state/useAuth'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'

export function UserProfileCard() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Generate initials for avatar fallback
  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name?.trim()) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'GF'
  }

  return (
    <Card className="w-full max-w-md mx-auto p-8 border-neutral-200 dark:border-neutral-800 shadow-sm text-center">
      {/* Avatar Header */}
      <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Graduate Profile'}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold tracking-wider">
            {getInitials(user.displayName, user.email)}
          </span>
        )}
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-neutral-900">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
        {user.displayName ?? 'Honored Graduate'}
      </h2>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3">
        {user.email}
      </p>

      <div className="flex items-center justify-center gap-2 mb-6">
        <Badge
          variant={user.emailVerified ? 'success' : 'default'}
          className="gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          <span>
            {user.emailVerified ? 'Verified Account' : 'Standard Member'}
          </span>
        </Badge>
        <Badge variant="purple" className="gap-1">
          <User className="h-3 w-3" />
          <span>Class of 2026</span>
        </Badge>
      </div>

      {user.createdAt && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-6">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <Link to="/flowers" className="block w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            leftIcon={<Flower className="h-4 w-4" />}
          >
            Explore Graduation Bouquets
          </Button>
        </Link>

        <Button
          variant="outline"
          size="md"
          isLoading={isLoggingOut}
          onClick={handleLogout}
          className="w-full"
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </Button>
      </div>
    </Card>
  )
}
