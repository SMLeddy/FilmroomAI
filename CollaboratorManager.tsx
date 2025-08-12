import React from 'react';
import { useLibraryCollaborators } from '../helpers/libraryHooks';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { X } from 'lucide-react';
import styles from './CollaboratorManager.module.css';
import { CollaborationRole, CollaborationRoleArrayValues } from '../helpers/schema';

interface CollaboratorManagerProps {
  libraryId: number;
}

export const CollaboratorManager = ({ libraryId }: CollaboratorManagerProps) => {
  const { data: collaborators, isLoading, error } = useLibraryCollaborators({ libraryId });

  // TODO: Implement update and remove mutations
  const handleRoleChange = (collaboratorId: number, role: CollaborationRole) => {
    console.log(`Change collaborator ${collaboratorId} to ${role}`);
  };

  const handleRemoveCollaborator = (collaboratorId: number) => {
    console.log(`Remove collaborator ${collaboratorId}`);
  };

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.collaboratorRow}>
            <div className={styles.userInfo}>
              <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div className={styles.userDetails}>
                <Skeleton style={{ height: '16px', width: '120px' }} />
                <Skeleton style={{ height: '14px', width: '150px' }} />
              </div>
            </div>
            <Skeleton style={{ height: '40px', width: '120px' }} />
            <Skeleton style={{ height: '40px', width: '40px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Error loading collaborators: {error.message}</div>;
  }

  return (
    <div className={styles.manager}>
      <ul className={styles.collaboratorList}>
        {collaborators?.map((c) => (
          <li key={c.id} className={styles.collaboratorRow}>
            <div className={styles.userInfo}>
              <Avatar>
                {/* Placeholder for real avatar image */}
                <AvatarFallback>{c.collaboratorEmail.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={styles.userDetails}>
                <span className={styles.userName}>User Name</span>
                <span className={styles.userEmail}>{c.collaboratorEmail}</span>
              </div>
            </div>
            <div className={styles.roleSelector}>
              <Select
                value={c.role}
                onValueChange={(role) => handleRoleChange(c.id, role as CollaborationRole)}
                disabled={c.role === 'owner'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CollaborationRoleArrayValues.map((role) => (
                    <SelectItem key={role} value={role} disabled={role === 'owner'}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveCollaborator(c.id)}
              disabled={c.role === 'owner'}
              aria-label="Remove collaborator"
            >
              <X size={16} />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};