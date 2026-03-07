'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, TrendingUp, CreditCard, Clock, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const USER_NAV = [
  { href: '/dashboard', icon: Home, label: 'Главная' },
  { href: '/dashboard/wishlist', icon: ShoppingBag, label: 'Вишлист' },
  { href: '/dashboard/income', icon: TrendingUp, label: 'Доходы' },
  { href: '/dashboard/debts', icon: CreditCard, label: 'Долги' },
  { href: '/dashboard/history', icon: Clock, label: 'История' },
  { href: '/dashboard/profile', icon: User, label: 'Профиль' },
];

const ADMIN_ITEM = { href: '/admin', icon: Shield, label: 'Админ' };

export function BottomNav() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.currentUser?.role);

  const items = role === 'admin'
    ? [USER_NAV[0], ADMIN_ITEM, ...USER_NAV.slice(1)]
    : USER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors font-medium',
                active
                  ? item.href === '/admin' ? 'text-violet-400' : 'text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className="text-[9px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
