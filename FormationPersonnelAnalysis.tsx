import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from './Chart';
import { getPersonnelGroupings, ProcessedFormationData } from '../helpers/formationUtils';
import styles from './FormationPersonnelAnalysis.module.css';

interface FormationPersonnelAnalysisProps {
  data: ProcessedFormationData[];
  className?: string;
}

const chartConfig: ChartConfig = {
  totalPlays: { label: 'Total Plays', color: 'var(--chart-color-1)' },
  successRate: { label: 'Success Rate (%)', color: 'var(--chart-color-2)' },
  avgYardsGained: { label: 'Avg Yards', color: 'var(--chart-color-3)' },
};

export const FormationPersonnelAnalysis = ({ data, className }: FormationPersonnelAnalysisProps) => {
  const personnelData = React.useMemo(() => {
    const groupings = getPersonnelGroupings(data);
    return groupings.map(group => ({
      personnel: group.personnel,
      totalPlays: group.totalPlays,
      successRate: Math.round(group.successRate * 100),
      avgYardsGained: Math.round(group.avgYardsGained * 10) / 10,
      formations: group.formations.join(', '),
    }));
  }, [data]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h4 className={styles.title}>Personnel Groupings Analysis</h4>
      <p className={styles.subtitle}>Formation usage categorized by personnel packages</p>
      
      <div className={styles.personnelGrid}>
        {personnelData.map(group => (
          <div key={group.personnel} className={styles.personnelCard}>
            <h5 className={styles.personnelName}>{group.personnel}</h5>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Total Plays:</span>
              <span className={styles.metricValue}>{group.totalPlays}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Success Rate:</span>
              <span className={styles.metricValue}>{group.successRate}%</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.metricLabel}>Avg Yards:</span>
              <span className={styles.metricValue}>{group.avgYardsGained}</span>
            </div>
            <div className={styles.formationsUsed}>
              <span className={styles.formationsLabel}>Formations:</span>
              <span className={styles.formationsText}>{group.formations}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig}>
          <BarChart data={personnelData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="personnel" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="totalPlays" fill="var(--color-totalPlays)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};