import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { type UseMutationResult } from '@tanstack/react-query';
import { type Selectable } from 'kysely';
import { type ReportSections } from '../helpers/schema';
import { type InputType as UpdateSectionInput } from '../endpoints/report-section-update_POST.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import styles from './EditSectionDialog.module.css';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type FormData = z.infer<typeof schema>;

interface EditSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  section: Selectable<ReportSections>;
  updateSection: UseMutationResult<Selectable<ReportSections>, Error, UpdateSectionInput>;
}

export const EditSectionDialog = ({ isOpen, onClose, section, updateSection }: EditSectionDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ title: section.title });
    }
  }, [isOpen, section, reset]);

  const onSubmit = (data: FormData) => {
    updateSection.mutate(
      {
        id: section.id,
        title: data.title,
      },
      {
        onSuccess: () => {
          toast.success('Section updated successfully.');
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to update section: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section Title</DialogTitle>
          <DialogDescription>Update the title for this report section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="edit-title">Section Title</Label>
            <Input id="edit-title" {...register('title')} />
            {errors.title && <p className={styles.error}>{errors.title.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSection.isPending}>
              {updateSection.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};