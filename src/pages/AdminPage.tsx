import { useMemo, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Tooltip, TextField, TableSortLabel, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Post } from '../types';
import { Link } from 'react-router-dom';

interface AdminPageProps {
  posts: Post[];
  onDelete: (id: string) => Promise<void> | void;
}

export default function AdminPage({ posts, onDelete }: AdminPageProps) {
  const [query, setQuery] = useState('');
  const [orderBy, setOrderBy] = useState<keyof Post | 'postedDate'>('postedDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts.slice();
    return posts.filter((p) => {
      const hay = `${p.title} ${p.summary || ''} ${p.tags?.join(' ') || ''} ${p.section}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, query]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      let cmp = 0;
      if (orderBy === 'postedDate') {
        cmp = new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      } else {
        const va = (a[orderBy] as any) || '';
        const vb = (b[orderBy] as any) || '';
        cmp = String(va).localeCompare(String(vb));
      }
      return order === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, orderBy, order]);

  const paginated = useMemo(() => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [sorted, page, rowsPerPage]);

  const handleRequestSort = (property: keyof Post | 'postedDate') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          অ্যাডমিন প্যানেল
        </Typography>
        <Typography sx={{ color: 'var(--batayan-muted)' }}>
          এখানে পোস্ট এডিট এবং ডিলিট করা যাবে।
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button component={Link} to="/create" variant="contained" sx={{ width: 'fit-content' }}>
          নতুন পোস্ট তৈরি করুন
        </Button>
        <TextField size="small" placeholder="টাইটেল/ট্যাগ/বিবরণ খুঁজুন" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} sx={{ minWidth: 220 }} />
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))' }}>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }} sortDirection={orderBy === 'title' ? order : false}>
                <TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleRequestSort('title')}>
                  শিরোনাম
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }} sortDirection={orderBy === 'section' ? order : false}>
                <TableSortLabel active={orderBy === 'section'} direction={orderBy === 'section' ? order : 'asc'} onClick={() => handleRequestSort('section')}>
                  বিভাগ
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }} sortDirection={orderBy === 'postedDate' ? order : false}>
                <TableSortLabel active={orderBy === 'postedDate'} direction={orderBy === 'postedDate' ? order : 'desc'} onClick={() => handleRequestSort('postedDate')}>
                  প্রকাশ
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', borderBottom: '2px solid rgba(0,0,0,0.06)' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.section}</TableCell>
                <TableCell>{post.postedDate}</TableCell>
                <TableCell>
                  <Tooltip title="সম্পাদনা">
                    <IconButton component={Link} to={`/create?edit=${post.id}`} size="small" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="মুছে ফেলুন">
                    <IconButton size="small" color="error" aria-label="delete" onClick={() => onDelete(post.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5,10,25]}
        />
      </TableContainer>
    </Box>
  );
}
