import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';
import styles from './SharedLayout.module.css';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout = ({ children }: SharedLayoutProps) => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <Film className={styles.logoIcon} />
            <span className={styles.logoText}>Film.AI</span>
          </Link>
          <nav className={styles.nav}>
            <Link 
              to="/" 
              className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
            >
              Dashboard Demo
            </Link>
            <Link 
              to="/clips" 
              className={`${styles.navLink} ${location.pathname === '/clips' ? styles.active : ''}`}
            >
              Clips
            </Link>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};