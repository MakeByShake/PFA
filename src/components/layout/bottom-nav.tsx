'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Calculator, TrendingUp, CreditCard, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Главная' },
  { href: '/dashboard/wishlist', icon: ShoppingBag, label: 'Вишлист' },
  { href: '/dashboard/income', icon: TrendingUp, label: 'Доходы' },
  { href: '/dashboard/debts', icon: CreditCard, label: 'Долги' },
  { href: '/dashboard/history', icon: Clock, label: 'История' },
  { href: '/dashboard/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors text-xs font-medium',
                active
                  ? 'text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
