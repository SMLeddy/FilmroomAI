import React, { useState } from 'react';
import { useLibraries, useDeleteLibrary } from '../helpers/libraryHooks';
import { LibraryCard } from './LibraryCard';
import { LibraryEditor } from './LibraryEditor';
import { ExportLibraryDialog } from './ExportLibraryDialog';
import { ShareLibrary } from './ShareLibrary';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import styles from './LibraryManager.module.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

export const LibraryManager = () => {
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingLibraryId, setEditingLibraryId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [shareLibraryId, setShareLibraryId] = useState<number | null>(null);
  const [shareLibraryTitle, setShareLibraryTitle] = useState<string>('');

  const { data: libraries, isLoading, error } = useLibraries();
  const deleteLibraryMutation = useDeleteLibrary();

  const handleEdit = (libraryId: number) => {
    setEditingLibraryId(libraryId);
    setEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEditingLibraryId(null);
    setEditorOpen(true);
  };

  const handleDelete = (libraryId: number) => {
    if (window.confirm('Are you sure you want to delete this library? This action cannot be undone.')) {
      deleteLibraryMutation.mutate({ libraryId });
    }
  };

  const handleShare = (libraryId: number) => {
    const library = libraries?.find(lib => lib.id === libraryId);
    setShareLibraryId(libraryId);
    setShareLibraryTitle(library?.title || 'Unknown Library');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`${styles.libraryGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton style={{ height: '100px' }} />
              <Skeleton style={{ height: '20px', width: '80%' }} />
              <Skeleton style={{ height: '16px', width: '50%' }} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className={styles.errorState}>Error loading libraries: {error.message}</div>;
    }

    if (!libraries || libraries.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h3>No Libraries Found</h3>
          <p>Get started by creating your first library.</p>
          <Button onClick={handleCreateNew}>
            <PlusCircle size={16} />
            Create Library
          </Button>
        </div>
      );
    }

    return (
      <div className={`${styles.libraryGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
        {libraries.map((library) => (
          <LibraryCard
            key={library.id}
            library={library}
            onEdit={() => handleEdit(library.id)}
            onDelete={() => handleDelete(library.id)}
            onShare={() => handleShare(library.id)}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.manager}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Libraries</h1>
        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('grid')}>
              <LayoutGrid size={16} />
            </Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('list')}>
              <List size={16} />
            </Button>
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle size={16} />
            New Library
          </Button>
        </div>
      </header>

      <main className={styles.content}>
        {renderContent()}
      </main>

      <Dialog open={isEditorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>{editingLibraryId ? 'Edit Library' : 'Create New Library'}</DialogTitle>
          </DialogHeader>
          <LibraryEditor
            libraryId={editingLibraryId}
            onClose={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!shareLibraryId} onOpenChange={(open) => {
        if (!open) {
          setShareLibraryId(null);
          setShareLibraryTitle('');
        }
      }}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Share Library</DialogTitle>
          </DialogHeader>
          {shareLibraryId && (
            <ShareLibrary
              libraryId={shareLibraryId}
              libraryTitle={shareLibraryTitle}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};