import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { UserTable } from '@/components/admin/UserTable';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { UserSearch } from '@/components/admin/UserSearch';
import { UserPagination } from '@/components/admin/UserPagination';
import { useAdminActions } from '@/hooks/useAdminActions';

interface User {
  id: string;
  nome: string | null;
  email: string | null;
  phone: string | null;
  admin: boolean | null;
  ativo: boolean | null;
  created_at: string;
  avatar_url: string | null;
}

export default function Admin() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

  const { listUsers } = useAdminActions(page, pageSize, searchTerm);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset para primeira página ao mudar tamanho
  }, []);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(1); // Reset para primeira página ao buscar
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administração de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <UserSearch value={searchTerm} onChange={handleSearchChange} />
        </div>
        
        <UserTable
          users={listUsers.data?.users || []}
          isLoading={listUsers.isLoading}
          onEdit={setEditingUser}
          onDelete={setDeletingUser}
        />

        <UserPagination
          currentPage={page}
          pageSize={pageSize}
          totalUsers={listUsers.data?.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditUserModal
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />

      <DeleteUserDialog
        user={deletingUser}
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      />
    </div>
  );
}
