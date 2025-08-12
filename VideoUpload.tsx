import React from 'react';
import { FileDropzone } from './FileDropzone';
import { Skeleton } from './Skeleton';
import { Button } from './Button';
import { Film, UploadCloud, CheckCircle2, XCircle, X } from 'lucide-react';
import styles from './VideoUpload.module.css';

export type UploadStatus = 'idle' | 'processing' | 'success' | 'error';

interface VideoUploadProps {
  className?: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  status: UploadStatus;
  errorMessage?: string;
  progress?: number;
}

// File size constants (in bytes)
const FILE_SIZE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
} as const;

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileSizeStatus = (fileSize: number) => {
  if (fileSize > FILE_SIZE_LIMITS.MAX_SIZE) {
    return 'blocked';
  }
  return 'normal';
};

const getFileSizeMessage = (fileSize: number) => {
  const sizeStatus = getFileSizeStatus(fileSize);
  if (sizeStatus === 'blocked') {
    return `File too large (${formatBytes(fileSize)}). Maximum size is 10GB. Please use a smaller file.`;
  }
  return null;
};

export const VideoUpload: React.FC<VideoUploadProps> = ({
  className,
  file,
  onFileSelect,
  onClear,
  status,
  errorMessage,
  progress = 0,
}) => {
  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Block files that exceed the size limit
      if (file.size > FILE_SIZE_LIMITS.MAX_SIZE) {
        // Don't call onFileSelect, just show error in the dropzone
        return;
      }
      
      onFileSelect(file);
    }
  };

  if (!file) {
    return (
      <div>
        <FileDropzone
          className={className}
          onFilesSelected={handleFilesSelected}
          accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
          maxFiles={1}
          icon={<UploadCloud size={48} />}
          title="Click to upload or drag and drop a video file"
          subtitle="MP4, MOV, AVI, MKV (Max 10GB)"
        />
        <div className={styles.uploadGuidance}>
          <p className={styles.guidanceText}>
            <strong>Large file support:</strong> Upload videos up to 10GB using our direct S3 storage
          </p>
          <p className={styles.guidanceText}>
            Files are uploaded directly to secure cloud storage with real-time progress tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[status]} ${className ?? ''}`}>
      <div className={styles.fileInfo}>
        <Film className={styles.fileIcon} />
        <div className={styles.fileDetails}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={`${styles.fileSize} ${getFileSizeStatus(file.size) === 'blocked' ? styles.fileSizeError : ''}`}>
            {formatBytes(file.size)}
          </span>
          {getFileSizeMessage(file.size) && (
            <span className={`${styles.fileSizeMessage} ${styles.error}`}>
              {getFileSizeMessage(file.size)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.statusSection}>
        {status === 'idle' && (
          <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Remove file">
            <X />
          </Button>
        )}
        {status === 'processing' && (
          <div className={styles.statusIndicator}>
            <div className={styles.progressContainer}>
              <Skeleton className={styles.spinner} />
              <div className={styles.progressInfo}>
                <span>Uploading... {Math.round(progress)}%</span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {status === 'success' && (
          <div className={`${styles.statusIndicator} ${styles.success}`}>
            <CheckCircle2 />
            <span>Upload Complete</span>
          </div>
        )}
        {status === 'error' && (
          <div className={`${styles.statusIndicator} ${styles.error}`}>
            <XCircle />
            <span>{errorMessage || 'Upload Failed'}</span>
            <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear file">
              <X />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};