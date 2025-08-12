import React from 'react';
import styles from './ThirdDownAnalysisPreview.module.css';

interface ThirdDownAnalysisPreviewProps {
  data: {
    totalAttempts: number;
    conversions: number;
    successRate: number;
    topPlayCalls: { name: string; count: number }[];
  };
}

export const ThirdDownAnalysisPreview = ({ data }: ThirdDownAnalysisPreviewProps) => {
  const topPlay = data.topPlayCalls[0];

  return (
    <div className={styles.container}>
      <div className={styles.mainStat}>
        <span className={styles.successRate}>{(data.successRate * 100).toFixed(1)}%</span>
        <span className={styles.successRateLabel}>Success Rate</span>
      </div>
      
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{data.conversions}</span>
          <span className={styles.statLabel}>Conversions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{data.totalAttempts}</span>
          <span className={styles.statLabel}>Attempts</span>
        </div>
      </div>

      {topPlay && (
        <div className={styles.topPlay}>
          <span className={styles.topPlayLabel}>Most used:</span>
          <span className={styles.topPlayName}>{topPlay.name}</span>
          <span className={styles.topPlayCount}>({topPlay.count} times)</span>
        </div>
      )}
    </div>
  );
};