import { useEffect, useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Button, TextField, Typography, Stack, Card, CardContent, CircularProgress } from '@mui/material';
import { CommentItem } from '../types';
import { createComment, replyToComment } from '../services/postsApi';

interface CommentSectionProps {
  comments: CommentItem[];
  postId: string;
  showHint?: boolean;
  userToken?: string;
  onCommentUpdate?: (updatedComment: CommentItem) => void;
}

const pulseCommentForm = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(196, 159, 120, 0.12);
    transform: translateY(0);
  }

  50% {
    box-shadow: 0 0 0 14px rgba(196, 159, 120, 0.08);
    transform: translateY(-2px);
  }
`;

export default function CommentSection({ comments, postId, showHint = false, userToken, onCommentUpdate }: CommentSectionProps) {
  const [localComments, setLocalComments] = useState<CommentItem[]>(comments);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [showCommentHint, setShowCommentHint] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (!showHint) {
      setShowCommentHint(false);
      return;
    }

    setShowCommentHint(true);
    const timeoutId = window.setTimeout(() => setShowCommentHint(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [showHint]);

  const sortedComments = useMemo(
    () => [...localComments].sort((a, b) => a.date.localeCompare(b.date)).reverse(),
    [localComments]
  );

  const addComment = async () => {
    if (!name.trim() || !message.trim() || !messageTitle.trim()) return;

    const fallbackComment = {
      id: `c-${Date.now()}`,
      author: name.trim(),
      date: new Date().toISOString().slice(0, 10),
      text: message.trim(),
      title: messageTitle.trim(),
      likes: 0
    };

    try {
      const savedComment = await createComment(postId, {
        username: name.trim(),
        description: message.trim(),
        title: messageTitle.trim()
      });
      setLocalComments((current) => [savedComment, ...current]);
      setName('');
      setMessage('');
      setMessageTitle('');
    } catch {
      setLocalComments((current) => [fallbackComment, ...current]);
      setName('');
      setMessage('');
      setMessageTitle('');
    }
  };

  const likeComment = (id: string) => {
    setLocalComments((current) =>
      current.map((comment) =>
        comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
  };

  const submitReply = async (commentId: string) => {
    if (!replyText.trim() || !userToken) return;

    setSubmittingReply(true);
    try {
      const updatedComment = await replyToComment(postId, commentId, replyText.trim(), userToken);
      setLocalComments((current) =>
        current.map((comment) => (comment.id === commentId ? updatedComment : comment))
      );
      onCommentUpdate?.(updatedComment);
      setReplyingTo(null);
      setReplyText('');
    } catch {
      // Error handled silently
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        মন্তব্য
      </Typography>
      <Stack
        spacing={2}
        sx={{
          mb: 3,
          color: 'var(--batayan-text)',
          bgcolor: 'var(--batayan-card)',
          p: 2,
          borderRadius: 2,
          border: '1px solid var(--batayan-border)',
          animation: showCommentHint ? `${pulseCommentForm} 1.8s ease-in-out infinite` : 'none'
        }}
      >
        <TextField
          label="আপনার নাম"
          value={name}
          size="small"
          onChange={(event) => setName(event.target.value)}
          sx={{color: 'var(--batayan-text)'}}
        />
        <TextField
          label="শিরোনাম"
          value={messageTitle}
          size="small"
          onChange={(event) => setMessageTitle(event.target.value)}
          sx={{color: 'var(--batayan-text)'}}
        />
        <TextField
          label="আপনার মতামত"
          value={message}
          multiline
          rows={3}
          onChange={(event) => setMessage(event.target.value)}
          sx={{color: 'var(--batayan-text)'}}
        />
        <Button variant="contained" onClick={addComment} disabled={!name || !message} sx={{color: 'var(--batayan-text)'}}>
          মতামত জানান
        </Button>
      </Stack>

      <Stack spacing={2}>
        {sortedComments.map((comment) => (
          <Card key={comment.id} elevation={1}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2">{comment.author}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {comment.date}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
                {comment.title}
              </Typography>
              <Typography sx={{ mt: 1 }}>{comment.text}</Typography>
              {comment.reply && (
                <Box sx={{ mt: 1, p: 2, bgcolor: '#F7E6D6', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    উত্তর: {comment.reply}
                  </Typography>
                </Box>
              )}
              {userToken && !comment.reply && (
                <>
                  {replyingTo === comment.id ? (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <TextField
                        label="উত্তর লিখুন"
                        value={replyText}
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        onChange={(event) => setReplyText(event.target.value)}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyText.trim() || submittingReply}
                        >
                          {submittingReply ? <CircularProgress size={20} /> : 'উত্তর দিন'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          বাতিল
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Button size="small" sx={{ mt: 1 }} onClick={() => setReplyingTo(comment.id)}>
                      উত্তর দিন
                    </Button>
                  )}
                </>
              )}
              {/* <Button sx={{ mt: 1 }} size="small" onClick={() => likeComment(comment.id)}>
                Like {comment.likes}
              </Button> */}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
