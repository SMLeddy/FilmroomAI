import React from 'react';
import { FileText, FolderArchive } from 'lucide-react';
import styles from './AnalysisArtifacts.module.css';

export const AnalysisArtifacts = ({ className }: { className?: string }) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <FileText size={16} className={styles.headerIcon} />
        <h3 className={styles.title}>Analysis Artifacts</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIconWrapper}>
            <FolderArchive size={32} className={styles.placeholderIcon} />
          </div>
          <h4 className={styles.placeholderTitle}>Coming Soon</h4>
          <p className={styles.placeholderText}>
            Your saved reports, custom breakdowns, and analysis insights will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};