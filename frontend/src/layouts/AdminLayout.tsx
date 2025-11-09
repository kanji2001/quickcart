import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectAuthUser } from '@/stores/auth-store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthStore(selectAuthUser);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30 overflow-x-hidden">
      <div className="flex">
        <AdminSidebar variant="desktop" />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="lg:hidden fixed top-20 left-4 z-30">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open admin navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 max-w-[90vw] p-0">
            <AdminSidebar variant="sheet" className="w-full border-none" />
          </SheetContent>
        </Sheet>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name ?? 'Admin'}.</p>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
