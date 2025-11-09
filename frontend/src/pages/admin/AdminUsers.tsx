import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { toast } from 'sonner';

const USER_ROLES = ['', 'user', 'admin'] as const;

type RoleFilter = (typeof USER_ROLES)[number];

export const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') ?? '';
  const roleParam = (searchParams.get('role') as RoleFilter | null) ?? '';
  const pageParam = Number(searchParams.get('page') ?? '1');

  const [search, setSearch] = useState(searchParam);
  const [role, setRole] = useState<RoleFilter>(roleParam);
  const [page, setPage] = useState(pageParam);
  const queryClient = useQueryClient();

  useEffect(() => {
    setSearch(searchParam);
    setRole(roleParam);
    setPage(pageParam);
  }, [searchParam, roleParam, pageParam]);

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const params = useMemo(() => ({ search: search || undefined, role: role || undefined, page }), [search, role, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const { data: response } = await adminApi.users(params);
      return response.data;
    },
    keepPreviousData: true,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: 'user' | 'admin' }) => adminApi.toggleUserRole(id, nextRole),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => adminApi.toggleUserBlock(id, isBlocked),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to update user'),
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">Unable to load customers.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = data;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-base">Customers</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                setPage(1);
                updateParams({ search: value || undefined, page: 1 });
              }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {USER_ROLES.map((value) => (
              <Button
                key={value || 'all'}
                variant={role === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setRole(value);
                  setPage(1);
                  updateParams({ role: value || undefined, page: 1 });
                }}
              >
                {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.phone}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        roleMutation.mutate({
                          id: user._id,
                          nextRole: user.role === 'admin' ? 'user' : 'admin',
                        })
                      }
                      disabled={roleMutation.isPending}
                    >
                      {user.role === 'admin' ? <ShieldOff className="mr-1 h-4 w-4" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
                      {user.role === 'admin' ? 'Revoke' : 'Promote'}
                    </Button>
                    <Button
                      variant={user.isBlocked ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => blockMutation.mutate({ id: user._id, isBlocked: !user.isBlocked })}
                      disabled={blockMutation.isPending}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center justify-between gap-3 border-t px-6 py-4 text-sm text-muted-foreground">
        <div>
          Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => {
              const nextPage = pagination.page - 1;
              setPage(nextPage);
              updateParams({ page: nextPage });
            }}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => {
              const nextPage = pagination.page + 1;
              setPage(nextPage);
              updateParams({ page: nextPage });
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdminUsers;
