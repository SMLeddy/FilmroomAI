import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FileText, Plus, Search, Filter, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/Dialog';
import { Skeleton } from '../components/Skeleton';
import { ReportCard } from '../components/ReportCard';
import { CreateReportForm } from '../components/CreateReportForm';
import { useGetReports, useCreateReport, useDeleteReport } from '../helpers/useReports';
import { ReportStatusArrayValues, ReportFocusAreaArrayValues, FOCUS_AREA_LABELS, STATUS_LABELS, ReportStatusType, ReportFocusAreaType } from '../helpers/reportSchema';
import type { ReportStatus, ReportFocusArea } from '../helpers/reportSchema';
import type { Selectable } from 'kysely';
import type { Reports } from '../helpers/schema';
import { toast } from 'sonner';
import styles from './reports.module.css';

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatusType | '__empty'>('__empty');
  const [focusAreaFilter, setFocusAreaFilter] = useState<ReportFocusAreaType | '__empty' | '__custom'>('__empty');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // React Query hooks
  const {
    data: reports = [],
    isFetching: isLoadingReports,
    error: reportsError
  } = useGetReports({
    status: statusFilter === '__empty' ? undefined : statusFilter,
    focusArea: focusAreaFilter === '__empty' ? undefined : focusAreaFilter,
  });

  const createReportMutation = useCreateReport();
  const deleteReportMutation = useDeleteReport();

  // Helper function to check if focus area is custom
  const isCustomFocusArea = (focusArea: string) => {
    return !ReportFocusAreaArrayValues.includes(focusArea as ReportFocusAreaType);
  };

  // Get unique custom focus areas for the filter
  const customFocusAreas = Array.from(new Set(
    reports
      .filter(report => isCustomFocusArea(report.focusArea))
      .map(report => report.focusArea)
  ));

  // Filter reports by search query and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.opponentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.focusArea?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFocusArea = focusAreaFilter === '__empty' || 
      (focusAreaFilter === '__custom' ? isCustomFocusArea(report.focusArea) : report.focusArea === focusAreaFilter);
    
    return matchesSearch && matchesFocusArea;
  });

  const handleCreateReport = async (data: Parameters<typeof createReportMutation.mutate>[0]) => {
    try {
      await createReportMutation.mutateAsync(data);
      toast.success('Report created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create report');
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteReportMutation.mutateAsync({ id: reportId });
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete report');
    }
  };

  const handleEditReport = (report: Selectable<Reports>) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon');
  };

  const handleViewReport = (report: Selectable<Reports>) => {
    // TODO: Implement view functionality
    toast.info('View functionality coming soon');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('__empty');
    setFocusAreaFilter('__empty');
  };

  const hasActiveFilters = searchQuery || statusFilter !== '__empty' || focusAreaFilter !== '__empty';

  if (reportsError) {
    return (
      <>
        <Helmet>
          <title>Reports - Film.AI</title>
          <meta name="description" content="Generate and view detailed game, opponent, and season reports." />
        </Helmet>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <BarChart3 size={48} />
            <h2>Failed to Load Reports</h2>
            <p>There was an error loading your reports. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reports - Film.AI</title>
        <meta name="description" content="Generate and view detailed game, opponent, and season reports." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleContainer}>
            <FileText className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>Reports</h1>
              <p className={styles.subtitle}>
                Generate comprehensive analysis reports for games, opponents, and seasons.
              </p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: '600px' }}>
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
              </DialogHeader>
              <CreateReportForm
                onSubmit={handleCreateReport}
                onCancel={() => setIsCreateDialogOpen(false)}
                isSubmitting={createReportMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search reports by title or opponent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatusType | '__empty')}>
              <SelectTrigger style={{ minWidth: '140px' }}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty">All Statuses</SelectItem>
                {ReportStatusArrayValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={focusAreaFilter} onValueChange={(value) => setFocusAreaFilter(value as ReportFocusAreaType | '__empty')}>
              <SelectTrigger style={{ minWidth: '160px' }}>
                <SelectValue placeholder="All Focus Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty">All Focus Areas</SelectItem>
                {ReportFocusAreaArrayValues.map((area) => (
                  <SelectItem key={area} value={area}>
                    {FOCUS_AREA_LABELS[area]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Filter size={14} />
                Clear
              </Button>
            )}
          </div>
        </div>

        <main className={styles.mainContent}>
          {isLoadingReports ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <Skeleton style={{ width: '70%', height: '1.5rem' }} />
                    <Skeleton style={{ width: '60px', height: '2rem', borderRadius: 'var(--radius-full)' }} />
                  </div>
                  <Skeleton style={{ width: '100%', height: '1rem', marginBottom: 'var(--spacing-2)' }} />
                  <Skeleton style={{ width: '80%', height: '1rem', marginBottom: 'var(--spacing-2)' }} />
                  <div className={styles.skeletonFooter}>
                    <Skeleton style={{ width: '40%', height: '0.875rem' }} />
                    <Skeleton style={{ width: '80px', height: '1.5rem', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={64} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>
                {hasActiveFilters ? 'No Reports Found' : 'No Reports Yet'}
              </h2>
              <p className={styles.emptyDescription}>
                {hasActiveFilters
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Create your first report to start analyzing game film and opponent tendencies.'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus size={16} />
                  Create Your First Report
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.reportsGrid}>
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onView={handleViewReport}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ReportsPage;