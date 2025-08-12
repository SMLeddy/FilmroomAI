import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { OpponentSelector } from '../components/OpponentSelector';
import { OpponentAnalytics } from '../components/OpponentAnalytics';
import { QuickStats } from '../components/QuickStats';
import { RecentActivity } from '../components/RecentActivity';
import { RecentFilms } from '../components/RecentFilms';
import { OpponentCards } from '../components/OpponentCards';
import { AnalysisArtifacts } from '../components/AnalysisArtifacts';
import { ClipManagement } from '../components/ClipManagement';
import { Button } from '../components/Button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../components/Collapsible';
import { Target, Upload, ChevronDown, ExternalLink, TrendingUp, Shield, Zap } from 'lucide-react';
import styles from './dashboard.module.css';

const DashboardPage = () => {
  const [selectedOpponent, setSelectedOpponent] = useState<string | undefined>(undefined);

  const handleOpponentChange = (opponentName: string) => {
    setSelectedOpponent(opponentName);
  };

  return (
    <>
      <Helmet>
        <title>Command Center - Film.AI</title>
        <meta name="description" content="Comprehensive coaching command center for film analysis and opponent scouting." />
      </Helmet>
      
      <div className={styles.dashboard}>
        <header className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              <Target className={styles.headerIcon} />
              <h1>Command Center</h1>
            </div>
            <div className={styles.headerActions}>
              <Button asChild>
                <Link to="/upload-film">
                  <Upload size={16} />
                  Upload New Film
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Quick Stats Overview */}
          <section className={styles.quickStatsSection}>
            <QuickStats />
          </section>

          {/* Main Grid Layout */}
          <section className={styles.mainGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              <RecentActivity className={styles.gridItem} />
              <RecentFilms className={styles.gridItem} />
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              <OpponentCards className={styles.gridItem} />
              <ClipManagement className={styles.gridItem} />
              <AnalysisArtifacts className={styles.gridItem} />
            </div>
          </section>

          {/* Opponent Analysis Section */}
          <section className={styles.opponentAnalysisSection}>
            <div className={styles.opponentAnalysisHeader}>
              <div className={styles.opponentAnalysisTitle}>
                <Target size={20} />
                <h2>Detailed Opponent Analysis</h2>
              </div>
              <OpponentSelector 
                selectedOpponent={selectedOpponent}
                onOpponentChange={handleOpponentChange}
                className={styles.opponentSelector}
              />
            </div>
            
            {selectedOpponent ? (
              <Collapsible className={styles.opponentCollapsible}>
                <CollapsibleTrigger className={styles.collapsibleTrigger}>
                  <div className={styles.triggerContent}>
                    <div className={styles.triggerHeader}>
                      <h3>{selectedOpponent} Quick Overview</h3>
                      <ChevronDown className={styles.chevronIcon} />
                    </div>
                    <p className={styles.triggerSubtext}>View summary stats and trends</p>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className={styles.collapsibleContent}>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryIcon}>
                        <TrendingUp size={20} />
                      </div>
                      <div className={styles.summaryContent}>
                        <h4>Offensive Trends</h4>
                        <p>65% Run on 1st Down</p>
                        <p>I-Formation: 45% usage</p>
                      </div>
                    </div>
                    
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryIcon}>
                        <Shield size={20} />
                      </div>
                      <div className={styles.summaryContent}>
                        <h4>Red Zone Efficiency</h4>
                        <p>72% Success Rate</p>
                        <p>Prefers Power Running</p>
                      </div>
                    </div>
                    
                    <div className={styles.summaryCard}>
                      <div className={styles.summaryIcon}>
                        <Zap size={20} />
                      </div>
                      <div className={styles.summaryContent}>
                        <h4>3rd Down Conversions</h4>
                        <p>38% Success Rate</p>
                        <p>Heavy Pass Tendency</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.viewFullAnalysis}>
                    <Button asChild size="sm">
                      <Link to={`/analysis/${encodeURIComponent(selectedOpponent)}`}>
                        <ExternalLink size={16} />
                        View Full Analysis
                      </Link>
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div className={styles.placeholder}>
                <Target className={styles.placeholderIcon} />
                <h3>Select an Opponent for Quick Overview</h3>
                <p>Choose an opponent from the dropdown above to view a summary of key insights and access detailed analysis.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;