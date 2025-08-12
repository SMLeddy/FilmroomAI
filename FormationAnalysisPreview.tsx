import React from 'react';
import { FormationData } from '../helpers/formationUtils';
import styles from './FormationAnalysisPreview.module.css';

interface FormationAnalysisPreviewProps {
  data: FormationData[];
}

export const FormationAnalysisPreview = ({ data }: FormationAnalysisPreviewProps) => {
  // Process data to get top 3 formations
  const formationCounts = React.useMemo(() => {
    const counts = data.reduce((acc, item) => {
      acc[item.formation] = (acc[item.formation] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([formation, count]) => ({
        formation,
        count,
        percentage: (count / data.length * 100).toFixed(1)
      }));
  }, [data]);

  const totalPlays = data.reduce((sum, item) => sum + item.count, 0);

  if (formationCounts.length === 0) {
    return (
      <div className={styles.placeholder}>
        No formation data available
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <span className={styles.totalPlays}>{totalPlays} total plays</span>
        <span className={styles.formationsCount}>{formationCounts.length} formations tracked</span>
      </div>
      
      <div className={styles.topFormations}>
        {formationCounts.map(({ formation, count, percentage }) => (
          <div key={formation} className={styles.formationItem}>
            <div className={styles.formationInfo}>
              <span className={styles.formationName}>{formation}</span>
              <span className={styles.formationCount}>{count} plays</span>
            </div>
            <div className={styles.formationBar}>
              <div 
                className={styles.formationBarFill}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={styles.formationPercentage}>{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};