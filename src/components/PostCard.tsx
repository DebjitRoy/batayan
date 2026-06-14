import { Link as RouterLink } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Chip, Stack, Box, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card
      component={motion.div}
      initial="rest"
      whileHover="open"
      whileTap="open"
      elevation={2}
      sx={{ borderRadius: 3, overflow: 'hidden' }}
    >
      <CardActionArea component={RouterLink} to={`/post/${post.id}`}>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia component="img" height="220" image={post.heroImage} alt={post.title} />
          <Box
            component={motion.div}
            variants={{ rest: { scaleX: 1, opacity: 0.16 }, open: { scaleX: 0.08, opacity: 0.04 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: 'absolute',
              inset: 0,
              right: '50%',
              transformOrigin: 'left',
              bgcolor: 'var(--batayan-pane)',
              borderRight: '1px solid rgba(255,255,255,0.38)',
              pointerEvents: 'none'
            }}
          />
          <Box
            component={motion.div}
            variants={{ rest: { scaleX: 1, opacity: 0.16 }, open: { scaleX: 0.08, opacity: 0.04 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: 'absolute',
              inset: 0,
              left: '50%',
              transformOrigin: 'right',
              bgcolor: 'var(--batayan-pane)',
              borderLeft: '1px solid rgba(255,255,255,0.38)',
              pointerEvents: 'none'
            }}
          />
        </Box>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="caption" sx={{ color: 'var(--batayan-accent)', fontWeight: 600 }}>
              {post.postedDate}
            </Typography>
            {post.series && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label="ধারাবাহিক" size="small" color="warning" />
                <Chip
                  label={
                    post.series ? `${post.series.title} — Part ${post.series.part}` : String((post.series as any)?.title ?? '')
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
            <Typography variant="h6" component="div">
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.summary}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {post.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
