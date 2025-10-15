import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Board } from '@/hooks/useSupabaseBoards';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const EMOJI_OPTIONS = [
  { emoji: '📋', label: 'Planejamento' },
  { emoji: '💼', label: 'Trabalho' },
  { emoji: '💰', label: 'Finanças' },
  { emoji: '🎯', label: 'Metas' },
  { emoji: '💪', label: 'Fitness' },
  { emoji: '📚', label: 'Estudos' },
  { emoji: '🏠', label: 'Casa' },
  { emoji: '✈️', label: 'Viagens' },
  { emoji: '🎨', label: 'Criativo' },
  { emoji: '⚡', label: 'Produtividade' },
  { emoji: '🧠', label: 'Aprendizado' },
  { emoji: '💬', label: 'Relacionamentos' },
  { emoji: '🍎', label: 'Saúde' },
  { emoji: '🎮', label: 'Hobbies' },
  { emoji: '🌱', label: 'Crescimento' },
  { emoji: '🔥', label: 'Urgente' },
  { emoji: '❤️', label: 'Pessoal' },
  { emoji: '🚀', label: 'Projetos' },
  { emoji: '🎵', label: 'Música' },
  { emoji: '📱', label: 'Tech' },
];

interface EnhancedBoardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (board: Partial<Board>) => void;
  board?: Board | null;
}

export const EnhancedBoardModal = ({ open, onClose, onSave, board }: EnhancedBoardModalProps) => {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-4xl">{icone}</span>
            {board ? 'Editar Quadro' : 'Novo Quadro'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="titulo" className="text-base">Título do Quadro *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Metas Pessoais, Projetos 2025, Fitness..."
              className="mt-2 h-12 text-base"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {titulo.length}/50 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="descricao" className="text-base">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Adicione uma descrição para este quadro (opcional)"
              className="mt-2 min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {descricao.length}/200 caracteres
            </p>
          </div>

          <div>
            <Label className="text-base mb-3 block">Escolha um Ícone</Label>
            <TooltipProvider>
              <div className="grid grid-cols-10 gap-2">
                {EMOJI_OPTIONS.map(({ emoji, label }) => (
                  <Tooltip key={emoji}>
                    <TooltipTrigger asChild>
                      <motion.button
                        type="button"
                        onClick={() => setIcone(emoji)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 text-3xl rounded-xl border-2 transition-all ${
                          icone === emoji
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="h-11">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!titulo.trim()}
            className="h-11 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {board ? '✓ Salvar Alterações' : '+ Criar Quadro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
