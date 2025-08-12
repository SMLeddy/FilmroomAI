import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSharedLibrary } from '../helpers/shareLinkHooks';
import { Skeleton } from '../components/Skeleton';
import { ClipCard } from '../components/ClipCard';
import { PlayCard } from '../components/PlayCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AlertTriangle, Lock } from 'lucide-react';
import styles from './shared.$shareId.module.css';

const SharedLibrarySkeleton = () => (
  <div className={styles.container}>
    <Skeleton style={{ height: '2.5rem', width: '40%', marginBottom: 'var(--spacing-2)' }} />
    <Skeleton style={{ height: '1rem', width: '60%', marginBottom: 'var(--spacing-6)' }} />
    <div className={styles.grid}>
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} style={{ height: '150px' }} />
      ))}
    </div>
  </div>
);

const PasswordPrompt = ({ onSubmit, isLoading }: { onSubmit: (password: string) => void; isLoading: boolean; }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className={styles.centeredContainer}>
      <div className={styles.promptBox}>
        <Lock size={24} className={styles.promptIcon} />
        <h2 className={styles.promptTitle}>Password Required</h2>
        <p className={styles.promptDescription}>This library is password protected. Please enter the password to view its contents.</p>
        <form onSubmit={handleSubmit} className={styles.promptForm}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !password}>
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className={styles.centeredContainer}>
    <div className={styles.promptBox}>
      <AlertTriangle size={24} className={styles.errorIcon} />
      <h2 className={styles.promptTitle}>Access Denied</h2>
      <p className={styles.promptDescription}>{message}</p>
    </div>
  </div>
);

export default function SharedLibraryPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [password, setPassword] = useState<string | undefined>();
  const { data, error, isFetching, isError } = useSharedLibrary(shareId!, password);

  const handlePasswordSubmit = (submittedPassword: string) => {
    setPassword(submittedPassword);
  };

  if (isFetching && !data) {
    return <SharedLibrarySkeleton />;
  }

  if (isError) {
    const errorMessage = (error as Error)?.message || 'An unknown error occurred.';
    return <ErrorDisplay message={errorMessage} />;
  }

  if (data?.requiresPassword) {
    return <PasswordPrompt onSubmit={handlePasswordSubmit} isLoading={isFetching} />;
  }

  if (!data || !data.library) {
    return <ErrorDisplay message="The requested library could not be found or is no longer available." />;
  }

  const { library, items } = data;

  return (
    <>
      <Helmet>
        <title>Shared: {library.title} - Film.AI</title>
        <meta name="description" content={`View the shared library: ${library.description || library.title}`} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{library.title}</h1>
          <p className={styles.description}>{library.description}</p>
        </header>
        <main className={styles.grid}>
          {items.map(item => {
            if (item.clipId) {
              // This is a simplified mapping. A real implementation would need to fetch full clip/play details.
              const clipData = {
                id: item.clipId,
                title: item.clipTitle || 'Clip',
                playCall: item.clipPlayCall,
                // Add other necessary fields with null/default values
                createdAt: new Date(), 
                updatedAt: new Date(),
                createdBy: null, 
                description: null, 
                distance: null, 
                down: null, 
                durationSeconds: null, 
                endTimeSeconds: '0', 
                filmId: null, 
                formation: null, 
                isShared: false, 
                notes: null, 
                playId: null, 
                playResult: null, 
                quarter: null, 
                startTimeSeconds: '0', 
                tags: null, 
                yardLine: null, 
                yardsGained: null
              };
              return (
                <ClipCard
                  key={`clip-${item.id}`}
                  clip={clipData}
                  onSelect={() => {}}
                  onDelete={() => {}}
                  isSelected={false}
                />
              );
            }
            if (item.playId) {
              const playData = {
                id: item.playId,
                playCall: item.playPlayCall,
                formation: item.playFormation,
                // Add other necessary fields with null/default values
                playNumber: 0, 
                createdAt: new Date(), 
                blitzType: null, 
                coverageScheme: null, 
                defensiveAlignment: null, 
                defensiveFront: null, 
                defensivePersonnel: null, 
                distance: null, 
                down: null, 
                filmId: null, 
                notes: null, 
                playResult: null, 
                pressureCount: null, 
                quarter: null, 
                timeInGame: null, 
                videoTimestampEnd: null, 
                videoTimestampStart: null, 
                yardLine: null, 
                yardsGained: null
              };
              return <PlayCard key={`play-${item.id}`} play={playData} />;
            }
            return null;
          })}
        </main>
      </div>
    </>
  );
}