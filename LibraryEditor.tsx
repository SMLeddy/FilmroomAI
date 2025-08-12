import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from './Form';
import { useCreateLibrary, useUpdateLibrary, useLibraries } from '../helpers/libraryHooks';
import { LibraryTypeArrayValues } from '../helpers/schema';
import { Button } from './Button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Skeleton } from './Skeleton';
import styles from './LibraryEditor.module.css';

const librarySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  libraryType: z.enum(LibraryTypeArrayValues, {
    errorMap: () => ({ message: 'Please select a library type.' }),
  }),
});

type LibraryFormValues = z.infer<typeof librarySchema>;

interface LibraryEditorProps {
  libraryId: number | null;
  onClose: () => void;
}

export const LibraryEditor = ({ libraryId, onClose }: LibraryEditorProps) => {
  const isEditing = libraryId !== null;

  const { data: libraries, isLoading: isLoadingLibrary } = useLibraries();
  const existingLibrary = libraries?.find(lib => lib.id === libraryId);

  const createMutation = useCreateLibrary();
  const updateMutation = useUpdateLibrary();

  const form = useForm({
    schema: librarySchema,
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isEditing && existingLibrary) {
      form.setValues({
        title: existingLibrary.title,
        description: existingLibrary.description || '',
        libraryType: existingLibrary.libraryType,
      });
    }
  }, [existingLibrary, isEditing, form.setValues]);

  const onSubmit = (values: LibraryFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { libraryId, ...values },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(values, { onSuccess: onClose });
    }
  };

  if (isLoadingLibrary) {
    return (
      <div className={styles.editor}>
        <Skeleton style={{ height: '2.5rem', marginBottom: '1rem' }} />
        <Skeleton style={{ height: '6rem', marginBottom: '1rem' }} />
        <Skeleton style={{ height: '2.5rem' }} />
      </div>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.editor}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormItem name="title">
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Week 3 Scouting Report"
                value={form.values.title}
                onChange={(e) => form.setValues((prev) => ({ ...prev, title: e.target.value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="description">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add a brief description of this library's purpose."
                value={form.values.description}
                onChange={(e) => form.setValues((prev) => ({ ...prev, description: e.target.value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="libraryType">
            <FormLabel>Library Type</FormLabel>
            <Select
              onValueChange={(value) => form.setValues((prev) => ({ ...prev, libraryType: value as any }))}
              value={form.values.libraryType}
              disabled={isEditing}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LibraryTypeArrayValues.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Library'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};