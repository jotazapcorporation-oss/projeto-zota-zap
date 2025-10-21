import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Power, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable = ({ users, isLoading, onEdit, onDelete }: UserTableProps) => {
  const { toggleUserActive } = useAdminActions();

  const handleToggleActive = (user: User) => {
    toggleUserActive.mutate({
      id: user.id,
      active: !user.ativo,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Nenhum usuário encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Comece criando um novo usuário
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cadastro</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.nome?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.nome || 'Sem nome'}</span>
              </div>
            </TableCell>
            <TableCell>{user.email || '-'}</TableCell>
            <TableCell>{user.phone || '-'}</TableCell>
            <TableCell>
              {user.admin ? (
                <Badge variant="default">Admin</Badge>
              ) : (
                <Badge variant="secondary">Usuário</Badge>
              )}
            </TableCell>
            <TableCell>
              {user.ativo ? (
                <Badge variant="default" className="bg-green-500">Ativo</Badge>
              ) : (
                <Badge variant="destructive">Inativo</Badge>
              )}
            </TableCell>
            <TableCell>
              {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user)}
                  title="Editar usuário"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(user)}
                  title={user.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user)}
                  title="Excluir usuário"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
