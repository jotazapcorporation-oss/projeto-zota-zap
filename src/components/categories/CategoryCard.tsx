import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  nome: string;
  tipo: string;
  color: string;
  icon: string;
  description?: string;
  tags?: string;
}

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

const TYPE_CONFIGS = {
  receita: { 
    label: 'Receita', 
    defaultColor: '#10B981', 
    bgGradient: 'from-green-500/10 to-green-500/5',
    borderColor: 'border-green-500/30'
  },
  despesa: { 
    label: 'Despesa', 
    defaultColor: '#EF4444',
    bgGradient: 'from-red-500/10 to-red-500/5',
    borderColor: 'border-red-500/30'
  },
  investimento: { 
    label: 'Investimento', 
    defaultColor: '#3B82F6',
    bgGradient: 'from-blue-500/10 to-blue-500/5',
    borderColor: 'border-blue-500/30'
  },
};

export const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = TYPE_CONFIGS[category.tipo as keyof typeof TYPE_CONFIGS] || TYPE_CONFIGS.despesa;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1
      }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <Card 
        className={`group overflow-hidden transition-all hover:shadow-lg bg-gradient-to-br ${typeConfig.bgGradient} border-2 ${typeConfig.borderColor} ${isDragging && 'ring-2 ring-primary shadow-2xl'}`}
      >
        {/* Color Strip */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: category.color }}
        />

        <CardContent className="p-4 pl-5">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Icon */}
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                  {category.nome}
                </h3>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: category.color,
                    color: category.color
                  }}
                >
                  {typeConfig.label}
                </Badge>
              </div>
              
              {category.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              )}
              
              {category.tags && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tags: {category.tags}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
