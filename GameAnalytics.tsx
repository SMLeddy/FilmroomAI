import React from 'react';
import { useGameAnalytics } from '../helpers/useGameAnalytics';
import { Skeleton } from './Skeleton';
import { FormationAnalysis } from './FormationAnalysis';
import { PlayCallAnalysis } from './PlayCallAnalysis';
import { RedZoneAnalysis } from './RedZoneAnalysis';
import { ThirdDownAnalysis } from './ThirdDownAnalysis';
import { DefensiveSchemeAnalysis } from './DefensiveSchemeAnalysis';
import { AnalyticsPreviewCard } from './AnalyticsPreviewCard';
import { FormationAnalysisPreview } from './FormationAnalysisPreview';
import { PlayCallAnalysisPreview } from './PlayCallAnalysisPreview';
import { ThirdDownAnalysisPreview } from './ThirdDownAnalysisPreview';
import { RedZoneAnalysisPreview } from './RedZoneAnalysisPreview';
import { DefensiveAnalysisPreview } from './DefensiveAnalysisPreview';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './Sheet';
import { Button } from './Button';
import { Download, Filter } from 'lucide-react';
import styles from './GameAnalytics.module.css';

interface GameAnalyticsProps {
  filmId: number;
  className?: string;
}

type DetailView = 'formation' | 'playcall' | 'thirddown' | 'redzone' | 'defensive' | null;

export const GameAnalytics = ({ filmId, className }: GameAnalyticsProps) => {
  const { data: analytics, isFetching, error } = useGameAnalytics(filmId);
  const [activeDetail, setActiveDetail] = React.useState<DetailView>(null);

  if (isFetching) {
    return <GameAnalyticsSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading game analytics: {error.message}</div>;
  }

  if (!analytics) {
    return <div className={styles.placeholder}>No analytics data available for this game.</div>;
  }

  const {
    formationUsage,
    playCallTendencies,
    redZonePatterns,
    thirdDownSuccessRates,
  } = analytics;

  const handleExport = (dataType: string) => {
    console.log(`Exporting ${dataType} data...`);
    // TODO: Implement export functionality
  };

  const renderDetailContent = () => {
    const detailActions = (
      <div className={styles.detailActions}>
        <Button variant="outline" size="sm">
          <Filter />
          Filter
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport(activeDetail || '')}>
          <Download />
          Export
        </Button>
      </div>
    );

    switch (activeDetail) {
      case 'formation':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Formation Analysis</SheetTitle>
              <SheetDescription>
                Detailed breakdown of formation usage patterns and tendencies
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <FormationAnalysis data={formationUsage} />
            </div>
          </>
        );
      case 'playcall':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Play Call Analysis</SheetTitle>
              <SheetDescription>
                Comprehensive analysis of play calling patterns and frequency
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <PlayCallAnalysis data={playCallTendencies} />
            </div>
          </>
        );
      case 'thirddown':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Third Down Analysis</SheetTitle>
              <SheetDescription>
                Detailed breakdown of third down performance and play selection
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <ThirdDownAnalysis data={thirdDownSuccessRates} />
            </div>
          </>
        );
      case 'redzone':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Red Zone Analysis</SheetTitle>
              <SheetDescription>
                In-depth analysis of red zone performance and play calling
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <RedZoneAnalysis data={redZonePatterns} />
            </div>
          </>
        );
      case 'defensive':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Defensive Scheme Analysis</SheetTitle>
              <SheetDescription>
                Comprehensive defensive scheme breakdown and tendencies
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <DefensiveSchemeAnalysis filmId={filmId} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h2 className={styles.sectionTitle}>Game Analytics</h2>
      <div className={styles.grid}>
        <div className={styles.formationCard}>
          <AnalyticsPreviewCard
            title="Formation Analysis"
            subtitle="Formation usage patterns and tendencies"
            onClick={() => setActiveDetail('formation')}
          >
            <FormationAnalysisPreview data={formationUsage} />
          </AnalyticsPreviewCard>
        </div>
        
        <div className={styles.playCallCard}>
          <AnalyticsPreviewCard
            title="Play Call Analysis"
            subtitle="Most frequent play calls and patterns"
            onClick={() => setActiveDetail('playcall')}
          >
            <PlayCallAnalysisPreview data={playCallTendencies} />
          </AnalyticsPreviewCard>
        </div>
        
        <div className={styles.thirdDownCard}>
          <AnalyticsPreviewCard
            title="Third Down Analysis"
            subtitle="Conversion rates and critical situations"
            onClick={() => setActiveDetail('thirddown')}
          >
            <ThirdDownAnalysisPreview data={thirdDownSuccessRates} />
          </AnalyticsPreviewCard>
        </div>
        
        <div className={styles.redZoneCard}>
          <AnalyticsPreviewCard
            title="Red Zone Analysis"
            subtitle="Performance inside the 20-yard line"
            onClick={() => setActiveDetail('redzone')}
          >
            <RedZoneAnalysisPreview data={redZonePatterns} />
          </AnalyticsPreviewCard>
        </div>
        
        <div className={styles.defensiveCard}>
          <AnalyticsPreviewCard
            title="Defensive Analysis"
            subtitle="Defensive schemes and coverage patterns"
            onClick={() => setActiveDetail('defensive')}
          >
            <DefensiveAnalysisPreview filmId={filmId} />
          </AnalyticsPreviewCard>
        </div>
      </div>

      <Sheet open={activeDetail !== null} onOpenChange={(open) => !open && setActiveDetail(null)}>
        <SheetContent side="right" style={{ width: '90vw', maxWidth: '1200px' }}>
          {renderDetailContent()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const GameAnalyticsSkeleton = () => (
  <div className={styles.container}>
    <h2 className={styles.sectionTitle}>Game Analytics</h2>
    <div className={styles.grid}>
      <div className={styles.formationCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.playCallCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.thirdDownCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.redZoneCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.defensiveCard}><Skeleton style={{ height: '200px' }} /></div>
    </div>
  </div>
);