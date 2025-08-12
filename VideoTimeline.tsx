import React, { useRef, useEffect } from 'react';
import { Selectable } from 'kysely';
import { Plays } from '../helpers/schema';
import styles from './VideoTimeline.module.css';

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
  onCurrentTimeChange: (time: number) => void;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  existingPlays: Selectable<Plays>[];
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  startTime,
  endTime,
  onCurrentTimeChange,
  onStartTimeChange,
  onEndTimeChange,
  existingPlays,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    onCurrentTimeChange(duration * percentage);
  };

  const createDragHandler = (setter: (time: number) => void) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const timeline = timelineRef.current;
    if (!timeline) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const moveX = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, moveX / rect.width));
      setter(duration * percentage);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const startPercentage = (startTime / duration) * 100;
  const endPercentage = (endTime / duration) * 100;
  const currentPercentage = (currentTime / duration) * 100;

  return (
    <div ref={timelineRef} className={styles.timelineContainer} onClick={handleTimelineClick}>
      <div className={styles.track}>
        {existingPlays.map(play => {
          const playStart = ((play.videoTimestampStart ?? 0) / duration) * 100;
          const playEnd = ((play.videoTimestampEnd ?? 0) / duration) * 100;
          return (
            <div
              key={play.id}
              className={styles.existingPlaySegment}
              style={{ left: `${playStart}%`, width: `${playEnd - playStart}%` }}
            />
          );
        })}
        <div
          className={styles.selection}
          style={{ left: `${startPercentage}%`, width: `${endPercentage - startPercentage}%` }}
        />
        <div
          className={styles.playhead}
          style={{ left: `${currentPercentage}%` }}
        />
        <div
          className={styles.handle}
          style={{ left: `${startPercentage}%` }}
          onMouseDown={createDragHandler(onStartTimeChange)}
        />
        <div
          className={styles.handle}
          style={{ left: `${endPercentage}%` }}
          onMouseDown={createDragHandler(onEndTimeChange)}
        />
      </div>
    </div>
  );
};