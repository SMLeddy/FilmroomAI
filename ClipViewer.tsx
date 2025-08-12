import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Selectable } from 'kysely';
import { Clips, DownTypeArrayValues, PlayResultTypeArrayValues } from '../helpers/schema';
import { useUpdateClip } from '../helpers/useClips';
import { schema as updateClipSchema } from '../endpoints/clip-update_POST.schema';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Label } from './Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { VideoPlayer } from './VideoPlayer';
import styles from './ClipViewer.module.css';

type ClipViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  clip: Selectable<Clips>;
  videoSrc: string;
  className?: string;
};

// We only need a subset of the update schema for the form
const formSchema = updateClipSchema.pick({
  title: true,
  description: true,
  down: true,
  distance: true,
  yardLine: true,
  formation: true,
  playCall: true,
  playResult: true,
  yardsGained: true,
  notes: true,
  quarter: true,
});

type FormValues = z.infer<typeof formSchema>;

export const ClipViewer: React.FC<ClipViewerProps> = ({ isOpen, onClose, clip, videoSrc, className }) => {
  const { mutate: updateClip, isPending: isUpdating } = useUpdateClip();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: clip.title ?? '',
      description: clip.description ?? null,
      down: clip.down ?? null,
      distance: clip.distance ?? null,
      yardLine: clip.yardLine ?? null,
      formation: clip.formation ?? null,
      playCall: clip.playCall ?? null,
      playResult: clip.playResult ?? null,
      yardsGained: clip.yardsGained ?? null,
      notes: clip.notes ?? null,
      quarter: clip.quarter ?? null,
    },
  });

  useEffect(() => {
    if (clip) {
      reset({
        title: clip.title ?? '',
        description: clip.description ?? null,
        down: clip.down ?? null,
        distance: clip.distance ?? null,
        yardLine: clip.yardLine ?? null,
        formation: clip.formation ?? null,
        playCall: clip.playCall ?? null,
        playResult: clip.playResult ?? null,
        yardsGained: clip.yardsGained ?? null,
        notes: clip.notes ?? null,
        quarter: clip.quarter ?? null,
      });
    }
  }, [clip, reset]);

  const onSubmit = (data: FormValues) => {
    updateClip(
      { id: clip.id, ...data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={`${styles.content} ${className ?? ''}`}>
          <header className={styles.header}>
            <Dialog.Title className={styles.title}>
              {clip.title || 'Untitled Clip'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <X />
              </Button>
            </Dialog.Close>
          </header>

          <div className={styles.main}>
            <div className={styles.videoSection}>
              <VideoPlayer
                src={videoSrc}
                isPlaying={false}
                onPlayPause={() => {}}
                onTimeUpdate={() => {}}
                onDurationChange={() => {}}
                seekTime={Number(clip.startTimeSeconds) ?? 0}
              />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.formSection}>
              <div className={styles.formGrid}>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register('title')} />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} rows={2} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="down">Down</Label>
                  <Controller
                    name="down"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <SelectTrigger id="down">
                          <SelectValue placeholder="Select down..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DownTypeArrayValues.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Input id="quarter" type="number" {...register('quarter', { valueAsNumber: true })} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="distance">Distance</Label>
                  <Input id="distance" type="number" {...register('distance', { valueAsNumber: true })} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="yardLine">Yard Line</Label>
                  <Input id="yardLine" type="number" {...register('yardLine', { valueAsNumber: true })} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="yardsGained">Yards Gained</Label>
                  <Input id="yardsGained" type="number" {...register('yardsGained', { valueAsNumber: true })} />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="formation">Formation</Label>
                  <Input id="formation" {...register('formation')} />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="playCall">Play Call</Label>
                  <Input id="playCall" {...register('playCall')} />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="playResult">Play Result</Label>
                   <Controller
                    name="playResult"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <SelectTrigger id="playResult">
                          <SelectValue placeholder="Select result..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PlayResultTypeArrayValues.map((r) => (
                            <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...register('notes')} rows={4} />
                </div>
              </div>
              <footer className={styles.footer}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating || !isDirty}>
                  {isUpdating ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </Button>
              </footer>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};