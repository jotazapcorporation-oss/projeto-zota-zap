import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Board } from '@/hooks/useSupabaseBoards';

const EMOJI_OPTIONS = ['📋', '💼', '💰', '🎯', '💪', '📚', '🏠', '✈️', '🎨', '⚡'];

interface BoardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (board: Partial<Board>) => void;
  board?: Board | null;
}

export const BoardModal = ({ open, onClose, onSave, board }: BoardModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [icone, setIcone] = useState('📋');

  useEffect(() => {
    if (board) {
      setTitulo(board.titulo);
      setDescricao(board.descricao || '');
      setIcone(board.icone);
    } else {
      resetForm();
    }
  }, [board, open]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setIcone('📋');
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const boardData: Partial<Board> = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      icone,
      display_order: board?.display_order || 0,
    };

    onSave(boardData);
    onClose();
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{board ? 'Editar Quadro' : 'Novo Quadro'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título do Quadro *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Metas Pessoais"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Adicione uma descrição (opcional)"
              className="mt-1 min-h-[60px]"
            />
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcone(emoji)}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                    icone === emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!titulo.trim()}>
            {board ? 'Salvar' : 'Criar Quadro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
