import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface Category {
  id?: string;
  nome: string;
  tipo: string;
  color: string;
  icon: string;
  description?: string;
  tags?: string;
}

interface EnhancedCategoryFormProps {
  category?: Category | null;
  onSave: (category: Omit<Category, 'id'>) => void;
  onClose: () => void;
}

const CATEGORY_ICONS = [
  // Receitas
  { emoji: '💰', label: 'Dinheiro', types: ['receita'] },
  { emoji: '💵', label: 'Dólar', types: ['receita'] },
  { emoji: '💳', label: 'Cartão', types: ['receita', 'despesa'] },
  { emoji: '🏦', label: 'Banco', types: ['receita', 'investimento'] },
  { emoji: '📈', label: 'Crescimento', types: ['receita', 'investimento'] },
  { emoji: '🎁', label: 'Presente', types: ['receita'] },
  { emoji: '💼', label: 'Trabalho', types: ['receita'] },
  { emoji: '🏆', label: 'Prêmio', types: ['receita'] },
  
  // Despesas
  { emoji: '🛒', label: 'Compras', types: ['despesa'] },
  { emoji: '🍔', label: 'Alimentação', types: ['despesa', 'custo'] },
  { emoji: '🏠', label: 'Casa', types: ['despesa', 'custo'] },
  { emoji: '🚗', label: 'Transporte', types: ['despesa', 'custo'] },
  { emoji: '⚡', label: 'Energia', types: ['despesa', 'custo'] },
  { emoji: '💊', label: 'Saúde', types: ['despesa', 'custo'] },
  { emoji: '📚', label: 'Educação', types: ['despesa', 'investimento'] },
  { emoji: '🎮', label: 'Lazer', types: ['despesa'] },
  { emoji: '👕', label: 'Vestuário', types: ['despesa'] },
  { emoji: '📱', label: 'Telefone', types: ['despesa', 'custo'] },
  { emoji: '🎵', label: 'Entretenimento', types: ['despesa'] },
  { emoji: '✈️', label: 'Viagem', types: ['despesa'] },
  
  // Investimentos
  { emoji: '📊', label: 'Ações', types: ['investimento'] },
  { emoji: '🏢', label: 'Imóveis', types: ['investimento'] },
  { emoji: '💎', label: 'Premium', types: ['investimento'] },
  { emoji: '🌱', label: 'Crescimento', types: ['investimento'] },
  
  // Geral
  { emoji: '📁', label: 'Pasta', types: ['receita', 'despesa', 'custo', 'investimento'] },
  { emoji: '🎯', label: 'Meta', types: ['receita', 'despesa', 'custo', 'investimento'] },
  { emoji: '⚙️', label: 'Configuração', types: ['custo'] },
  { emoji: '🔧', label: 'Manutenção', types: ['despesa', 'custo'] },
  { emoji: '🎨', label: 'Criativo', types: ['despesa', 'investimento'] },
];

const TYPE_COLORS = {
  receita: '#10B981',
  despesa: '#EF4444',
  custo: '#F59E0B',
  investimento: '#3B82F6',
};

const PRESET_COLORS = [
  '#10B981', '#EF4444', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];

export const EnhancedCategoryForm = ({ category, onSave, onClose }: EnhancedCategoryFormProps) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [color, setColor] = useState(TYPE_COLORS.despesa);
  const [icon, setIcon] = useState('📁');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (category) {
      setNome(category.nome);
      setTipo(category.tipo);
      setColor(category.color);
      setIcon(category.icon);
      setDescription(category.description || '');
      setTags(category.tags || '');
    } else {
      resetForm();
    }
  }, [category]);

  const resetForm = () => {
    setNome('');
    setTipo('despesa');
    setColor(TYPE_COLORS.despesa);
    setIcon('📁');
    setDescription('');
    setTags('');
  };

  const handleTipoChange = (newTipo: string) => {
    setTipo(newTipo);
    setColor(TYPE_COLORS[newTipo as keyof typeof TYPE_COLORS]);
  };

  const handleSave = () => {
    if (!nome.trim()) return;

    onSave({
      nome: nome.trim(),
      tipo,
      color,
      icon,
      description: description.trim() || undefined,
      tags: tags.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  const filteredIcons = CATEGORY_ICONS.filter(item => 
    item.types.includes(tipo)
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome */}
          <div>
            <Label htmlFor="nome" className="text-base">Nome da Categoria *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Salário, Aluguel, Supermercado..."
              className="mt-2 h-12 text-base"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {nome.length}/50 caracteres
            </p>
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="tipo" className="text-base">Tipo de Transação *</Label>
            <Select value={tipo} onValueChange={handleTipoChange}>
              <SelectTrigger className="mt-2 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">💚 Receita</SelectItem>
                <SelectItem value="despesa">❤️ Despesa</SelectItem>
                <SelectItem value="custo">🟠 Custo</SelectItem>
                <SelectItem value="investimento">💙 Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ícone */}
          <div>
            <Label className="text-base mb-3 block">Escolha um Ícone</Label>
            <TooltipProvider>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                {filteredIcons.map(({ emoji, label }) => (
                  <Tooltip key={emoji}>
                    <TooltipTrigger asChild>
                      <motion.button
                        type="button"
                        onClick={() => setIcon(emoji)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 text-3xl rounded-xl border-2 transition-all ${
                          icon === emoji
                            ? 'border-primary bg-primary/10 shadow-lg'
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

          {/* Cor */}
          <div>
            <Label className="text-base mb-3 block">Cor de Identificação</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    color === presetColor
                      ? 'border-primary scale-110 ring-2 ring-primary/20'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Label htmlFor="customColor" className="text-sm">Cor Personalizada:</Label>
              <input
                id="customColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-base">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para esta categoria"
              className="mt-2 min-h-[60px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/200 caracteres
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-base">Tags (Opcional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: mensal, fixo, essencial..."
              className="mt-2"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separe com vírgulas
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="h-11">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!nome.trim()}
            className="h-11 gap-2 bg-gradient-to-r from-primary to-purple-600"
            style={{ 
              background: `linear-gradient(to right, ${color}, ${color}dd)` 
            }}
          >
            {category ? '✓ Salvar Alterações' : '+ Criar Categoria'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
