import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from './Chart';
import styles from './CoverageAnalysis.module.css';

interface CoverageAnalysisProps {
  data: {
    name: string;
    count: number;
  }[];
  className?: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: 'Play Count',
    color: 'var(--chart-color-1)',
  },
};

export const CoverageAnalysis = ({ data, className }: CoverageAnalysisProps) => {
  const chartData = data.map(item => ({ coverage: item.name, count: item.count }));

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>Coverage Tendencies</h3>
      <p className={styles.subtitle}>Most frequent coverage schemes.</p>
      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="coverage"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              width={120}
            />
            <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};