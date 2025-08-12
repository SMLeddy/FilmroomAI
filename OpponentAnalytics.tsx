import React from 'react';
import { useOpponentAnalytics } from '../helpers/useOpponentAnalytics';
import { Skeleton } from './Skeleton';
import { FormationAnalysis } from './FormationAnalysis';
import { PlayCallAnalysis } from './PlayCallAnalysis';
import { RedZoneAnalysis } from './RedZoneAnalysis';
import { ThirdDownAnalysis } from './ThirdDownAnalysis';
import { GameHistory } from './GameHistory';
import { DefensiveSchemeAnalysis } from './DefensiveSchemeAnalysis';
import { AnalyticsPreviewCard } from './AnalyticsPreviewCard';
import { FormationAnalysisPreview } from './FormationAnalysisPreview';
import { PlayCallAnalysisPreview } from './PlayCallAnalysisPreview';
import { ThirdDownAnalysisPreview } from './ThirdDownAnalysisPreview';
import { RedZoneAnalysisPreview } from './RedZoneAnalysisPreview';
import { DefensiveAnalysisPreview } from './DefensiveAnalysisPreview';
import { GameHistoryPreview } from './GameHistoryPreview';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './Sheet';
import { Button } from './Button';
import { Download, Filter } from 'lucide-react';
import { Separator } from './Separator';
import styles from './OpponentAnalytics.module.css';

interface OpponentAnalyticsProps {
  opponentName: string;
  className?: string;
}

type DetailView = 'formation' | 'playcall' | 'thirddown' | 'redzone' | 'defensive' | 'gamehistory' | null;

export const OpponentAnalytics = ({ opponentName, className }: OpponentAnalyticsProps) => {
  const { data: analytics, isFetching, error } = useOpponentAnalytics(
    { opponentName },
    { enabled: !!opponentName }
  );
  const [activeDetail, setActiveDetail] = React.useState<DetailView>(null);

  if (isFetching) {
    return <OpponentAnalyticsSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading analytics: {error.message}</div>;
  }

  if (!analytics) {
    return (
      <div className={styles.placeholder}>
        <h2>Select an opponent to view their analytics.</h2>
        <p>Detailed scouting reports and tendency charts will appear here.</p>
      </div>
    );
  }

  const {
    overview,
    formationUsage,
    playCallTendencies,
    redZonePatterns,
    thirdDownSuccessRates,
  } = analytics;

  const handleExport = (dataType: string) => {
    console.log(`Exporting ${dataType} data for ${opponentName}...`);
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
                Detailed breakdown of {opponentName}'s formation usage patterns and tendencies
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
                Comprehensive analysis of {opponentName}'s play calling patterns and frequency
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
                Detailed breakdown of {opponentName}'s third down performance and play selection
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
                In-depth analysis of {opponentName}'s red zone performance and play calling
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
                Comprehensive defensive scheme breakdown and tendencies for {opponentName}
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <DefensiveSchemeAnalysis opponent={opponentName} />
            </div>
          </>
        );
      case 'gamehistory':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Game History</SheetTitle>
              <SheetDescription>
                Complete game history and film archive for {opponentName}
              </SheetDescription>
              {detailActions}
            </SheetHeader>
            <div className={styles.detailContent}>
              <GameHistory opponentName={opponentName} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{overview.opponentName} Scouting Report</h1>
        <div className={styles.overview}>
          <span>Total Games: <strong>{overview.totalGames}</strong></span>
          <Separator orientation="vertical" />
          <span>Total Plays Analyzed: <strong>{overview.totalPlays}</strong></span>
        </div>
      </header>

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
            <DefensiveAnalysisPreview opponent={opponentName} />
          </AnalyticsPreviewCard>
        </div>

        <div className={styles.gameHistoryCard}>
          <AnalyticsPreviewCard
            title="Game History"
            subtitle="Past games and film archive"
            onClick={() => setActiveDetail('gamehistory')}
          >
            <GameHistoryPreview opponent={opponentName} />
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

const OpponentAnalyticsSkeleton = () => (
  <div className={styles.container}>
    <header className={styles.header}>
      <Skeleton style={{ height: '2.5rem', width: '400px', marginBottom: 'var(--spacing-2)' }} />
      <div className={styles.overview}>
        <Skeleton style={{ height: '1.25rem', width: '120px' }} />
        <Separator orientation="vertical" />
        <Skeleton style={{ height: '1.25rem', width: '180px' }} />
      </div>
    </header>
    <div className={styles.grid}>
      <div className={styles.formationCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.playCallCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.thirdDownCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.redZoneCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.defensiveCard}><Skeleton style={{ height: '200px' }} /></div>
      <div className={styles.gameHistoryCard}><Skeleton style={{ height: '200px' }} /></div>
    </div>
  </div>
);