import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  className?: string;
  src: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  seekTime?: number;
  filmId?: number; // For S3 URL refresh
}

const formatTime = (timeInSeconds: number) => {
  const floored = Math.floor(timeInSeconds);
  const minutes = Math.floor(floored / 60);
  const seconds = floored % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const isDataUrl = (url: string): boolean => {
  return url.startsWith('data:');
};

const isS3PresignedUrl = (url: string): boolean => {
  return url.includes('amazonaws.com') && url.includes('X-Amz-Signature');
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  className,
  src,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onDurationChange,
  seekTime,
  filmId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const urlRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [urlGeneratedAt, setUrlGeneratedAt] = useState<Date | null>(null);

  // Auto-refresh presigned URLs before they expire
  const scheduleUrlRefresh = useCallback(() => {
    if (!isS3PresignedUrl(currentSrc) || !filmId) return;

    // Clear existing timeout
    if (urlRefreshTimeoutRef.current) {
      clearTimeout(urlRefreshTimeoutRef.current);
    }

    // Schedule refresh 5 minutes before expiration (assuming 1 hour expiration)
    const refreshDelay = 55 * 60 * 1000; // 55 minutes
    urlRefreshTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/_api/films?filmId=${filmId}`);
        if (!response.ok) throw new Error('Failed to refresh video URL');
        
        const films = await response.json();
        if (films.length > 0 && films[0].streamingUrl) {
          const currentVideoTime = videoRef.current?.currentTime || 0;
          setCurrentSrc(films[0].streamingUrl);
          setUrlGeneratedAt(new Date());
          
          // Restore video position after URL refresh
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = currentVideoTime;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Failed to refresh video URL:', error);
        setError('Video URL expired. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }, refreshDelay);
  }, [currentSrc, filmId]);

  // Update current src when prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setError(null);
    setUrlGeneratedAt(new Date());
  }, [src]);

  // Schedule URL refresh for S3 URLs
  useEffect(() => {
    scheduleUrlRefresh();
    return () => {
      if (urlRefreshTimeoutRef.current) {
        clearTimeout(urlRefreshTimeoutRef.current);
      }
    };
  }, [scheduleUrlRefresh]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
      onDurationChange(video.duration);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      const target = e.target as HTMLVideoElement;
      const errorCode = target.error?.code;
      let errorMessage = 'Failed to load video';
      
      switch (errorCode) {
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video source not supported';
          break;
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading was aborted';
          break;
      }
      
      setError(errorMessage);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleDurationChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleDurationChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [onTimeUpdate, onDurationChange]);

  useEffect(() => {
    if (videoRef.current && !error) {
      if (isPlaying) {
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
          setError("Failed to play video. Please try again.");
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, error]);

  useEffect(() => {
    if (videoRef.current && seekTime !== undefined && !error) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime, error]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div ref={containerRef} className={`${styles.videoContainer} ${className ?? ''}`}>
      <video
        ref={videoRef}
        src={currentSrc}
        className={styles.videoElement}
        onClick={onPlayPause}
        crossOrigin="anonymous"
        preload="metadata"
        playsInline
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.spinner} />
          <span>Loading video...</span>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className={styles.errorOverlay}>
          <AlertCircle className={styles.errorIcon} />
          <span className={styles.errorMessage}>{error}</span>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      )}

      <div className={styles.controlsOverlay}>
        <div className={styles.controls}>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onPlayPause}
            disabled={!!error}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <div className={styles.timeDisplay}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className={styles.spacer}></div>
          {isS3PresignedUrl(currentSrc) && urlGeneratedAt && (
            <div className={styles.urlInfo}>
              URL expires: {new Date(urlGeneratedAt.getTime() + 60 * 60 * 1000).toLocaleTimeString()}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={toggleMute}
            disabled={!!error}
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>
    </div>
  );
};