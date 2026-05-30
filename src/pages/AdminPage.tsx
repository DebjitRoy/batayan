import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Post } from '../types';
import { Link } from 'react-router-dom';

interface AdminPageProps {
  posts: Post[];
  onDelete: (id: string) => void;
}

export default function AdminPage({ posts, onDelete }: AdminPageProps) {
  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          অ্যাডমিন প্যানেল
        </Typography>
        <Typography sx={{ color: 'var(--batayan-muted)' }}>
          এখানে পোস্ট সিঙ্গেল ভিউ এবং ডিলিট করা যাবে।
        </Typography>
      </Box>

      <Button component={Link} to="/create" variant="contained" sx={{ width: 'fit-content' }}>
        নতুন পোস্ট তৈরি করুন
      </Button>

      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>শিরোনাম</TableCell>
              <TableCell>বিভাগ</TableCell>
              <TableCell>প্রকাশ</TableCell>
              <TableCell>কর্ম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.section}</TableCell>
                <TableCell>{post.postedDate}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/post/${post.id}`} size="small">
                    দেখুন
                  </Button>
                  <Button size="small" color="error" onClick={() => onDelete(post.id)}>
                    মুছুন
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
