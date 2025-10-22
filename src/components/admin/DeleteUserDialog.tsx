import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!user || confirmText !== 'EXCLUIR') return;
    
    try {
      await deleteUser.mutateAsync(user.id);
      onOpenChange(false);
      setConfirmText('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  if (!user) return null;

  const isConfirmValid = confirmText === 'EXCLUIR';

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Confirmar Exclusão Permanente</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-2">
                Você está prestes a excluir <strong>{user.nome || user.email}</strong> permanentemente.
              </p>
              <p className="text-destructive font-semibold text-base">
                Esta ação é IRREVERSÍVEL e não pode ser desfeita!
              </p>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold mb-2">Todos os dados seguintes serão permanentemente excluídos:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Conta de autenticação (auth.users)</li>
                <li>Perfil e configurações</li>
                <li>Todas as transações financeiras</li>
                <li>Categorias personalizadas</li>
                <li>Boards, listas e cards do Kanban</li>
                <li>Comentários e anexos</li>
                <li>Caixinhas de poupança</li>
                <li>Tarefas e lembretes</li>
                <li>Eventos da agenda</li>
                <li>Histórico de atividades</li>
                <li>Planos familiares (se for master)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground font-semibold">
                Digite <span className="text-destructive">EXCLUIR</span> para confirmar:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
                className="font-mono"
                disabled={deleteUser.isPending}
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUser.isPending || !isConfirmValid}
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
