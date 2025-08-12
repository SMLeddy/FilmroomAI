import React from 'react';
import { Selectable } from 'kysely';
import { Libraries, LibraryType } from '../helpers/schema';
import { Button } from './Button';
import { Avatar, AvatarFallback } from './Avatar';
import { ExportLibraryDialog } from './ExportLibraryDialog';
import { Users, Edit, Trash2, Book, Film, ClipboardList, Target, Share2 } from 'lucide-react';
import styles from './LibraryCard.module.css';

interface LibraryCardProps {
  library: Selectable<Libraries>;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

const getLibraryIcon = (type: LibraryType) => {
  switch (type) {
    case 'play_collection':
      return <Book size={20} />;
    case 'clip_collection':
      return <Film size={20} />;
    case 'scouting_report':
      return <ClipboardList size={20} />;
    case 'game_plan':
      return <Target size={20} />;
    default:
      return <Book size={20} />;
  }
};

const formatLibraryType = (type: LibraryType) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const LibraryCard = ({ library, onEdit, onDelete, onShare, className, viewMode = 'grid' }: LibraryCardProps) => {
  const cardClasses = `${styles.card} ${viewMode === 'list' ? styles.listView : ''} ${className || ''}`;

  return (
    <div className={cardClasses}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          {getLibraryIcon(library.libraryType)}
        </div>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{library.title}</h3>
          <span className={styles.type}>{formatLibraryType(library.libraryType)}</span>
        </div>
      </div>

      <p className={styles.description}>{library.description || 'No description provided.'}</p>

      <div className={styles.cardFooter}>
        <div className={styles.collaborators}>
          <Users size={16} className={styles.footerIcon} />
          {/* Placeholder for collaborator avatars */}
          <div className={styles.avatarGroup}>
            <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
          </div>
        </div>
        <div className={styles.actions}>
          <ExportLibraryDialog
            libraryId={library.id}
            libraryTitle={library.title}
          />
          <Button variant="ghost" size="icon-sm" onClick={onShare}>
            <Share2 size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};