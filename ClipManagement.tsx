import React from 'react';
import { Link } from 'react-router-dom';
import { useClips } from '../helpers/useClips';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Film, Plus, ExternalLink, Clock, Tag } from 'lucide-react';
import styles from './ClipManagement.module.css';

interface ClipManagementProps {
  className?: string;
}

// NOTE: Using a static film ID for now. In a real app, this would come from
// context or be determined by the current analysis scope.
const FILM_ID = 1;

export const ClipManagement: React.FC<ClipManagementProps> = ({ className }) => {
  const { data: clips, isFetching } = useClips({ filmId: FILM_ID });

  const totalClips = clips?.length || 0;
  const recentClips = clips?.slice(0, 3) || [];

  return (
    <div className={`${styles.clipManagement} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Film className={styles.headerIcon} />
          <h3 className={styles.title}>Clip Management</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          asChild
          className={styles.externalLink}
        >
          <Link to="/clips">
            <ExternalLink />
          </Link>
        </Button>
      </div>

      <div className={styles.content}>
        {/* Quick Stats */}
        <div className={styles.stats}>
          {isFetching ? (
            <div className={styles.statItem}>
              <Skeleton style={{ width: '3rem', height: '2rem' }} />
              <Skeleton style={{ width: '5rem', height: '1rem' }} />
            </div>
          ) : (
            <div className={styles.statItem}>
              <div className={styles.statValue}>{totalClips}</div>
              <div className={styles.statLabel}>Total Clips</div>
            </div>
          )}
        </div>

        {/* Recent Clips Preview */}
        <div className={styles.recentSection}>
          <h4 className={styles.recentTitle}>Recent Clips</h4>
          <div className={styles.recentClips}>
            {isFetching ? (
              <>
                <div className={styles.clipPreview}>
                  <Skeleton style={{ width: '100%', height: '1rem' }} />
                  <Skeleton style={{ width: '4rem', height: '0.75rem' }} />
                </div>
                <div className={styles.clipPreview}>
                  <Skeleton style={{ width: '100%', height: '1rem' }} />
                  <Skeleton style={{ width: '4rem', height: '0.75rem' }} />
                </div>
              </>
            ) : recentClips.length > 0 ? (
              recentClips.map((clip) => (
                <div key={clip.id} className={styles.clipPreview}>
                  <div className={styles.clipTitle}>{clip.title}</div>
                  <div className={styles.clipMeta}>
                    {clip.playResult && (
                      <span className={styles.metaItem}>
                        <Tag size={12} />
                        {clip.playResult}
                      </span>
                    )}
                    {clip.durationSeconds && (
                      <span className={styles.metaItem}>
                        <Clock size={12} />
                        {Math.round(parseFloat(clip.durationSeconds))}s
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <Film className={styles.emptyIcon} />
                <span>No clips created yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button asChild size="sm" className={styles.actionButton}>
            <Link to="/clips">
              <Film size={14} />
              View All Clips
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};