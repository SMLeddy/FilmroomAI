import React from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from './Chart';
import { Badge } from './Badge';
import styles from './ThirdDownAnalysis.module.css';

interface ThirdDownAnalysisProps {
  data: {
    totalAttempts: number;
    conversions: number;
    successRate: number;
    topPlayCalls: { name: string; count: number }[];
  };
  className?: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: 'Play Count',
    color: 'var(--warning)',
  },
};

export const ThirdDownAnalysis = ({ data, className }: ThirdDownAnalysisProps) => {
  const chartData = data.topPlayCalls.map(item => ({ playCall: item.name, count: item.count }));

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>3rd Down Analysis</h3>
      <p className={styles.subtitle}>Conversion rates and play calls on the money down.</p>
      
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Success Rate</span>
          <span className={styles.statValue}>{(data.successRate * 100).toFixed(1)}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Conversions</span>
          <span className={styles.statValue}>{data.conversions} / {data.totalAttempts}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h4 className={styles.chartTitle}>Top 3rd Down Plays</h4>
        <div className={styles.chartWrapper}>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 5, right: 8, left: 12, bottom: 24 }}>
              <XAxis dataKey="playCall" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};