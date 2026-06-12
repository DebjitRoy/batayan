import { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Card, CardContent } from '@mui/material';
import { CommentItem } from '../types';
import { createComment } from '../services/postsApi';

interface CommentSectionProps {
  comments: CommentItem[];
  postId: string;
}

export default function CommentSection({ comments, postId }: CommentSectionProps) {
  const [localComments, setLocalComments] = useState<CommentItem[]>(comments);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const sortedComments = useMemo(
    () => [...localComments].sort((a, b) => a.date.localeCompare(b.date)).reverse(),
    [localComments]
  );

  const addComment = async () => {
    if (!name.trim() || !message.trim()) return;

    const fallbackComment = {
      id: `c-${Date.now()}`,
      author: name.trim(),
      date: new Date().toISOString().slice(0, 10),
      text: message.trim(),
      likes: 0
    };

    try {
      const savedComment = await createComment(postId, {
        username: name.trim(),
        description: message.trim()
      });
      setLocalComments((current) => [savedComment, ...current]);
      setName('');
      setMessage('');
    } catch {
      setLocalComments((current) => [fallbackComment, ...current]);
      setName('');
      setMessage('');
    }
  };

  const likeComment = (id: string) => {
    setLocalComments((current) =>
      current.map((comment) =>
        comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        মন্তব্য
      </Typography>
      <Stack spacing={2} sx={{ mb: 3, color: 'var(--batayan-text)', bgcolor: 'var(--batayan-card)', p: 2, borderRadius: 2 }}>
        <TextField
          label="আপনার নাম"
          value={name}
          size="small"
          onChange={(event) => setName(event.target.value)}
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
              <Typography sx={{ mt: 1 }}>{comment.text}</Typography>
              {comment.reply && (
                <Box sx={{ mt: 1, p: 2, bgcolor: '#F7E6D6', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    উত্তর: {comment.reply}
                  </Typography>
                </Box>
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
