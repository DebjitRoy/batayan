import { useMemo, useState } from 'react';
import { Box, Typography, TextField, MenuItem, Grid } from '@mui/material';
import { Post } from '../types';
import PostCard from '../components/PostCard';

interface SearchIndexProps {
  posts: Post[];
}

export default function SearchIndex({ posts }: SearchIndexProps) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('All');

  const sections = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((post) => post.section)))],
    [posts]
  );

  const results = useMemo(
    () =>
      posts.filter((post) => {
        const matchesQuery = [post.title, post.summary, post.tags.join(' ')].some((value) =>
          value.toLowerCase().includes(query.toLowerCase())
        );
        const matchesSection = section === 'All' || post.section === section;
        return matchesQuery && matchesSection;
      }),
    [posts, query, section]
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
        {results.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
