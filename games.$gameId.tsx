import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFilms } from '../helpers/filmQueries';
import { GameAnalytics } from '../components/GameAnalytics';
import { PlayLibrary } from '../components/PlayLibrary';
import { Skeleton } from '../components/Skeleton';
import { ArrowLeft } from 'lucide-react';
import styles from './games.$gameId.module.css';

export default function GamePage() {
  const { gameId } = useParams<{gameId: string;}>();
  const filmId = gameId ? parseInt(gameId, 10) : undefined;

  const { data: films, isFetching: isFetchingFilm, error: filmError } = useFilms(
    { filmId },
    { enabled: !!filmId }
  );

  const film = films?.[0];

  if (isFetchingFilm) {
    return <GamePageSkeleton />;
  }

  if (filmError) {
    return <div className={styles.error}>Error loading game data: {filmError.message}</div>;
  }

  if (!film) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Game not found.</div>
      </div>);

  }

  return (
    <>
      <Helmet>
        <title>{film.title} | Game Analysis</title>
        <meta name="description" content={`Detailed game film analysis for ${film.title}.`} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/dashboard" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className={styles.title}>{film.title}</h1>
          <div className={styles.meta}>
            <span>vs <strong>{film.opponent}</strong></span>
            <span className={styles.separator}>•</span>
            <span>{new Date(film.gameDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        <main className={styles.mainContent}>
          <GameAnalytics filmId={film.id} />
          <PlayLibrary filmId={film.id} />
        </main>
      </div>
    </>);

}

const GamePageSkeleton = () =>
<div className={styles.container}>
    <header className={styles.header}>
      <Skeleton style={{ height: '1.25rem', width: '200px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ height: '2.5rem', width: '60%', marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: '1.25rem', width: '300px' }} />
    </header>
    <main className={styles.mainContent}>
      {/* GameAnalytics Skeleton */}
      <div className={styles.card}>
        <Skeleton style={{ height: '300px' }} />
      </div>
      {/* PlayLibrary Skeleton */}
      <div className={styles.card}>
        <Skeleton style={{ height: '500px' }} />
      </div>
    </main>
  </div>;