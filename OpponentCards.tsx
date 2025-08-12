import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Film } from 'lucide-react';
import { useOpponents } from '../helpers/useOpponents';
import { Skeleton } from './Skeleton';
import styles from './OpponentCards.module.css';

const OpponentCardSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <Skeleton className={styles.iconSkeleton} />
      <Skeleton className={styles.titleSkeleton} />
    </div>
    <div className={styles.cardBody}>
      <div className={styles.stat}>
        <Skeleton className={styles.statSkeleton} />
      </div>
      <div className={styles.stat}>
        <Skeleton className={styles.statSkeleton} />
      </div>
    </div>
  </div>
);

export const OpponentCards = ({ className }: { className?: string }) => {
  const { data: opponents, isFetching, error } = useOpponents();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <Shield size={20} />
        <h2 className={styles.mainTitle}>Opponent Scouting</h2>
      </div>
      {error && <div className={styles.errorState}>Failed to load opponents.</div>}
      <div className={styles.grid}>
        {isFetching && Array.from({ length: 4 }).map((_, i) => <OpponentCardSkeleton key={i} />)}
        {!isFetching &&
          opponents?.map((opponent) => (
            <Link to={`/scouting/opponent/${encodeURIComponent(opponent.opponentName)}`} key={opponent.opponentName} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Shield size={16} />
                  </div>
                  <h3 className={styles.cardTitle}>{opponent.opponentName}</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.stat}>
                    <Film size={14} className={styles.statIcon} />
                    <span>{opponent.gameCount} {opponent.gameCount > 1 ? 'Games' : 'Game'}</span>
                  </div>
                  <div className={styles.stat}>
                    <Calendar size={14} className={styles.statIcon} />
                    <span>Last seen: {formatDate(opponent.lastGameDate)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
      {!isFetching && opponents?.length === 0 && (
        <div className={styles.emptyState}>No opponent data available yet.</div>
      )}
    </div>
  );
};