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
  // Organize comments in tree structure
  const commentTree = useMemo(() => {
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
  }, [comments]);

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