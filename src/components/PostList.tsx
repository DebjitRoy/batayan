import { Grid, Typography, Button, Box } from '@mui/material';
import { Post } from '../types';
import PostCard from './PostCard';
import { Link } from 'react-router-dom';

interface PostListProps {
  posts: Post[];
  title?: string;
}

export default function PostList({ posts, title }: PostListProps) {
  return (
    <Box>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={4} key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
