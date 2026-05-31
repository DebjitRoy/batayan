import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { CommentItem, Post } from '../types';
import SectionRenderer from '../components/SectionRenderer';
import CommentSection from '../components/CommentSection';
import { fetchComments, fetchPost } from '../services/postsApi';

interface PostPageProps {
  posts: Post[];
  fontSize: number;
}

export default function PostPage({ posts }: PostPageProps) {
  const { postId } = useParams<{ postId: string }>();
  const listPost = useMemo(() => posts.find((item) => item.id === postId), [posts, postId]);
  const [post, setPost] = useState<Post | undefined>(listPost);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const related = useMemo(
    () => posts.filter((item) => item.section === post?.section && item.id !== post?.id).slice(0, 4),
    [posts, post]
  );

  useEffect(() => {
    setPost(listPost);
  }, [listPost]);

  // Scroll to top whenever the postId changes (navigating to a new post)
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // no-op in environments without window
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchPost(postId), fetchComments(postId)])
      .then(([apiPost, apiComments]) => {
        if (!isMounted) return;
        setPost({ ...apiPost, comments: apiComments });
        setComments(apiComments);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('পোস্টটি লাইভ API থেকে লোড করা যায়নি।');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (!post) {
    return (
      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
        {isLoading ? <CircularProgress /> : <Typography>পোস্ট পাওয়া যায়নি।</Typography>}
        {error && <Alert severity="warning">{error}</Alert>}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {error && <Alert severity="warning">{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2, pt:1}}>
        <Typography variant="h4">
          {post.title}
        </Typography>
        <Typography color="text.secondary">
          প্রকাশিত: {post.postedDate} • আপডেট: {post.addedDate}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={post.section} />
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined" />
          ))}
        </Stack>
      </Box>

      <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 22px 50px rgba(46,29,20,0.12)' }}>
        <img src={post.heroImage} alt={post.title} style={{ width: '100%', display: 'block' }} />
        {post.photographer && (
          <Typography sx={{ p: 1, fontSize: 13, color: 'var(--batayan-muted)' }}>{post.photographer}</Typography>
        )}
      </Box>


      <Box>
        <SectionRenderer sections={post.sections} />
      </Box>
      {related.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            এইরকম আরো কিছু
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ overflowX: { xs: 'visible', sm: 'auto' }, py: 1 }}>
            {related.map((item) => (
              <Box
                key={item.id}
                component={Link}
                to={`/post/${item.id}`}
                sx={{
                  display: 'block',
                  position: 'relative',
                  width: { xs: '100%', sm: 160 },
                  minWidth: { xs: '100%', sm: 160 },
                  height: { xs: 64, sm: 110 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Box
                  component="img"
                  src={item.heroImage}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(4px) brightness(0.65)',
                    transform: 'scale(1.06)'
                  }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', p: 1 }}>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, textShadow: '0 6px 18px rgba(0,0,0,0.45)', lineHeight: 1.1 }}>
                    {item.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      <CommentSection comments={comments.length ? comments : post.comments} />
      
    </Box>
  );
}
