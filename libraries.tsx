import React from 'react';
import { Helmet } from 'react-helmet';
import { LibraryManager } from '../components/LibraryManager';
import styles from './libraries.module.css';

export default function LibrariesPage() {
  return (
    <>
      <Helmet>
        <title>Libraries - Film.AI</title>
        <meta name="description" content="Manage your play collections, clip collections, scouting reports, and game plans. Collaborate with other coaches and share your analysis." />
      </Helmet>
      <div className={styles.pageContainer}>
        <LibraryManager />
      </div>
    </>
  );
}