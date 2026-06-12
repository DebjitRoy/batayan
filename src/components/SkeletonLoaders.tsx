import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

interface PostListSkeletonProps {
  count?: number;
}

export function PostCardSkeleton() {
  return (
    <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={220} animation="wave" />
      <CardContent>
        <Stack spacing={1.25}>
          <Skeleton width="34%" animation="wave" />
          <Skeleton height={32} animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton width="82%" animation="wave" />
          <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
            <Skeleton variant="rounded" width={72} height={28} animation="wave" />
            <Skeleton variant="rounded" width={92} height={28} animation="wave" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function PostListSkeleton({ count = 6 }: PostListSkeletonProps) {
  return (
    <Grid container spacing={3} aria-label="Posts are loading">
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} md={4} key={index}>
          <PostCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

export function HomePostSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }
      }}
      aria-label="Latest posts are loading"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.78)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 24px 60px rgba(15, 20, 28, 0.12)'
          }}
        >
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <Box sx={{ p: 3, display: 'grid', gap: 1.25 }}>
            <Skeleton width="42%" animation="wave" />
            <Skeleton height={34} animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton width="86%" animation="wave" />
            <Skeleton width={112} height={28} animation="wave" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function PostDetailSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 4 }} aria-label="Post is loading">
      <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
        <Skeleton width="72%" height={48} animation="wave" />
        <Skeleton width="46%" animation="wave" />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={88} height={32} animation="wave" />
          <Skeleton variant="rounded" width={112} height={32} animation="wave" />
          <Skeleton variant="rounded" width={96} height={32} animation="wave" />
        </Box>
      </Box>

      <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 22px 50px rgba(46,29,20,0.12)' }}>
        <Skeleton variant="rectangular" height={360} animation="wave" />
      </Box>

      <Box sx={{ display: 'grid', gap: 2.5 }}>
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton width="92%" animation="wave" />
        <Skeleton width="78%" animation="wave" />
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2, my: 1 }} animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton width="88%" animation="wave" />
        <Skeleton width="65%" animation="wave" />
      </Box>
    </Box>
  );
}
