import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Power, Trash2, User, MessageCircle } from 'lucide-react';
import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  currentPage: number;
  pageSize: number;
}

export const UserTable = ({ users, isLoading, onEdit, onDelete, currentPage, pageSize }: UserTableProps) => {
  const { toggleUserActive } = useAdminActions();
  const { toast } = useToast();
  const [validatingWhatsapp, setValidatingWhatsapp] = useState<string | null>(null);
  const offset = (currentPage - 1) * pageSize;

  const handleToggleActive = (user: User) => {
    toggleUserActive.mutate({
      id: user.id,
      active: !user.ativo,
    });
  };

  const handleValidateWhatsapp = async (user: User) => {
    if (!user.phone) {
      toast({
        title: "Erro",
        description: "Usuário não possui telefone cadastrado",
        variant: "destructive",
      });
      return;
    }

    setValidatingWhatsapp(user.id);

    try {
      const response = await fetch('https://webhook.jzap.net/webhook/validaUserWhatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: user.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.existe) {
          toast({
            title: "WhatsApp Encontrado",
            description: `O número ${user.phone} está cadastrado no WhatsApp`,
          });
        } else {
          toast({
            title: "WhatsApp Não Encontrado",
            description: `O número ${user.phone} não está cadastrado no WhatsApp`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error('Erro na requisição');
      }
    } catch (error) {
      console.error('Erro ao validar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Não foi possível validar o WhatsApp. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setValidatingWhatsapp(null);
    }
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
          <TableHead className="w-20">Identificador</TableHead>
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
        {users.map((user, index) => (
          <TableRow key={user.id}>
            <TableCell className="font-mono text-muted-foreground">
              {offset + index + 1}
            </TableCell>
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
                  onClick={() => handleValidateWhatsapp(user)}
                  disabled={!user.phone || validatingWhatsapp === user.id}
                  title="Validar WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </Button>
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
