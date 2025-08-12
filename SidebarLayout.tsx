import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from './Button';
import { useIsMobile } from '../helpers/useIsMobile';
import styles from './SidebarLayout.module.css';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on route change on mobile
    if (isMobile && isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]); // isSidebarOpen is not needed here

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.container}>
      {isMobile && (
        <header className={styles.mobileHeader}>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu />
          </Button>
        </header>
      )}

      <div className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.isOpen : ''}`}>
        <Sidebar />
      </div>

      {isMobile && isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}>
          <Button variant="ghost" size="icon" className={styles.closeButton} onClick={toggleSidebar}>
            <X />
          </Button>
        </div>
      )}

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};