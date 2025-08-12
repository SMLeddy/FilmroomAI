import React, { useState, useMemo } from 'react';
import { Selectable } from 'kysely';
import { Clips } from '../helpers/schema';
import { useClips, useDeleteClip } from '../helpers/useClips';
import { useLibraries, useCreateLibrary } from '../helpers/libraryHooks';
import { getLibraryTypeIcon, getLibraryTypeLabel } from '../helpers/libraryUtils';
import { ClipLibrary } from '../components/ClipLibrary';
import { ClipViewer } from '../components/ClipViewer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../components/DropdownMenu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../components/Breadcrumb';
import { Search, X, Plus, Library, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styles from './clips.module.css';

// NOTE: In a real application, the filmId would likely come from a URL parameter
// (e.g., /films/:filmId/clips) or global state. For this example, we'll use a static ID.
const FILM_ID = 1;

export default function ClipsPage() {
  const [selectedClip, setSelectedClip] = useState<Selectable<Clips> | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clips, isLoading: isLoadingClips } = useClips({ filmId: FILM_ID });
  const { mutate: deleteClip } = useDeleteClip(FILM_ID);
  const { data: libraries, isLoading: isLoadingLibraries } = useLibraries();
  const { mutate: createLibrary } = useCreateLibrary();

  const handleSelectClip = (clip: Selectable<Clips>) => {
    setSelectedClip(clip);
    setIsViewerOpen(true);
  };

  const handleDeleteClip = (clipId: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this clip?')) {
      deleteClip({ id: clipId });
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    // Delay clearing the selected clip to allow for exit animation
    setTimeout(() => setSelectedClip(null), 300);
  };

  const handleCreateClipCollection = () => {
    createLibrary({
      title: 'New Clip Collection',
      description: 'A collection of video clips for analysis',
      libraryType: 'clip_collection'
    });
  };

  const filteredClips = useMemo(() => {
    if (!clips) return [];
    if (!searchTerm) return clips;

    const lowercasedTerm = searchTerm.toLowerCase();
    return clips.filter(clip => 
      (clip.title && clip.title.toLowerCase().includes(lowercasedTerm)) ||
      (clip.description && clip.description.toLowerCase().includes(lowercasedTerm)) ||
      (clip.notes && clip.notes.toLowerCase().includes(lowercasedTerm)) ||
      (clip.playCall && clip.playCall.toLowerCase().includes(lowercasedTerm)) ||
      (clip.formation && clip.formation.toLowerCase().includes(lowercasedTerm)) ||
      (clip.playResult && clip.playResult.toLowerCase().includes(lowercasedTerm))
    );
  }, [clips, searchTerm]);

  return (
    <>
      <Helmet>
        <title>Clips - Film.AI</title>
        <meta name="description" content="Manage and analyze video clips from game film. Create collections, add notes, and organize plays for coaching analysis." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.breadcrumbContainer}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Clips</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Clip Library</h1>
          <p className={styles.subtitle}>Manage and analyze all clips for the selected film.</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search clips..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className={styles.clearSearchButton}
                onClick={() => setSearchTerm('')}
              >
                <X />
              </Button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Library size={16} />
                Libraries
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isLoadingLibraries ? (
                <DropdownMenuItem disabled>Loading libraries...</DropdownMenuItem>
              ) : libraries && libraries.length > 0 ? (
                <>
                  {libraries.map((library) => {
                    const IconComponent = getLibraryTypeIcon(library.libraryType);
                    return (
                      <DropdownMenuItem key={library.id} asChild>
                        <Link to={`/libraries/${library.id}`}>
                          <IconComponent className={styles.libraryIcon} />
                          {library.title}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/libraries">
                      <Library size={16} />
                      View All Libraries
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem disabled>No libraries found</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/libraries">
                      <Library size={16} />
                      Go to Libraries
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleCreateClipCollection}>
            <Plus size={16} />
            Create Clip Collection
          </Button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <ClipLibrary
          clips={filteredClips}
          isLoading={isLoadingClips}
          onSelectClip={handleSelectClip}
          onDeleteClip={handleDeleteClip}
          selectedClipId={selectedClip?.id}
        />
      </main>

      {selectedClip && (
        <ClipViewer
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          clip={selectedClip}
          // This is a placeholder. A real implementation would need the film's URL.
          videoSrc="/placeholder-film.mp4"
        />
      )}
      </div>
    </>
  );
}