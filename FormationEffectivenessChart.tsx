import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Line, LineChart, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from './Chart';
import { ProcessedFormationData } from '../helpers/formationUtils';
import styles from './FormationEffectivenessChart.module.css';

interface FormationEffectivenessChartProps {
  data: ProcessedFormationData[];
  className?: string;
}

const chartConfig: ChartConfig = {
  totalPlays: { label: 'Total Plays', color: 'var(--chart-color-1)' },
  successRate: { label: 'Success Rate (%)', color: 'var(--chart-color-2)' },
  avgYardsGained: { label: 'Avg Yards', color: 'var(--chart-color-3)' },
  touchdownRate: { label: 'TD Rate (%)', color: 'var(--chart-color-4)' },
};

export const FormationEffectivenessChart = ({ data, className }: FormationEffectivenessChartProps) => {
  const chartData = React.useMemo(() => {
    return data.slice(0, 8).map(formation => ({
      formation: formation.formation,
      totalPlays: formation.totalPlays,
      successRate: Math.round(formation.successRate * 100),
      avgYardsGained: Math.round(formation.avgYardsGained * 10) / 10,
      touchdownRate: Math.round(formation.touchdownRate * 100),
    }));
  }, [data]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h4 className={styles.title}>Formation Effectiveness</h4>
      <p className={styles.subtitle}>Success rates and average production by formation</p>
      
      <div className={styles.metricsGrid}>
        {data.slice(0, 6).map(formation => (
          <div key={formation.formation} className={styles.metricCard}>
            <h5 className={styles.formationName}>{formation.formation}</h5>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Plays:</span>
              <span className={styles.metricValue}>{formation.totalPlays}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Success Rate:</span>
              <span className={styles.metricValue}>{Math.round(formation.successRate * 100)}%</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Avg Yards:</span>
              <span className={styles.metricValue}>{formation.avgYardsGained.toFixed(1)}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>TD Rate:</span>
              <span className={styles.metricValue}>{Math.round(formation.touchdownRate * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="formation" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Bar dataKey="totalPlays" fill="var(--color-totalPlays)" />
            <Line type="monotone" dataKey="successRate" stroke="var(--color-successRate)" strokeWidth={3} dot={{ fill: 'var(--color-successRate)' }} />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
};