import { Heart, BookOpen, TrendingUp, Users } from "lucide-react";

export interface CaixinhaTemplate {
  nome: string;
  icon: string;
  color: string;
  valorMetaSugerido: number;
}

export const DEFAULT_TEMPLATES: CaixinhaTemplate[] = [
  {
    nome: "Saúde",
    icon: "heart",
    color: "#ef4444",
    valorMetaSugerido: 5000,
  },
  {
    nome: "Educação Financeira",
    icon: "book-open",
    color: "#8b5cf6",
    valorMetaSugerido: 3000,
  },
  {
    nome: "Patrimônio",
    icon: "trending-up",
    color: "#10b981",
    valorMetaSugerido: 10000,
  },
  {
    nome: "Relacionamento",
    icon: "users",
    color: "#ec4899",
    valorMetaSugerido: 2000,
  },
];

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "heart":
      return Heart;
    case "book-open":
      return BookOpen;
    case "trending-up":
      return TrendingUp;
    case "users":
      return Users;
    default:
      return Heart;
  }
};
