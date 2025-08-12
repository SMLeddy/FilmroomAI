import React from 'react';
import { FormationUsageChart } from './FormationUsageChart';
import { FormationEffectivenessChart } from './FormationEffectivenessChart';
import { FormationPersonnelAnalysis } from './FormationPersonnelAnalysis';
import { FormationData, processFormationData } from '../helpers/formationUtils';
import styles from './FormationAnalysis.module.css';

interface FormationAnalysisProps {
  data: FormationData[];
  className?: string;
}

export const FormationAnalysis = ({ data, className }: FormationAnalysisProps) => {
  console.log('FormationAnalysis received data:', data.length, 'plays');

  const [activeTab, setActiveTab] = React.useState<'usage' | 'effectiveness' | 'personnel'>('usage');

  // Always process data for enhanced analysis - this ensures consistent structure
  const processedData = React.useMemo(() => {
    return processFormationData(data);
  }, [data]);

  // Check if we have sufficient data for enhanced features
  const hasEnhancedData = React.useMemo(() => {
    return data.some(item => 
      'yardsGained' in item || 'playResult' in item || 'fieldPosition' in item
    );
  }, [data]);

  const hasMinimalData = data.length === 0;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Formation Analysis</h3>
        <p className={styles.subtitle}>
          {hasEnhancedData 
            ? 'Comprehensive formation insights with effectiveness and personnel analysis'
            : 'Formation usage patterns and tendencies'
          }
        </p>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'usage' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            Usage by Down
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'effectiveness' ? styles.activeTab : ''} ${!hasEnhancedData ? styles.disabledTab : ''}`}
            onClick={() => hasEnhancedData && setActiveTab('effectiveness')}
            disabled={!hasEnhancedData}
          >
            Effectiveness
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'personnel' ? styles.activeTab : ''} ${!hasEnhancedData ? styles.disabledTab : ''}`}
            onClick={() => hasEnhancedData && setActiveTab('personnel')}
            disabled={!hasEnhancedData}
          >
            Personnel Groups
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {hasMinimalData ? (
          <div className={styles.placeholder}>
            No formation data available for analysis.
          </div>
        ) : (
          <>
            <div className={`${styles.tabContent} ${activeTab === 'usage' ? styles.activeContent : ''}`}>
              <FormationUsageChart data={data} />
            </div>
            <div className={`${styles.tabContent} ${activeTab === 'effectiveness' ? styles.activeContent : ''}`}>
              {hasEnhancedData ? (
                <FormationEffectivenessChart data={processedData} />
              ) : (
                <div className={styles.placeholder}>
                  Enhanced effectiveness analysis requires additional play data.
                </div>
              )}
            </div>
            <div className={`${styles.tabContent} ${activeTab === 'personnel' ? styles.activeContent : ''}`}>
              {hasEnhancedData ? (
                <FormationPersonnelAnalysis data={processedData} />
              ) : (
                <div className={styles.placeholder}>
                  Personnel group analysis requires additional play data.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};