import { Board } from '@/hooks/useSupabaseBoards';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface BoardCardProps {
  board: Board;
  tasksCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const BoardCard = ({ board, tasksCount, onOpen, onEdit, onDelete }: BoardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden cursor-pointer border-2 hover:border-primary/50 transition-all bg-gradient-to-br from-card to-card/50 hover:shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        
        <CardContent className="p-6" onClick={onOpen}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
              {board.icone}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {board.titulo}
          </h3>
          
          {board.descricao && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {board.descricao}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <span className="font-semibold">{tasksCount}</span>
              <span className="text-xs">metas ativas</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
