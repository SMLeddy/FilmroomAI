import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { type UseMutationResult } from '@tanstack/react-query';
import { type Selectable } from 'kysely';
import { type ReportSections } from '../helpers/schema';
import { ReportSectionType, ReportSectionTypeArrayValues } from '../helpers/reportSchema';
import { type InputType as CreateSectionInput } from '../endpoints/report-section-create_POST.schema';
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
import styles from './AddSectionDialog.module.css';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  sectionType: z.enum(ReportSectionTypeArrayValues),
});

type FormData = z.infer<typeof schema>;

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number;
  createSection: UseMutationResult<Selectable<ReportSections>, Error, CreateSectionInput>;
}

export const AddSectionDialog = ({ isOpen, onClose, reportId, createSection }: AddSectionDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      sectionType: 'summary',
    },
  });

  const onSubmit = (data: FormData) => {
    createSection.mutate(
      {
        reportId,
        title: data.title,
        sectionType: data.sectionType,
      },
      {
        onSuccess: () => {
          toast.success('Section created successfully.');
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to create section: ${error.message}`);
        },
      }
    );
  };

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>Choose a title and type for your new report section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="title">Section Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Red Zone Offense Analysis" />
            {errors.title && <p className={styles.error}>{errors.title.message}</p>}
          </div>
          <div className={styles.formGroup}>
            <Label htmlFor="sectionType">Section Type</Label>
            <select id="sectionType" {...register('sectionType')} className={styles.select}>
              {ReportSectionTypeArrayValues.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.sectionType && <p className={styles.error}>{errors.sectionType.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSection.isPending}>
              {createSection.isPending ? 'Adding...' : 'Add Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};