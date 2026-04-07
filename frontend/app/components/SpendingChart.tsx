import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface SpendingData {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: SpendingData[];
  chartType?: 'pie' | 'bar';
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export function SpendingChart({
  data,
  chartType = 'pie',
}: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No spending data yet</p>
          <p className="text-sm text-gray-400">
            Add transactions to see your spending breakdown
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    displayColor: item.color || COLORS[index % COLORS.length],
  }));

  if (chartType === 'bar') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.displayColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending Distribution
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.displayColor} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
