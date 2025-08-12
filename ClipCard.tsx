import React, { useState } from 'react';
import { Selectable } from 'kysely';
import { Clips } from '../helpers/schema';
import { Badge } from './Badge';
import { Button } from './Button';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { useLibraries, useAddToLibrary } from '../helpers/libraryHooks';
import { Trash2, Edit, FolderPlus, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from './ClipCard.module.css';

interface ClipCardProps {
  clip: Selectable<Clips>;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

const formatTime = (timeInSeconds: number | null | undefined) => {
  if (timeInSeconds === null || timeInSeconds === undefined) return '0:00';
  const floored = Math.floor(timeInSeconds);
  const minutes = Math.floor(floored / 60);
  const seconds = floored % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ClipCard: React.FC<ClipCardProps> = ({ clip, onSelect, onDelete, isSelected }) => {
  const [isLibraryPopoverOpen, setIsLibraryPopoverOpen] = useState(false);
  const { data: libraries, isFetching: librariesLoading } = useLibraries();
  const addToLibraryMutation = useAddToLibrary();
  const downAndDistance = clip.down && clip.distance ? `${clip.down} & ${clip.distance}` : clip.down;

  const handleAddToLibrary = (libraryId: number) => {
    if (!clip.id) return;
    
    addToLibraryMutation.mutate({
      libraryId,
      clipId: clip.id,
    }, {
      onSuccess: () => {
        setIsLibraryPopoverOpen(false);
      }
    });
  };

  const handleShare = async () => {
    try {
      const clipUrl = `${window.location.origin}/clips?clipId=${clip.id}`;
      await navigator.clipboard.writeText(clipUrl);
      toast.success('Clip link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy clip link:', error);
      toast.error('Failed to copy clip link');
    }
  };

  return (
    <div className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.thumbnail}>
        {/* Placeholder for thumbnail */}
        <span className={styles.timestamp}>
          {formatTime(Number(clip.startTimeSeconds))}-{formatTime(Number(clip.endTimeSeconds))}
        </span>
      </div>
      <div className={styles.info}>
        <div className={styles.mainInfo}>
          <span className={styles.playCall}>{clip.title || clip.playCall || 'Untitled Clip'}</span>
          {clip.playResult && <Badge variant="secondary">{clip.playResult.replace(/_/g, ' ')}</Badge>}
        </div>
        <div className={styles.meta}>
          {downAndDistance && <span className={styles.metaItem}>{downAndDistance}</span>}
          {clip.formation && <span className={styles.metaItem}>{clip.formation}</span>}
        </div>
      </div>
      <div className={styles.actions}>
        <Popover open={isLibraryPopoverOpen} onOpenChange={setIsLibraryPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={(e) => e.stopPropagation()}
              disabled={addToLibraryMutation.isPending}
            >
              <FolderPlus />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className={styles.libraryPopover}>
            <div className={styles.libraryHeader}>
              <h4>Add to Library</h4>
            </div>
            <div className={styles.libraryList}>
              {librariesLoading ? (
                <div className={styles.loading}>Loading libraries...</div>
              ) : !libraries || libraries.length === 0 ? (
                <div className={styles.noLibraries}>No libraries available</div>
              ) : (
                libraries.map((library) => (
                  <Button
                    key={library.id}
                    variant="ghost"
                    size="sm"
                    className={styles.libraryItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToLibrary(library.id);
                    }}
                    disabled={addToLibraryMutation.isPending}
                  >
                    <span className={styles.libraryTitle}>{library.title}</span>
                    <Badge variant="outline" className={styles.libraryType}>
                      {library.libraryType.replace(/_/g, ' ')}
                    </Badge>
                  </Button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleShare(); 
          }}
        >
          <Share2 />
        </Button>
        
        <Button variant="ghost" size="icon-sm" onClick={onSelect}>
          <Edit />
        </Button>
        
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};