import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { fetchLatestPost, normalizePostType } from '../services/postsApi';

export default function LatestPostRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const requestedType = searchParams.get('type');
  const normalizedType = normalizePostType(requestedType);

  useEffect(() => {
    let isMounted = true;

    setError(null);
    fetchLatestPost(normalizedType)
      .then((post) => {
        if (!isMounted) return;

        if (post) {
          navigate(`/post/${post.id}`, { replace: true });
          return;
        }

        setError(
          requestedType
            ? `No post was found for type "${requestedType}".`
            : 'No latest post was found.'
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Latest post could not be loaded right now.');
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, normalizedType, requestedType]);

  return (
    <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2, py: 8 }}>
      {error ? (
        <Alert severity="warning">{error}</Alert>
      ) : (
        <>
          <Skeleton variant="rounded" width={220} height={12} animation="wave" />
          <Typography sx={{ color: 'var(--batayan-muted)' }}>Opening the latest post...</Typography>
        </>
      )}
    </Box>
  );
}
