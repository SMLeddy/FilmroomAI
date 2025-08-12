import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, LayoutDashboard, BarChart, Upload, Clapperboard, FolderOpen, Users, FileText, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analysis', label: 'Analysis', icon: BarChart },
  { href: '/upload', label: 'Upload Film', icon: Upload },
  { href: '/clips', label: 'Clips', icon: Clapperboard },
  { href: '/libraries', label: 'Libraries', icon: FolderOpen },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const footerNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();

  const renderNavLinks = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = location.pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          to={item.href}
          className={`${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <item.icon className={styles.navIcon} />
          <span className={styles.navLabel}>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <aside className={`${styles.sidebar} ${className || ''}`}>
      <div className={styles.sidebarContent}>
        <Link to="/" className={styles.logo}>
          <Film className={styles.logoIcon} />
          <span className={styles.logoText}>Film.AI</span>
        </Link>
        <nav className={styles.nav}>
          {renderNavLinks(mainNavItems)}
        </nav>
      </div>
      <div className={styles.sidebarFooter}>
        <nav className={styles.nav}>
          {renderNavLinks(footerNavItems)}
        </nav>
      </div>
    </aside>
  );
};