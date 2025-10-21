import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminActions } from '@/hooks/useAdminActions';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  nome: string | null;
  email: string | null;
}

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteUserDialog = ({ user, open, onOpenChange }: DeleteUserDialogProps) => {
  const { deleteUser } = useAdminActions();

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deleteUser.mutateAsync(user.id);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está prestes a excluir <strong>{user.nome || user.email}</strong> permanentemente.
            </p>
            <p className="text-destructive font-semibold">
              Esta ação não pode ser desfeita!
            </p>
            <p>
              Todos os dados associados a este usuário serão removidos do sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUser.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Excluir Permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
