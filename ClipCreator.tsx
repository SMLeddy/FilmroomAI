import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Selectable } from 'kysely';
import { GameFilms, Plays, Clips, DownTypeArrayValues, PlayResultTypeArrayValues } from '../helpers/schema';
import { useCreateClip, useUpdateClip } from '../helpers/useClips';
import { VideoPlayer } from './VideoPlayer';
import { VideoTimeline } from './VideoTimeline';
import { Input } from './Input';
import { Button } from './Button';
import { Badge } from './Badge';
import { X, Save, PlusCircle } from 'lucide-react';
import styles from './ClipCreator.module.css';

const clipSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  down: z.enum(DownTypeArrayValues).optional().nullable(),
  distance: z.coerce.number().optional().nullable(),
  yardLine: z.coerce.number().optional().nullable(),
  formation: z.string().optional().nullable(),
  playCall: z.string().optional().nullable(),
  playResult: z.enum(PlayResultTypeArrayValues).optional().nullable(),
  yardsGained: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type ClipFormData = z.infer<typeof clipSchema>;

interface ClipCreatorProps {
  film: Selectable<GameFilms>;
  existingPlays: Selectable<Plays>[];
  onClipCreated: () => void;
  selectedClip?: Selectable<Clips> | null;
  onClearSelection: () => void;
}

export const ClipCreator: React.FC<ClipCreatorProps> = ({
  film,
  existingPlays,
  onClipCreated,
  selectedClip,
  onClearSelection,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const createClipMutation = useCreateClip();
  const updateClipMutation = useUpdateClip();

  const { control, handleSubmit, reset, setValue } = useForm<ClipFormData>({
    resolver: zodResolver(clipSchema),
  });

  useEffect(() => {
    if (selectedClip) {
      setStartTime(Number(selectedClip.startTimeSeconds) ?? 0);
      setEndTime(Number(selectedClip.endTimeSeconds) ?? 0);
      reset({
        title: selectedClip.title || '',
        description: selectedClip.description,
        down: selectedClip.down,
        distance: selectedClip.distance,
        yardLine: selectedClip.yardLine,
        formation: selectedClip.formation,
        playCall: selectedClip.playCall,
        playResult: selectedClip.playResult,
        yardsGained: selectedClip.yardsGained,
        notes: selectedClip.notes,
      });
    } else {
      reset({
        title: '',
        description: '',
        down: null, 
        distance: null, 
        yardLine: null, 
        formation: '', 
        playCall: '', 
        playResult: null, 
        yardsGained: null, 
        notes: ''
      });
      setStartTime(0);
      setEndTime(0);
    }
  }, [selectedClip, reset]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (dur: number) => {
    setDuration(dur);
    if (!selectedClip) {
      setEndTime(dur);
    }
  };

  const onSubmit = (data: ClipFormData) => {
    const clipData = {
      ...data,
      filmId: film.id,
      startTimeSeconds: startTime,
      endTimeSeconds: endTime,
    };

    if (selectedClip) {
      updateClipMutation.mutate({ ...clipData, id: selectedClip.id }, {
        onSuccess: () => {
          onClipCreated();
          onClearSelection();
        }
      });
    } else {
      createClipMutation.mutate(clipData, {
        onSuccess: () => {
          onClipCreated();
          onClearSelection();
        }
      });
    }
  };

  if (!film.filmUrl) {
    return <div className={styles.container}>Video URL not available.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.videoSection}>
        <VideoPlayer
          src={film.filmUrl}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          seekTime={currentTime}
        />
        <VideoTimeline
          currentTime={currentTime}
          duration={duration}
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onCurrentTimeChange={setCurrentTime}
          existingPlays={existingPlays}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formSection}>
        <div className={styles.formHeader}>
          <h3>{selectedClip ? 'Edit Clip' : 'Create New Clip'}</h3>
          {selectedClip && (
            <Button variant="ghost" size="icon-sm" onClick={onClearSelection}>
              <X />
            </Button>
          )}
        </div>
        <div className={styles.formGrid}>
          <Controller name="title" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Title</label>
              <Input {...field} value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="description" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Description</label>
              <Input {...field} value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="down" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Down</label>
              <select {...field} value={field.value ?? ''} className={styles.select}>
                <option value="">-</option>
                {DownTypeArrayValues.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )} />
          <Controller name="distance" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Distance</label>
              <Input {...field} type="number" value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="yardLine" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Yard Line</label>
              <Input {...field} type="number" value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="formation" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Formation</label>
              <Input {...field} value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="playCall" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Play Call</label>
              <Input {...field} value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="playResult" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Play Result</label>
              <select {...field} value={field.value ?? ''} className={styles.select}>
                <option value="">-</option>
                {PlayResultTypeArrayValues.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )} />
          <Controller name="yardsGained" control={control} render={({ field }) => (
            <div className={styles.formField}>
              <label>Yards Gained</label>
              <Input {...field} type="number" value={field.value ?? ''} />
            </div>
          )} />
          <Controller name="notes" control={control} render={({ field }) => (
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label>Notes</label>
              <Input {...field} value={field.value ?? ''} />
            </div>
          )} />
        </div>
        <div className={styles.formActions}>
          <Button type="submit" disabled={createClipMutation.isPending || updateClipMutation.isPending}>
            {selectedClip ? <Save /> : <PlusCircle />}
            {selectedClip ? 'Save Changes' : 'Create Clip'}
          </Button>
        </div>
      </form>
    </div>
  );
};