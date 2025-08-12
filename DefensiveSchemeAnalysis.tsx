import React from 'react';
import { useDefensiveAnalytics } from '../helpers/useDefensiveAnalytics';
import { Skeleton } from './Skeleton';
import { EnhancedFormationAnalysis } from './EnhancedFormationAnalysis';
import { CoverageAnalysis } from './CoverageAnalysis';
import { BlitzAnalysis } from './BlitzAnalysis';
import styles from './DefensiveSchemeAnalysis.module.css';

interface DefensiveSchemeAnalysisProps {
  filmId?: number;
  opponent?: string;
  className?: string;
}

export const DefensiveSchemeAnalysis = ({ filmId, opponent, className }: DefensiveSchemeAnalysisProps) => {
  const { data: analytics, isFetching, error } = useDefensiveAnalytics({ filmId, opponent });

  if (isFetching) {
    return <DefensiveSchemeAnalysisSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading defensive analytics: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  }

  if (!analytics) {
    return <div className={styles.placeholder}>No defensive analytics data available for this game.</div>;
  }

  const {
    defensiveFrontUsage,
    coverageTendencies,
    blitzPatterns,
    personnelPackages,
  } = analytics;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h2 className={styles.sectionTitle}>Defensive Scheme Analysis</h2>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.frontUsageCard}`}>
          <EnhancedFormationAnalysis 
            data={defensiveFrontUsage} 
            title="Defensive Front Usage"
            subtitle="Frequency of defensive fronts broken down by down and distance"
            dataKey="name"
          />
        </div>
        <div className={`${styles.card} ${styles.personnelCard}`}>
          <EnhancedFormationAnalysis 
            data={personnelPackages} 
            title="Personnel Packages"
            subtitle="Defensive personnel groupings by situational usage"
            dataKey="name"
          />
        </div>
        <div className={`${styles.card} ${styles.coverageCard}`}>
          <CoverageAnalysis data={coverageTendencies} />
        </div>
        <div className={`${styles.card} ${styles.blitzCard}`}>
          <BlitzAnalysis data={blitzPatterns} />
        </div>
      </div>
    </div>
  );
};

const DefensiveSchemeAnalysisSkeleton = () => (
  <div className={styles.container}>
    <h2 className={styles.sectionTitle}>Defensive Scheme Analysis</h2>
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.frontUsageCard}`}><Skeleton style={{ height: '100%' }} /></div>
      <div className={`${styles.card} ${styles.personnelCard}`}><Skeleton style={{ height: '100%' }} /></div>
      <div className={`${styles.card} ${styles.coverageCard}`}><Skeleton style={{ height: '100%' }} /></div>
      <div className={`${styles.card} ${styles.blitzCard}`}><Skeleton style={{ height: '100%' }} /></div>
    </div>
  </div>
);