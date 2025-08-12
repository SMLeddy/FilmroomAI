import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { getReports } from '../endpoints/reports_GET.schema';
import { ReportManager } from '../components/ReportManager';
import styles from './reports.$reportId.module.css';

/**
 * ReportDetailPage is the page component for viewing a single report.
 * It fetches the report's metadata to set the document head tags (title, etc.)
 * and renders the ReportManager component which handles the display and
 * management of the report's content.
 */
const ReportDetailPage = () => {
  const { reportId } = useParams<{reportId: string;}>();
  const numericReportId = reportId ? parseInt(reportId, 10) : 0;

  const { data: report, isFetching } = useQuery({
    queryKey: ['reports', { id: numericReportId }],
    queryFn: () => getReports({ id: numericReportId }),
    enabled: !!numericReportId,
    select: (data) => data?.[0],
    placeholderData: (prev) => prev
  });

  const getPageTitle = () => {
    if (isFetching && !report) {
      return 'Loading Report... | Football Game Film Analysis';
    }
    if (report) {
      return `${report.title} | Football Game Film Analysis`;
    }
    return 'Report Not Found | Football Game Film Analysis';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={`View and manage the report: ${report?.title ?? '...'}`} />
      </Helmet>
      <div className={styles.container}>
        <ReportManager />
      </div>
    </>);

};

export default ReportDetailPage;