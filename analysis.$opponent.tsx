import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { OpponentAnalytics } from '../components/OpponentAnalytics';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import styles from './analysis.$opponent.module.css';

const OpponentAnalysisPage = () => {
  const { opponent } = useParams<{ opponent: string }>();

  // Decode the opponent name from the URL parameter
  const opponentName = opponent ? decodeURIComponent(opponent) : undefined;

  return (
    <>
      <Helmet>
        <title>{opponentName ? `${opponentName} Analysis` : 'Opponent Analysis'} - Film.AI</title>
        <meta name="description" content={`Detailed scouting report and analytics for ${opponentName}.`} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <Link to="/dashboard" className={styles.breadcrumbLink}>Dashboard</Link>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>Opponent Analysis</span>
            {opponentName && (
              <>
                <ChevronRight size={16} className={styles.breadcrumbSeparator} />
                <span className={styles.breadcrumbCurrent}>{opponentName}</span>
              </>
            )}
          </nav>
          <Link to="/dashboard" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </header>

        <main className={styles.mainContent}>
          {opponentName ? (
            <OpponentAnalytics opponentName={opponentName} />
          ) : (
            <div className={styles.error}>
              <p>Opponent name not provided in the URL.</p>
              <p>Please return to the dashboard and select an opponent.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default OpponentAnalysisPage;