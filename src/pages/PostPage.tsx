import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { CommentItem, Post } from '../types';
import SectionRenderer from '../components/SectionRenderer';
import CommentSection from '../components/CommentSection';
import { PostDetailSkeleton } from '../components/SkeletonLoaders';
import { fetchComments, fetchPost, fetchSeries } from '../services/postsApi';

interface PostPageProps {
  posts: Post[];
  fontSize: number;
  isLoadingPosts: boolean;
  userToken?: string;
}

export default function PostPage({ posts, isLoadingPosts, userToken }: PostPageProps) {
  const { postId } = useParams<{ postId: string }>();
  const listPost = useMemo(() => posts.find((item) => item.id === postId), [posts, postId]);
  const [post, setPost] = useState<Post | undefined>(listPost);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRelated, setShowRelated] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [seriesItems, setSeriesItems] = useState<Array<{ postId: string; part?: number; heroImage?: string }>>([]);

  const related = useMemo(() => {
    if (!post) return [];

    const sectionPosts = posts
      .filter((item) => item.section === post.section)
      .slice()
      .sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());

    const currentIndex = sectionPosts.findIndex((item) => item.id === post.id);
    if (currentIndex === -1) {
      return sectionPosts.slice(0, 4).filter((item) => item.id !== post.id);
    }

    let nearest: Post[] = [];
    if (sectionPosts.length === 1) {
      nearest = [];
    } else if (currentIndex === 0) {
      nearest = sectionPosts.slice(1, 3);
    } else if (currentIndex === sectionPosts.length - 1) {
      nearest = sectionPosts.slice(Math.max(0, sectionPosts.length - 3), sectionPosts.length - 1);
    } else {
      nearest = [sectionPosts[currentIndex - 1], sectionPosts[currentIndex + 1]];
    }

    const nearestIds = new Set(nearest.map((item) => item.id));
    const randomCandidates = sectionPosts
      .filter((item) => item.id !== post.id && !nearestIds.has(item.id));

    const shuffled = randomCandidates.sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, 2);

    return [...nearest, ...randomSelection];
  }, [posts, post]);

    const prevItemsInSeries = useMemo(() => {
    if (!post?.series?.seriesId) return [];
    return seriesItems.filter((it) => it.postId !== post.id && (it.part ?? 0) < (post.series?.part ?? 0)).sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
  }, [post, seriesItems]);
  const nextItemsInSeries = useMemo(() => {
    if (!post?.series?.seriesId) return [];
    return seriesItems.filter((it) => it.postId !== post.id && (it.part ?? 0) > (post.series?.part ?? 0)).sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
  }, [post, seriesItems]);

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

  useEffect(() => {
    if (!post?.series?.seriesId) {
      setSeriesItems([]);
      return;
    }

    let isMounted = true;

    fetchSeries(post.series.seriesId)
      .then((series) => {
        if (!isMounted) return;
        const items = series.posts ?? [];
        // Fetch hero images for each post in the series
        return Promise.all(items.map(async (it) => {
          try {
            const p = await fetchPost(it.postId);
            return { postId: it.postId, part: it.part, heroImage: p.heroImage };
          } catch {
            return { postId: it.postId, part: it.part, heroImage: undefined };
          }
        }));
      })
      .then((mapped) => {
        if (!isMounted) return;
        if (Array.isArray(mapped)) {
          setSeriesItems(mapped as any);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSeriesItems([]);
      });

    return () => {
      isMounted = false;
    };
  }, [post?.series?.seriesId]);

  useEffect(() => {
    setShowRelated(false);
    setShowComments(false);
  }, [postId]);

  useEffect(() => {
    if (isLoadingPosts || isLoading || !post || !endRef.current) return;

    const endNode = endRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowRelated(true);
        }
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0.25 }
    );

    observer.observe(endNode);

    const revealIfAlreadyAtEnd = () => {
      const rect = endNode.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0) {
        setShowRelated(true);
      }
    };

    const frameId = window.requestAnimationFrame(revealIfAlreadyAtEnd);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isLoading, isLoadingPosts, post, postId]);

  useEffect(() => {
    if (!showRelated) return;

    const timer = window.setTimeout(() => {
      setShowComments(true);
    }, 580);

    return () => window.clearTimeout(timer);
  }, [showRelated]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;

      if (contentRef.current && endRef.current) {
        const contentTop = contentRef.current.getBoundingClientRect().top + scrollTop;
        const contentBottom = endRef.current.getBoundingClientRect().top + scrollTop;
        const totalHeight = Math.max(1, contentBottom - contentTop);
        const progress = ((scrollTop + windowHeight - contentTop) / totalHeight) * 100;
        setReadProgress(Math.min(100, Math.max(0, Math.round(progress))));
        return;
      }

      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = Math.max(1, docHeight - windowHeight);
      const progress = Math.round((scrollTop / maxScroll) * 100);
      setReadProgress(Math.min(100, Math.max(0, progress)));
    };

    setReadProgress(0);
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [postId]);

  if (isLoadingPosts || isLoading) {
    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="warning">{error}</Alert>}
        <PostDetailSkeleton />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
        <Typography>পোস্ট পাওয়া যায়নি।</Typography>
        {error && <Alert severity="warning">{error}</Alert>}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Box sx={{ position: 'fixed', top: { xs: 64, md: 76 }, right: 16, zIndex: 1200, width: { xs: 'calc(100% - 32px)', sm: 320 }, maxWidth: '100%', px: 0, py: 0.5, bgcolor: 'transparent' }}>
        <Box
          sx={{
            width: '100%',
            height: 4,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'),
            borderRadius: 999,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <Box sx={{ width: `${readProgress}%`, height: '100%', bgcolor: 'var(--batayan-text)', transition: 'width 0.18s ease' }} />
        </Box>
      </Box>
      {error && <Alert severity="warning">{error}</Alert>}

      <Box ref={contentRef} sx={{ display: 'grid', gap: 2, pt:1}}>
        <Typography variant="h4">
          {post.title}
        </Typography>
        {post.series && (
          <Typography variant="subtitle1" sx={{ color: 'var(--batayan-muted)' }}>
          {post.series.part ? `${post.series.title} — Part ${post.series.part}` : String(post.series.title)}
        </Typography>
        )}
        <Typography sx={{ color: 'var(--batayan-text)' }}>
          প্রকাশিত: {post.postedDate} • আপডেট: {post.addedDate}
        </Typography>
        {post.series && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label="ধারাবাহিক" size="small" color="warning" />
            {prevItemsInSeries.map((it) => (
              <Chip
                key={it.postId}
                sx={{ color: 'var(--batayan-accent)' }}
                  label={
                    it.part ? ` Part ${it.part}` : String(post.series?.title ?? '')
                  }
                  onClick={() => {
                    const url = `/post/${it.postId}`;
                    window.location.href = url;
                  }}
                  size="small"
                  variant="outlined"
                />
                ))}
              <Typography sx={{ color: 'var(--batayan-muted)' }}>
                  •
              </Typography>
              {nextItemsInSeries.map((it) => (
                <Chip
                
                  key={it.postId}
                  label={
                    it.part ? ` Part ${it.part}` : String(post.series?.title ?? '')
                  }
                  onClick={() => {
                    const url = `/post/${it.postId}`;
                    window.location.href = url;
                  }}
                  size="small"
                  variant="outlined"
                />
              ))}
          </Box>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={post.section} sx={{ color: 'var(--batayan-muted)', borderColor: 'var(--batayan-muted)' }} />
          {post.tags.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined"  sx={{ color: 'var(--batayan-muted)', borderColor: 'var(--batayan-muted)' }}/>
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
      <Box ref={endRef} sx={{ height: 1, width: '100%' }} />
      {seriesItems.length > 0 && (
        <Box sx={{ opacity: showRelated ? 1 : 0, transform: showRelated ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.55s ease, transform 0.55s ease', pointerEvents: showRelated ? 'auto' : 'none' }}>
          <Typography variant="h6" gutterBottom>
            এই ধারাবাহিকের অন্যান্য পর্ব
          </Typography>
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
              {seriesItems
                .filter((it) => it.postId !== post.id)
                .sort((a, b) => (a.part ?? 0) - (b.part ?? 0))
                .map((it) => (
                  <Box
                    key={it.postId}
                    component={Link}
                    to={`/post/${it.postId}`}
                    sx={{
                      display: 'block',
                      position: 'relative',
                      width: { xs: 56, sm: 72 },
                      minWidth: { xs: 56, sm: 72 },
                      height: { xs: 56, sm: 72 },
                      borderRadius: 1,
                      overflow: 'hidden',
                      textDecoration: 'none',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
                    }}
                  >
                    <Box
                      component="img"
                      src={it.heroImage}
                      alt={String(it.part ?? '')}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(4px) brightness(0.55)',
                        transform: 'scale(1.06)'
                      }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800, textShadow: '0 6px 18px rgba(0,0,0,0.45)', lineHeight: 1 }}>
                        {it.part ?? ''}
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </Stack>
          </Box>
        </Box>
      )}

      {related.length > 0 && (
        <Box
          sx={{
            opacity: showRelated ? 1 : 0,
            transform: showRelated ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.55s ease, transform 0.55s ease',
            pointerEvents: showRelated ? 'auto' : 'none'
          }}
        >
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
      <Box
        sx={{
          opacity: showComments ? 1 : 0,
          transform: showComments ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.45s ease 0.55s, transform 0.45s ease 0.55s',
          pointerEvents: showComments ? 'auto' : 'none'
        }}
      >
      <CommentSection
        comments={comments.length ? comments : post.comments}
        postId={post.id}
        showHint={showComments}
        userToken={userToken}
        onCommentUpdate={(updatedComment) => {
          setComments((current) => current.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
        }}
      />
      </Box>
    </Box>
  );
}
