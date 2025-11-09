import { NavLink } from 'react-router-dom';
import { BarChart3, Package, ShoppingBag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Customers', icon: Users },
];

type AdminSidebarProps = {
  className?: string;
  variant?: 'desktop' | 'sheet';
};

const variantClasses: Record<Required<AdminSidebarProps>['variant'], string> = {
  desktop: 'hidden lg:flex lg:flex-col',
  sheet: 'flex flex-col',
};

export const AdminSidebar = ({ className, variant = 'desktop' }: AdminSidebarProps) => (
  <aside className={cn('w-64 flex-shrink-0 border-r bg-background/60 backdrop-blur', variantClasses[variant], className)}>
    <div className="border-b p-6">
      <p className="text-lg font-semibold">QuickCart Admin</p>
      <p className="text-xs text-muted-foreground">Manage catalogue & sales</p>
    </div>
    <nav className="flex-1 space-y-1 p-4">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
