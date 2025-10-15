export interface TutorialStep {
  icon: string;
  text: string;
}

export interface TutorialContent {
  title: string;
  description: string;
  steps: TutorialStep[];
  tips?: string[];
}

export const tutorialContents: Record<string, TutorialContent> = {
  dashboard: {
    title: "🧭 Como usar o Dashboard",
    description: "Veja aqui uma visão geral das suas finanças, metas e alertas do mês.",
    steps: [
      { icon: "💰", text: "Acompanhe o saldo total do período" },
      { icon: "🎯", text: "Veja suas metas financeiras e status de progresso" },
      { icon: "📊", text: "Clique em 'Ver detalhes' para abrir gráficos interativos" },
      { icon: "🔍", text: "Use os filtros para mudar o período de visualização" },
    ],
    tips: ["Acesse diariamente para manter controle", "Configure alertas personalizados"],
  },
  
  transacoes: {
    title: "💰 Como usar Transações",
    description: "Registre todas as suas receitas e despesas para controle financeiro completo.",
    steps: [
      { icon: "➕", text: "Clique em '+ Nova Transação' para adicionar" },
      { icon: "📝", text: "Escolha entre Receita (entrada) ou Despesa (saída)" },
      { icon: "🗂️", text: "Selecione ou crie categorias para organizar" },
      { icon: "📅", text: "Defina a data e adicione descrição detalhada" },
      { icon: "✏️", text: "Edite ou exclua transações clicando no item" },
    ],
    tips: ["Registre imediatamente após cada gasto", "Use categorias consistentes"],
  },

  categorias: {
    title: "🗂️ Como usar Categorias",
    description: "Organize suas transações com categorias personalizadas.",
    steps: [
      { icon: "🆕", text: "Crie categorias customizadas (ex: Alimentação, Transporte)" },
      { icon: "🎨", text: "Escolha ícones e cores para identificação visual" },
      { icon: "📊", text: "Associe transações às categorias corretas" },
      { icon: "📈", text: "Veja relatórios agrupados por categoria" },
    ],
    tips: ["Quanto melhor categorizado, melhor o relatório", "Evite criar categorias demais"],
  },

  relatorios: {
    title: "📊 Como usar Relatórios",
    description: "Gere análises detalhadas e visualize suas finanças em gráficos.",
    steps: [
      { icon: "📅", text: "Selecione o período que deseja analisar" },
      { icon: "📈", text: "Visualize gráficos de receitas vs despesas" },
      { icon: "🎯", text: "Identifique categorias com maior gasto" },
      { icon: "📄", text: "Exporte relatórios em PDF ou Excel" },
      { icon: "🔄", text: "Compare períodos diferentes para análise" },
    ],
    tips: ["Analise mensalmente para ajustes", "Use filtros para análises específicas"],
  },

  termometro: {
    title: "🌡️ Como usar o Termômetro Financeiro",
    description: "Avalie a saúde das suas finanças de forma visual e intuitiva.",
    steps: [
      { icon: "🟢", text: "Verde = Financeiramente saudável e equilibrado" },
      { icon: "🟡", text: "Amarelo = Atenção, próximo ao limite" },
      { icon: "🔴", text: "Vermelho = Alerta, gastos acima das receitas" },
      { icon: "📊", text: "Veja o percentual de gastos por categoria" },
      { icon: "💡", text: "Siga as dicas para melhorar seu score" },
    ],
    tips: ["Reduza gastos fixos para melhorar", "Aumente fontes de receita"],
  },

  agenda: {
    title: "🗓️ Como usar a Agenda",
    description: "Organize compromissos, lembretes e tarefas em um só lugar.",
    steps: [
      { icon: "➕", text: "Adicione eventos clicando em uma data" },
      { icon: "⏰", text: "Configure lembretes com data e hora" },
      { icon: "✅", text: "Marque tarefas como concluídas" },
      { icon: "📅", text: "Alterne entre visualizações (dia, semana, mês, ano)" },
      { icon: "🔔", text: "Receba notificações de compromissos próximos" },
    ],
    tips: ["Sincronize com notificações", "Revise semanalmente seus compromissos"],
  },

  caixinhas: {
    title: "💼 Como usar Caixinhas",
    description: "Crie metas de poupança para objetivos específicos.",
    steps: [
      { icon: "🎯", text: "Defina uma meta (ex: Viagem, Reserva de Emergência)" },
      { icon: "💰", text: "Estabeleça o valor total a ser guardado" },
      { icon: "📅", text: "Defina um prazo para alcançar a meta" },
      { icon: "➕", text: "Deposite valores sempre que possível" },
      { icon: "📊", text: "Acompanhe o progresso visual da meta" },
    ],
    tips: ["Use para objetivos específicos", "Deposite regularmente"],
  },

  metas: {
    title: "🎯 Como usar Quadros (Metas)",
    description: "Organize projetos e tarefas visualmente estilo Kanban.",
    steps: [
      { icon: "📋", text: "Crie quadros para diferentes áreas (Trabalho, Pessoal, etc)" },
      { icon: "📝", text: "Adicione listas dentro de cada quadro (A Fazer, Fazendo, Feito)" },
      { icon: "🎴", text: "Crie cards com tarefas e arraste entre listas" },
      { icon: "🏷️", text: "Use etiquetas coloridas para organização" },
      { icon: "✅", text: "Adicione checklists e datas de vencimento" },
    ],
    tips: ["Arraste cards entre listas conforme progride", "Use etiquetas para prioridades"],
  },
};
