import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Copy, Link, Calendar, KeyRound, Trash2, Eye } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Switch } from './Switch';
import { useCreateShareLink } from '../helpers/shareLinkHooks';
import styles from './ShareLinkManager.module.css';

// This schema is a placeholder. In a real implementation, this would be part of a GET endpoint.
const existingLinkSchema = z.object({
  id: z.number(),
  shareId: z.string(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),
  accessCount: z.number(),
});
type ExistingLink = z.infer<typeof existingLinkSchema>;

interface ShareLinkManagerProps {
  libraryId: number;
  libraryTitle: string;
  existingLinks: ExistingLink[]; // This would come from a query
  onRevokeLink: (linkId: number) => void;
}

const formSchema = z.object({
  hasExpiry: z.boolean(),
  expiresAt: z.string().optional(),
  hasPassword: z.boolean(),
  password: z.string().optional(),
}).refine(data => !data.hasExpiry || (data.hasExpiry && data.expiresAt), {
  message: "Expiration date is required",
  path: ["expiresAt"],
}).refine(data => !data.hasPassword || (data.hasPassword && data.password && data.password.length >= 6), {
  message: "Password must be at least 6 characters",
  path: ["password"],
});

type FormValues = z.infer<typeof formSchema>;

export const ShareLinkManager: React.FC<ShareLinkManagerProps> = ({ libraryId, libraryTitle, existingLinks, onRevokeLink }) => {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const createShareLinkMutation = useCreateShareLink();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasExpiry: false,
      expiresAt: '',
      hasPassword: false,
      password: '',
    },
  });

  const hasExpiry = watch('hasExpiry');
  const hasPassword = watch('hasPassword');

  const onSubmit = (data: FormValues) => {
    createShareLinkMutation.mutate({
      libraryId,
      expiresAt: data.hasExpiry && data.expiresAt ? new Date(data.expiresAt) : null,
      password: data.hasPassword ? data.password : null,
    }, {
      onSuccess: (newLink) => {
        const url = `${window.location.origin}/shared/${newLink.shareId}`;
        setGeneratedLink(url);
        toast.success("Share link created!");
      },
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Share "{libraryTitle}"</h3>
        <p className={styles.description}>Generate a public link to share this library with others.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.option}>
          <div className={styles.optionHeader}>
            <Calendar size={16} />
            <Label htmlFor="hasExpiry" className={styles.label}>Set expiration date</Label>
          </div>
          <Controller name="hasExpiry" control={control} render={({ field }) => <Switch id="hasExpiry" checked={field.value} onCheckedChange={field.onChange} />} />
        </div>
        {hasExpiry && (
          <div className={styles.formGroup}>
            <Controller name="expiresAt" control={control} render={({ field }) => <Input type="datetime-local" {...field} />} />
            {errors.expiresAt && <p className={styles.error}>{errors.expiresAt.message}</p>}
          </div>
        )}

        <div className={styles.option}>
          <div className={styles.optionHeader}>
            <KeyRound size={16} />
            <Label htmlFor="hasPassword" className={styles.label}>Protect with password</Label>
          </div>
          <Controller name="hasPassword" control={control} render={({ field }) => <Switch id="hasPassword" checked={field.value} onCheckedChange={field.onChange} />} />
        </div>
        {hasPassword && (
          <div className={styles.formGroup}>
            <Controller name="password" control={control} render={({ field }) => <Input type="password" placeholder="Enter a strong password" {...field} />} />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>
        )}

        <Button type="submit" disabled={createShareLinkMutation.isPending} className={styles.submitButton}>
          {createShareLinkMutation.isPending ? 'Generating...' : 'Generate Link'}
        </Button>
      </form>

      {generatedLink && (
        <div className={styles.generatedLinkContainer}>
          <p className={styles.generatedLinkHeader}>Your link is ready:</p>
          <div className={styles.linkBox}>
            <Link size={16} className={styles.linkIcon} />
            <span className={styles.linkText}>{generatedLink}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => handleCopyToClipboard(generatedLink)}>
              <Copy size={14} />
            </Button>
          </div>
        </div>
      )}

      {existingLinks.length > 0 && (
        <div className={styles.existingLinksSection}>
          <h4 className={styles.sectionTitle}>Active Links</h4>
          <ul className={styles.linkList}>
            {existingLinks.map(link => (
              <li key={link.id} className={styles.linkItem}>
                <div className={styles.linkInfo}>
                  <span className={styles.linkUrl}>{`${window.location.origin}/shared/${link.shareId}`}</span>
                  <span className={styles.linkMeta}>
                    Created: {new Date(link.createdAt).toLocaleDateString()}
                    {link.expiresAt && ` | Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                  </span>
                </div>
                <div className={styles.linkStats}>
                  <Eye size={14} />
                  <span>{link.accessCount} views</span>
                </div>
                <div className={styles.linkActions}>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleCopyToClipboard(`${window.location.origin}/shared/${link.shareId}`)}>
                    <Copy size={14} />
                  </Button>
                  <Button variant="destructive" size="icon-sm" onClick={() => onRevokeLink(link.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};