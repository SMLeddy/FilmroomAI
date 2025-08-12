import React from 'react';
import { useFilms } from '../helpers/filmQueries';
import { Skeleton } from './Skeleton';
import styles from './GameHistoryPreview.module.css';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import type { Selectable } from 'kysely';
import type { GameFilms } from '../helpers/schema';

interface GameHistoryPreviewProps {
  opponent: string;
  className?: string;
}

const GameHistoryPreviewSkeleton = () => {
  return (
    <div className={styles.container}>
      <Skeleton style={{ height: '38px', marginBottom: 'var(--spacing-1)' }} />
      <div className={styles.gameList}>
        <div className={styles.gameItemSkeleton}>
          <Skeleton style={{ height: '1rem', width: '80%' }} />
          <Skeleton style={{ height: '0.875rem', width: '40%', marginTop: 'var(--spacing-1)' }} />
        </div>
        <div className={styles.gameItemSkeleton}>
          <Skeleton style={{ height: '1rem', width: '70%' }} />
          <Skeleton style={{ height: '0.875rem', width: '40%', marginTop: 'var(--spacing-1)' }} />
        </div>
        <div className={styles.gameItemSkeleton}>
          <Skeleton style={{ height: '1rem', width: '90%' }} />
          <Skeleton style={{ height: '0.875rem', width: '40%', marginTop: 'var(--spacing-1)' }} />
        </div>
      </div>
    </div>
  );
};

export const GameHistoryPreview = ({ opponent, className }: GameHistoryPreviewProps) => {
  const { data: films, isFetching, error } = useFilms({ opponent });

  const sortedFilms = React.useMemo(() => {
    if (!films) return [];
    // The 'films' array is a copy from React Query, so we can sort it in place.
    return films.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
  }, [films]);

  if (isFetching) {
    return <GameHistoryPreviewSkeleton />;
  }

  if (error) {
    return (
      <div className={`${styles.placeholder} ${styles.error}`}>
        <AlertTriangle size={16} />
        <span>Error loading game history</span>
      </div>
    );
  }

  if (!sortedFilms || sortedFilms.length === 0) {
    return (
      <div className={styles.placeholder}>
        No game history available for {opponent}
      </div>
    );
  }

  const mostRecentGame = sortedFilms[0];
  const recentGamesToDisplay = sortedFilms.slice(0, 3);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.summary}>
        <span className={styles.totalGames}>{sortedFilms.length} total games</span>
        {mostRecentGame && (
          <span className={styles.mostRecent}>
            <CalendarDays size={12} />
            {formatDate(mostRecentGame.gameDate)}
          </span>
        )}
      </div>
      
      <div className={styles.gameList}>
        {recentGamesToDisplay.map((game: Selectable<GameFilms>) => (
          <div key={game.id} className={styles.gameItem}>
            <span className={styles.gameTitle}>{game.title}</span>
            <span className={styles.gameDate}>{formatDate(game.gameDate)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};