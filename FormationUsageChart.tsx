import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from './Chart';
import styles from './FormationUsageChart.module.css';

interface FormationUsageChartProps {
  data: {
    formation: string;
    down: string;
    count: number;
  }[];
  className?: string;
}

const chartConfig: ChartConfig = {
  '1st': { label: '1st Down', color: 'var(--chart-color-1)' },
  '2nd': { label: '2nd Down', color: 'var(--chart-color-2)' },
  '3rd': { label: '3rd Down', color: 'var(--chart-color-3)' },
  '4th': { label: '4th Down', color: 'var(--chart-color-4)' },
};

export const FormationUsageChart = ({ data, className }: FormationUsageChartProps) => {
  const processedData = React.useMemo(() => {
    const formationMap = new Map<string, { formation: string; '1st'?: number; '2nd'?: number; '3rd'?: number; '4th'?: number }>();
    data.forEach(({ formation, down, count }) => {
      if (!formationMap.has(formation)) {
        formationMap.set(formation, { formation });
      }
      const entry = formationMap.get(formation)!;
      if (down === '1st' || down === '2nd' || down === '3rd' || down === '4th') {
        entry[down] = (entry[down] || 0) + count;
      }
    });
    return Array.from(formationMap.values());
  }, [data]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h4 className={styles.title}>Formation Usage by Down</h4>
      <p className={styles.subtitle}>Frequency of formations across different downs</p>
      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
          <BarChart data={processedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="formation" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Bar dataKey="1st" fill="var(--color-1st)" stackId="a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2nd" fill="var(--color-2nd)" stackId="a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="3rd" fill="var(--color-3rd)" stackId="a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="4th" fill="var(--color-4th)" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};