
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import { formatCurrency } from '@/utils/currency'

interface ChartData {
  name: string
  value: number
  color: string
}

interface CategoryData {
  [key: string]: {
    receitas: number
    despesas: number
    total: number
  }
}

interface ReportChartProps {
  chartData: ChartData[]
  categoryData: CategoryData
}

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "#22c55e",
  },
  despesas: {
    label: "Despesas", 
    color: "#ef4444",
  },
}

export function ReportChart({ chartData, categoryData }: ReportChartProps) {
  // Prepare category chart data
  const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
    category: name,
    receitas: data.receitas,
    despesas: data.despesas,
  }))

  // Prepare data for pie charts
  const receitasPieData = Object.entries(categoryData)
    .filter(([_, data]) => data.receitas > 0)
    .map(([name, data], index) => ({
      name,
      value: data.receitas,
      color: `hsl(${120 + index * 40}, 70%, 50%)`, // Green shades
    }))

  const despesasPieData = Object.entries(categoryData)
    .filter(([_, data]) => data.despesas > 0)
    .map(([name, data], index) => ({
      name,
      value: data.despesas,
      color: `hsl(${0 + index * 30}, 70%, 50%)`, // Red shades
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Existing Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receitas" fill="#22c55e" />
                  <Bar dataKey="despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* New Pie Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Receitas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Distribuição de Receitas por Categoria</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize de onde vem suas receitas
            </p>
          </CardHeader>
          <CardContent>
            {receitasPieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={receitasPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receitasPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Sem receitas no período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Distribuição de Despesas por Categoria</CardTitle>
            <p className="text-sm text-muted-foreground">
              Veja onde você está gastando mais
            </p>
          </CardHeader>
          <CardContent>
            {despesasPieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={despesasPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {despesasPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Sem despesas no período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
