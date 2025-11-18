import React, { useMemo } from 'react';
import { type Comment } from '../../data/mockComments';
import CommentItem from './CommentItem';

interface CommentsListProps {
  comments: Comment[];
  onReply: (commentData: any) => Promise<void>;
  user?: any;
  showNotification: (notification: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, onReply, user, showNotification }) => {
  // Allow lists that already contain nested replies (from backend) to render directly
  const hasPrecomputedHierarchy = useMemo(
    () => comments.some(comment => comment.replies && comment.replies.length > 0),
    [comments]
  );

  // Organize comments in tree structure when data is flat
  const commentTree = useMemo(() => {
    if (hasPrecomputedHierarchy) {
      return comments as CommentWithReplies[];
    }

    const rootComments = comments.filter(c => !c.parentId);
    
    const buildReplies = (parentId: number): CommentWithReplies[] => {
      return comments
        .filter(c => c.parentId === parentId)
        .map(comment => ({
          ...comment,
          replies: buildReplies(comment.id)
        }));
    };

    return rootComments.map(comment => ({
      ...comment,
      replies: buildReplies(comment.id)
    }));
  }, [comments, hasPrecomputedHierarchy]);

  return (
    <div className="space-y-6">
      {commentTree.map((comment, index) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          user={user}
          depth={0}
          index={index}
          showNotification={showNotification}
        />
      ))}
    </div>
  );
};

export default CommentsList;