import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from './Chart';
import styles from './EnhancedFormationAnalysis.module.css';

interface EnhancedFormationAnalysisProps {
  data: {
    name: string;
    down: string;
    count: number;
  }[];
  title: string;
  subtitle: string;
  dataKey: string;
  className?: string;
}

const chartConfig: ChartConfig = {
  '1st': { label: '1st Down', color: 'var(--chart-color-1)' },
  '2nd': { label: '2nd Down', color: 'var(--chart-color-2)' },
  '3rd': { label: '3rd Down', color: 'var(--chart-color-3)' },
  '4th': { label: '4th Down', color: 'var(--chart-color-4)' },
};

export const EnhancedFormationAnalysis = ({ data, title, subtitle, dataKey, className }: EnhancedFormationAnalysisProps) => {
  const processedData = React.useMemo(() => {
    const dataMap = new Map<string, Record<string, string | number> & { '1st'?: number; '2nd'?: number; '3rd'?: number; '4th'?: number }>();
    data.forEach(({ name, down, count }) => {
      if (!dataMap.has(name)) {
        dataMap.set(name, { [dataKey]: name });
      }
      const entry = dataMap.get(name)!;
      if (down === '1st' || down === '2nd' || down === '3rd' || down === '4th') {
        entry[down] = (entry[down] || 0) + count;
      }
    });
    return Array.from(dataMap.values());
  }, [data, dataKey]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
          <BarChart data={processedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
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