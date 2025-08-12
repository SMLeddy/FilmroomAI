import React, { useState } from 'react';
import { z } from 'zod';
import { FileDown, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from './Dialog';
import { Button } from './Button';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Switch } from './Switch';
import { Label } from './Label';
import { useLibraryExport } from '../helpers/useLibraryExport';
import { ExportFormatArray } from '../endpoints/library-export_POST.schema';
import styles from './ExportLibraryDialog.module.css';

type ExportFormat = typeof ExportFormatArray[number];

const exportSchema = z.object({
  format: z.enum(ExportFormatArray, { required_error: "Please select an export format." }),
  includeNotes: z.boolean(),
  includeMetadata: z.boolean(),
});

type ExportFormValues = z.infer<typeof exportSchema>;

interface ExportLibraryDialogProps {
  libraryId: number;
  libraryTitle: string;
  className?: string;
}

export const ExportLibraryDialog = ({ libraryId, libraryTitle, className }: ExportLibraryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const exportMutation = useLibraryExport();

  const form = useForm({
    schema: exportSchema,
    defaultValues: {
      format: 'csv' as ExportFormat,
      includeNotes: true,
      includeMetadata: true,
    },
  });

  const onSubmit = (values: ExportFormValues) => {
    exportMutation.mutate(
      {
        libraryId,
        ...values,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          form.setValues(form.defaultValues as ExportFormValues);
        },
      }
    );
  };

  const isLoading = exportMutation.isPending;
  const selectedFormat = form.values.format;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <FileDown size={16} />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Export Library</DialogTitle>
          <DialogDescription>
            Export "{libraryTitle}" in your desired format with custom options.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormItem name="format">
              <FormLabel>Export Format</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => form.setValues((prev) => ({ ...prev, format: value as ExportFormat }))}
                  value={form.values.format}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="json">JSON (Raw Data)</SelectItem>
                    <SelectItem value="pdf">PDF (Summary)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>

            {selectedFormat === 'csv' && (
              <div className={styles.optionsContainer}>
                <h3 className={styles.optionsTitle}>CSV Options</h3>
                <div className={styles.switchItem}>
                  <FormControl>
                    <Switch
                      id="include-notes"
                      checked={form.values.includeNotes}
                      onCheckedChange={(checked) => form.setValues((prev) => ({ ...prev, includeNotes: checked }))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <Label htmlFor="include-notes" className={styles.switchLabel}>Include Notes</Label>
                </div>
                <div className={styles.switchItem}>
                  <FormControl>
                    <Switch
                      id="include-metadata"
                      checked={form.values.includeMetadata}
                      onCheckedChange={(checked) => form.setValues((prev) => ({ ...prev, includeMetadata: checked }))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <Label htmlFor="include-metadata" className={styles.switchLabel}>Include Play Metadata</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} />
                    Exporting...
                  </>
                ) : (
                  'Export'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};