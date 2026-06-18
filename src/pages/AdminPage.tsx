import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Tooltip, TextField, TableSortLabel, TablePagination, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, CircularProgress, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import { CommentItem, Post } from '../types';
import { Link } from 'react-router-dom';
import { fetchPosts, fetchComments, replyToComment } from '../services/postsApi';

interface AdminPageProps {
  posts: Post[];
  onDelete: (id: string) => Promise<void> | void;
  onStatusChange: (id: string, status: string) => Promise<void> | void;
  userToken?: string;
}

const statusOptions = ['draft', 'published', 'archived'] as const;

export default function AdminPage({ posts, onDelete, onStatusChange, userToken }: AdminPageProps) {
  const [query, setQuery] = useState('');
  const [orderBy, setOrderBy] = useState<keyof Post | 'postedDate'>('postedDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [adminPosts, setAdminPosts] = useState<Post[] | null>(null);
  const [viewingPostComments, setViewingPostComments] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchPosts(100, undefined, undefined, 'all', true)
      .then((results) => {
        if (!isMounted) return;
        setAdminPosts(results);
      })
      .catch(() => {
        if (!isMounted) return;
        setAdminPosts(posts);
      });

    return () => {
      isMounted = false;
    };
  }, [posts]);

  const displayedPosts = adminPosts ?? posts;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return displayedPosts.slice();
    return displayedPosts.filter((p) => {
      const hay = `${p.title} ${p.summary || ''} ${p.tags?.join(' ') || ''} ${p.section}`.toLowerCase();
      return hay.includes(q);
    });
  }, [displayedPosts, query]);

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

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget.id);
      setAdminPosts((current) => current?.filter((post) => post.id !== deleteTarget.id) ?? null);
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (postId: string, status: string) => {
    await onStatusChange(postId, status);
    setAdminPosts((current) =>
      current?.map((post) => (post.id === postId ? { ...post, status } : post)) ?? null
    );
  };

  const openCommentsDialog = async (post: Post) => {
    setViewingPostComments(post);
    setLoadingComments(true);
    try {
      const comments = await fetchComments(post.id);
      setPostComments(comments);
    } catch {
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const closeCommentsDialog = () => {
    setViewingPostComments(null);
    setPostComments([]);
    setReplyingTo(null);
    setReplyText('');
  };

  const submitReply = async (commentId: string) => {
    if (!replyText.trim() || !userToken || !viewingPostComments) return;

    setSubmittingReply(true);
    try {
      const updatedComment = await replyToComment(viewingPostComments.id, commentId, replyText.trim(), userToken);
      setPostComments((current) =>
        current.map((comment) => (comment.id === commentId ? updatedComment : comment))
      );
      setReplyingTo(null);
      setReplyText('');
    } catch {
      // Error handled silently
    } finally {
      setSubmittingReply(false);
    }
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
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                সিরিজ
              </TableCell>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                Part
              </TableCell>
              <TableCell sx={{ bgcolor: 'var(--batayan-card)', fontWeight: 700, color: 'var(--batayan-text)', borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                Status
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
                <TableCell>{post.series?.title || '-'}</TableCell>
                <TableCell>{post.series?.part ?? '-'}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={post.status ?? 'published'}
                    onChange={(event) => handleStatusChange(post.id, event.target.value as string)}
                    sx={{ minWidth: 140 }}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{post.postedDate}</TableCell>
                <TableCell>
                  <Tooltip title="সম্পাদনা">
                    <IconButton component={Link} to={`/create?edit=${post.id}`} size="small" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="মন্তব্য">
                    <IconButton size="small" aria-label="comments" onClick={() => openCommentsDialog(post)}>
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="মুছে ফেলুন">
                    <IconButton size="small" color="error" aria-label="delete" onClick={() => setDeleteTarget(post)}>
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

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>আপনি কি নিশ্চিত?</DialogTitle>
        <DialogContent>
          <Typography>
            {(deleteTarget?.title || 'এই পোস্ট')} মুছে ফেলতে চাইছেন? একাউন্ট থেকে এটি স্থায়ীভাবে মুছে যাবে।
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>বাতিল</Button>
          <Button color="error" onClick={handleConfirmDelete} autoFocus>
            মুছুন
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(viewingPostComments)} onClose={closeCommentsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          মন্তব্য: {viewingPostComments?.title}
        </DialogTitle>
        <DialogContent>
          {loadingComments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : postComments.length === 0 ? (
            <Typography sx={{ py: 3, textAlign: 'center', color: 'var(--batayan-muted)' }}>
              কোনো মন্তব্য নেই
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {postComments.map((comment) => (
                <Card key={comment.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.date}
                      </Typography>
                    </Box>
                    <Typography sx={{ mb: 1 }}>{comment.text}</Typography>
                    {comment.reply && (
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F7E6D6', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          উত্তর: {comment.reply}
                        </Typography>
                      </Box>
                    )}
                    {!comment.reply && (
                      <Box>
                        {replyingTo === comment.id ? (
                          <Box sx={{ mt: 1.5 }}>
                            <TextField
                              label="উত্তর লিখুন"
                              value={replyText}
                              multiline
                              rows={2}
                              fullWidth
                              size="small"
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => submitReply(comment.id)}
                                disabled={!replyText.trim() || submittingReply}
                              >
                                {submittingReply ? <CircularProgress size={20} /> : 'উত্তর দিন'}
                              </Button>
                              <Button
                                size="small"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                              >
                                বাতিল
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            উত্তর দিন
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCommentsDialog}>বন্ধ করুন</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
