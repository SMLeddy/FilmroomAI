import React from 'react';
import { useDefensiveAnalytics } from '../helpers/useDefensiveAnalytics';
import { Skeleton } from './Skeleton';
import styles from './DefensiveAnalysisPreview.module.css';

interface DefensiveAnalysisPreviewProps {
  filmId?: number;
  opponent?: string;
}

export const DefensiveAnalysisPreview = ({ filmId, opponent }: DefensiveAnalysisPreviewProps) => {
  const { data: analytics, isFetching } = useDefensiveAnalytics({ filmId, opponent });

  if (isFetching) {
    return <Skeleton style={{ height: '120px' }} />;
  }

  if (!analytics) {
    return (
      <div className={styles.placeholder}>
        No defensive data available
      </div>
    );
  }

  const topFront = analytics.defensiveFrontUsage[0];
  const topCoverage = analytics.coverageTendencies[0];
  const blitzRate = analytics.blitzPatterns.blitzRate;

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{(blitzRate * 100).toFixed(1)}%</span>
          <span className={styles.statLabel}>Blitz Rate</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{analytics.defensiveFrontUsage.length}</span>
          <span className={styles.statLabel}>Fronts Used</span>
        </div>
      </div>

      <div className={styles.schemes}>
        {topFront && (
          <div className={styles.scheme}>
            <span className={styles.schemeLabel}>Top Front:</span>
            <span className={styles.schemeName}>{topFront.name}</span>
          </div>
        )}
        {topCoverage && (
          <div className={styles.scheme}>
            <span className={styles.schemeLabel}>Top Coverage:</span>
            <span className={styles.schemeName}>{topCoverage.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};