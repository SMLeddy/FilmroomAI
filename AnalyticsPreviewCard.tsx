import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './AnalyticsPreviewCard.module.css';

interface AnalyticsPreviewCardProps {
  title: string;
  subtitle?: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsPreviewCard = ({ 
  title, 
  subtitle, 
  onClick, 
  children, 
  className 
}: AnalyticsPreviewCardProps) => {
  return (
    <div 
      className={`${styles.card} ${className || ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <ChevronRight className={styles.expandIcon} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};