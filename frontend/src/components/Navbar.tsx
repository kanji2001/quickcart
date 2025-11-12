import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, User, Moon, Sun, Menu, X, Heart, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/stores/theme-store';
import { useCartStore } from '@/stores/cart-store';
import { useCartQuery } from '@/hooks/cart/use-cart';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '@/stores/auth-store';
import { useLogoutMutation } from '@/hooks/auth/use-logout';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

const DesktopLinks = () => (
  <div className="hidden lg:flex items-center space-x-8">
    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
      Home
    </Link>
    <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
      Products
    </Link>
    <Link to="/categories" className="text-sm font-medium transition-colors hover:text-primary">
      Categories
    </Link>
    <Link to="/deals" className="text-sm font-medium transition-colors hover:text-primary">
      Deals
    </Link>
  </div>
);

type UserMenuProps = {
  onLogout: () => void;
};

const AuthenticatedMenu = ({ onLogout }: UserMenuProps) => {
  const user = useAuthStore(selectAuthUser);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.role === 'admin' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="cursor-pointer">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist" className="cursor-pointer">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
};

const MobileMenu = ({ isOpen, onClose, isAuthenticated }: MobileMenuProps) => {
  const user = useAuthStore(selectAuthUser);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium" onClick={onClose}>
              Home
            </Link>
            <Link to="/products" className="block py-2 text-sm font-medium" onClick={onClose}>
              Products
            </Link>
            <Link to="/categories" className="block py-2 text-sm font-medium" onClick={onClose}>
              Categories
            </Link>
            <Link to="/deals" className="block py-2 text-sm font-medium" onClick={onClose}>
              Deals
            </Link>
            {user?.role === 'admin' ? (
              <Link to="/admin" className="block py-2 text-sm font-medium" onClick={onClose}>
                Admin Dashboard
              </Link>
            ) : null}
            {!isAuthenticated && (
              <Button asChild size="sm" className="w-full gradient-primary mt-4">
                <Link to="/login" onClick={onClose}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleCart } = useCartStore();
  const { data: cart } = useCartQuery();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const logoutMutation = useLogoutMutation();
  const user = useAuthStore(selectAuthUser);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const cartItemsCount = cart?.totalItems ?? 0;

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Sign out of QuickCart?',
      description: 'Any in-progress checkout information will be cleared from this device.',
      confirmText: 'Logout',
      variant: 'destructive',
    });
    if (!confirmed) {
      return;
    }
    logoutMutation.mutate();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    if (qParam !== null) {
      setSearchQuery(qParam);
      return;
    }

    if (location.pathname.startsWith('/search')) {
      setSearchQuery('');
      return;
    }

    setSearchQuery('');
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileOpen(false);
    if (!trimmed) {
      navigate('/products');
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      {ConfirmDialog}
      <nav className="sticky top-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">QuickCart</span>
          </Link>

          <DesktopLinks />

          <form className="hidden xl:flex items-center flex-1 max-w-md mx-8" onSubmit={handleSearchSubmit}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10 bg-muted/50"
                aria-label="Search products and categories"
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                  <Badge className="h-5 w-5 flex items-center justify-center p-0 gradient-primary border-0">
                    {cartItemsCount}
                  </Badge>
                </motion.div>
              )}
            </Button>

            {isAuthenticated ? (
              <AuthenticatedMenu onLogout={handleLogout} />
            ) : (
              <Button asChild size="sm" className="hidden sm:flex gradient-primary">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            {isAuthenticated && user?.role === 'admin' ? (
              <Button asChild variant="outline" size="sm" className="hidden lg:flex">
                <Link to="/admin">Admin</Link>
              </Button>
            ) : null}

            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((prev) => !prev)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="xl:hidden pb-4">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 bg-muted/50"
              aria-label="Search products and categories"
            />
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </div>
      </div>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} isAuthenticated={isAuthenticated} />
      </nav>
    </>
  );
}
