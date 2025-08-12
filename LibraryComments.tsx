import React, { useState } from 'react';
import { useLibraryComments, useCreateLibraryComment } from '../helpers/libraryHooks';
import { Avatar, AvatarFallback } from './Avatar';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Skeleton } from './Skeleton';
import styles from './LibraryComments.module.css';

interface LibraryCommentsProps {
  libraryItemId: number;
}

export const LibraryComments = ({ libraryItemId }: LibraryCommentsProps) => {
  const { data: comments, isLoading, error } = useLibraryComments({ libraryItemId });
  const createCommentMutation = useCreateLibraryComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(
        { libraryItemId, content: newComment.trim() },
        {
          onSuccess: () => setNewComment(''),
        }
      );
    }
  };

  return (
    <div className={styles.commentsSection}>
      <h4 className={styles.title}>Comments</h4>
      <div className={styles.commentList}>
        {isLoading && (
          <>
            <div className={styles.comment}>
              <Skeleton style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div className={styles.commentContent}>
                <Skeleton style={{ height: '16px', width: '100px', marginBottom: '8px' }} />
                <Skeleton style={{ height: '14px', width: '80%' }} />
              </div>
            </div>
          </>
        )}
        {error && <p className={styles.error}>Error loading comments.</p>}
        {comments?.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <Avatar className={styles.commentAvatar}>
              <AvatarFallback>{comment.authorEmail.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={styles.commentContent}>
              <div className={styles.commentHeader}>
                <span className={styles.author}>{comment.authorEmail}</span>
                <span className={styles.timestamp}>
                  {new Date(comment.createdAt!).toLocaleString()}
                </span>
              </div>
              <p className={styles.commentText}>{comment.content}</p>
            </div>
          </div>
        ))}
        {comments?.length === 0 && !isLoading && <p className={styles.noComments}>No comments yet.</p>}
      </div>
      <form onSubmit={handleSubmitComment} className={styles.commentForm}>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          disabled={createCommentMutation.isPending}
        />
        <Button type="submit" disabled={!newComment.trim() || createCommentMutation.isPending}>
          {createCommentMutation.isPending ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </div>
  );
};