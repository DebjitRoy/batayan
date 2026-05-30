import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
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
    () => posts.filter((item) => item.section === post?.section && item.id !== post?.id).slice(0, 2),
    [posts, post]
  );

  useEffect(() => {
    setPost(listPost);
  }, [listPost]);

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

      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
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

      {post.summary && (
        <Box>
          <Typography variant="body1" sx={{ color: 'var(--batayan-muted)', lineHeight: 1.8 }}>
            {post.summary}
          </Typography>
        </Box>
      )}

      <Box>
        <SectionRenderer sections={post.sections} />
      </Box>

      <CommentSection comments={comments.length ? comments : post.comments} />

      {related.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            আরো পড়ুন
          </Typography>
          <Stack spacing={2}>
            {related.map((item) => (
              <Button key={item.id} component={Link} to={`/post/${item.id}`} variant="outlined">
                {item.title}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
