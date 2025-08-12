import React from 'react';
import { Link } from 'react-router-dom';
import { useFilms } from '../helpers/filmQueries';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import styles from './GameHistory.module.css';

interface GameHistoryProps {
  opponentName: string;
  className?: string;
}

export const GameHistory = ({ opponentName, className }: GameHistoryProps) => {
  const { data: films, isFetching, error } = useFilms({ opponent: opponentName });

  const renderContent = () => {
    if (isFetching) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className={styles.skeletonItem} />
      ));
    }

    if (error) {
      return <div className={styles.error}>Failed to load game history.</div>;
    }

    if (!films || films.length === 0) {
      return <div className={styles.empty}>No game films found for this opponent.</div>;
    }

    return films.map((film) => (
      <Link to={`/games/${film.id}`} key={film.id} className={styles.gameItem}>
        <div className={styles.gameInfo}>
          <span className={styles.gameTitle}>{film.title}</span>
          <span className={styles.gameDate}>
            {new Date(film.gameDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <Badge variant="outline">{film.totalPlays} Plays</Badge>
      </Link>
    ));
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>Game History</h3>
      <div className={styles.list}>{renderContent()}</div>
    </div>
  );
};