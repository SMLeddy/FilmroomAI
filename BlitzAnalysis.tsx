import React from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from './Chart';
import styles from './BlitzAnalysis.module.css';

interface BlitzAnalysisProps {
  data: {
    totalPlays: number;
    blitzRate: number;
    topBlitzTypes: { name: string; count: number }[];
  };
  className?: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: 'Blitz Count',
    color: 'var(--error)',
  },
};

export const BlitzAnalysis = ({ data, className }: BlitzAnalysisProps) => {
  const chartData = data.topBlitzTypes.map(item => ({ blitzType: item.name, count: item.count }));

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>Blitz Analysis</h3>
      <p className={styles.subtitle}>Pressure rates and preferred blitz packages.</p>
      
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Blitz Rate</span>
          <span className={styles.statValue}>{(data.blitzRate * 100).toFixed(1)}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Plays</span>
          <span className={styles.statValue}>{data.totalPlays}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h4 className={styles.chartTitle}>Top Blitz Types</h4>
        <div className={styles.chartWrapper}>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 5, right: 8, left: 12, bottom: 24 }}>
              <XAxis dataKey="blitzType" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};