import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from './Form';
import { useInviteCollaborator } from '../helpers/libraryHooks';
import { CollaborationRoleArrayValues, CollaborationRole } from '../helpers/schema';
import { Button } from './Button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { ShareLinkManager } from './ShareLinkManager';
import { Users, Link } from 'lucide-react';
import styles from './ShareLibrary.module.css';

const shareSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(CollaborationRoleArrayValues),
});

type ShareFormValues = z.infer<typeof shareSchema>;

interface ShareLibraryProps {
  libraryId: number;
  libraryTitle: string;
}

export const ShareLibrary = ({ libraryId, libraryTitle }: ShareLibraryProps) => {
  const [activeTab, setActiveTab] = useState('collaborators');
  const inviteMutation = useInviteCollaborator();

  const form = useForm({
    schema: shareSchema,
    defaultValues: {
      email: '',
      role: 'viewer' as CollaborationRole,
    },
  });

  const onSubmit = (values: ShareFormValues) => {
    inviteMutation.mutate(
      {
        libraryId,
        collaboratorEmail: values.email,
        role: values.role,
      },
      {
        onSuccess: () => {
          form.setValues({ email: '', role: 'viewer' });
        },
      }
    );
  };

  const isLoading = inviteMutation.isPending;

  // Mock data for existing share links - in a real implementation, this would come from a query
  const existingLinks = [
    {
      id: 1,
      shareId: 'abc123',
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-02-15'),
      accessCount: 12,
    },
    {
      id: 2,
      shareId: 'def456',
      createdAt: new Date('2024-01-10'),
      expiresAt: null,
      accessCount: 5,
    },
  ];

  const handleRevokeLink = (linkId: number) => {
    // In a real implementation, this would call a revoke mutation
    console.log('Revoking link:', linkId);
  };

  return (
    <div className={styles.shareContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Share "{libraryTitle}"</h3>
        <p className={styles.description}>
          Choose how you'd like to share this library with others.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="collaborators" className={styles.tabTrigger}>
            <Users size={16} />
            Invite Collaborators
          </TabsTrigger>
          <TabsTrigger value="links" className={styles.tabTrigger}>
            <Link size={16} />
            Share Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collaborators" className={styles.tabContent}>
          <div className={styles.collaboratorSection}>
            <h4 className={styles.sectionTitle}>Invite Collaborators</h4>
            <p className={styles.sectionDescription}>
              Share this library with other coaches by entering their email address.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.inputGroup}>
                  <FormItem name="email" className={styles.emailInput}>
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="coach@example.com"
                        value={form.values.email}
                        onChange={(e) => form.setValues((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem name="role">
                    <FormLabel className="sr-only">Role</FormLabel>
                    <Select
                      onValueChange={(value) => form.setValues((prev) => ({ ...prev, role: value as any }))}
                      value={form.values.role}
                    >
                      <FormControl>
                        <SelectTrigger className={styles.roleSelect}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CollaborationRoleArrayValues.filter(r => r !== 'owner').map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </div>
                <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                  {isLoading ? 'Sending Invite...' : 'Send Invite'}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>

        <TabsContent value="links" className={styles.tabContent}>
          <ShareLinkManager
            libraryId={libraryId}
            libraryTitle={libraryTitle}
            existingLinks={existingLinks}
            onRevokeLink={handleRevokeLink}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};