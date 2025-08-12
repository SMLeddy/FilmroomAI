import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Target, ChevronRight, BarChart2 } from 'lucide-react';
import { OpponentSelector } from '../components/OpponentSelector';
import { OpponentCards } from '../components/OpponentCards';
import styles from './analysis.module.css';

const AnalysisPage = () => {
  const navigate = useNavigate();

  const handleOpponentSelect = (opponentName: string) => {
    if (opponentName) {
      navigate(`/analysis/${encodeURIComponent(opponentName)}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Opponent Analysis - Film.AI</title>
        <meta name="description" content="Select an opponent to begin in-depth film analysis and review scouting reports." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <span className={styles.breadcrumbCurrent}>Analysis</span>
          </nav>
          <div className={styles.titleContainer}>
            <Target className={styles.titleIcon} />
            <h1 className={styles.title}>Opponent Analysis</h1>
          </div>
          <p className={styles.subtitle}>
            Dive deep into opponent tendencies. Select a team to generate a detailed scouting report.
          </p>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.selectorSection}>
            <div className={styles.selectorCard}>
              <h2 className={styles.selectorTitle}>Select Opponent to Analyze</h2>
              <p className={styles.selectorDescription}>
                Choose an opponent from the list below to view their full analytical breakdown, including formation tendencies, play calls, and situational performance.
              </p>
              <div className={styles.selectorWrapper}>
                <OpponentSelector
                  selectedOpponent={undefined}
                  onOpponentChange={handleOpponentSelect}
                />
              </div>
            </div>
          </section>

          <section className={styles.recentAnalysisSection}>
            <div className={styles.sectionHeader}>
              <BarChart2 size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Or, Start from a Recent Analysis</h2>
            </div>
            <div className={styles.opponentCardsWrapper}>
              <OpponentCards />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AnalysisPage;