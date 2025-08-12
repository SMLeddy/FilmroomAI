import React from 'react';
import { Selectable } from 'kysely';
import { Clips } from '../helpers/schema';
import { ClipCard } from './ClipCard';
import { Skeleton } from './Skeleton';
import styles from './ClipLibrary.module.css';

interface ClipLibraryProps {
  className?: string;
  clips: Selectable<Clips>[] | undefined;
  isLoading: boolean;
  onSelectClip: (clip: Selectable<Clips>) => void;
  onDeleteClip: (clipId: number) => void;
  selectedClipId?: number | null;
}

export const ClipLibrary: React.FC<ClipLibraryProps> = ({
  className,
  clips,
  isLoading,
  onSelectClip,
  onDeleteClip,
  selectedClipId,
}) => {
  if (isLoading) {
    return (
      <div className={`${styles.container} ${className ?? ''}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton className={styles.skeletonThumb} />
            <div className={styles.skeletonInfo}>
              <Skeleton style={{ height: '1.25rem', width: '80%' }} />
              <Skeleton style={{ height: '1rem', width: '60%' }} />
              <Skeleton style={{ height: '1rem', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!clips || clips.length === 0) {
    return (
      <div className={`${styles.container} ${styles.empty} ${className ?? ''}`}>
        <p>No clips created for this film yet.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          onSelect={() => onSelectClip(clip)}
          onDelete={() => onDeleteClip(clip.id)}
          isSelected={clip.id === selectedClipId}
        />
      ))}
    </div>
  );
};