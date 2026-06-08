import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../services/postsApi';

interface SearchIndexProps {
  posts: Post[];
}

export default function SearchIndex({ posts }: SearchIndexProps) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('All');
  const [apiResults, setApiResults] = useState<Post[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const trimmedQuery = query.trim();
  const shouldUseApiSearch = trimmedQuery.length >= 2;

  const sections = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((post) => post.section)))],
    [posts]
  );

  useEffect(() => {
    if (!shouldUseApiSearch) {
      setApiResults(null);
      setIsSearching(false);
      return undefined;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      fetchPosts(100, undefined, trimmedQuery)
        .then((results) => {
          if (!isMounted) return;
          setApiResults(results);
        })
        .catch(() => {
          if (!isMounted) return;
          setApiResults([]);
        })
        .finally(() => {
          if (!isMounted) return;
          setIsSearching(false);
        });
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [shouldUseApiSearch, trimmedQuery]);

  const sourcePosts = apiResults ?? posts;

  const results = useMemo(
    () =>
      sourcePosts.filter((post) => {
        const matchesQuery =
          shouldUseApiSearch ||
          [post.title, post.summary, post.tags.join(' ')].some((value) =>
            value.toLowerCase().includes(trimmedQuery.toLowerCase())
          );
        const matchesSection = section === 'All' || post.section === section;
        return matchesQuery && matchesSection;
      }),
    [sourcePosts, shouldUseApiSearch, trimmedQuery, section]
  );

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          সূচিপত্র
        </Typography>
        <Typography sx={{ color: 'var(--batayan-muted)' }}>
          সমস্ত পোস্ট খুঁজুন টাইটেল, সারাংশ বা ট্যাগ দিয়ে।
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, maxWidth: 560 }}>
        <TextField
          label="খুঁজুন"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        <TextField
          select
          label="বিভাগ"
          value={section}
          onChange={(event) => setSection(event.target.value)}
          fullWidth
        >
          {sections.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {isSearching && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Grid>
        )}
        {results.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
