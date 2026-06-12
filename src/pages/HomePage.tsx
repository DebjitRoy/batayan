import { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import coverHome from '../../img/cover_home.jpg';
import { sectionMeta } from './SectionPage';
import { HomePostSkeleton } from '../components/SkeletonLoaders';


interface HomePageProps {
  posts: Post[];
  sections: string[];
  isLoading: boolean;
}

const windowPaneVariants = {
  rest: { scaleX: 1, opacity: 0.14 },
  open: { scaleX: 0.08, opacity: 0.03 }
};

const MotionLink = motion(Link);

export default function HomePage({ posts, sections, isLoading }: HomePageProps) {
  const carouselPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const cards = sections.slice(0, 4);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 5,
        minHeight: '100vh',
        px: { xs: 2, md: 0 }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 320, md: 420 },
          borderRadius: 4,
          overflow: 'hidden',
          backgroundImage: `url(${coverHome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(16,10,6,0.35)' }} />
          <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', maxWidth: 720, textShadow: '0 18px 40px rgba(0,0,0,0.32)' }}>
              বাতায়ন
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 720, color: 'rgba(255,255,255,0.92)', mt: 2 }}>
              জীবন বদলে যায় বাইরের দৃশ্যের মতো। স্মৃতির পাতায় ধরা আছে কত মুহুর্ত
                - তারা ভিড় করে আসে বাতায়ন খুললেই।
            </Typography>
            <Button component={Link} to="/index" variant="outlined" sx={{ mt: 3, width: 'fit-content', color: '#fff', borderColor: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              সূচিপত্র
            </Button>
          </Box>
      </Box>
      <Box sx={{ px: { xs: 0, md: 2 } }}>
        <Typography variant="h5" gutterBottom>
          নতুন প্রকাশিত
        </Typography>
        {isLoading ? (
          <HomePostSkeleton />
        ) : carouselPosts.length ? (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }
            }}
          >
            {carouselPosts.slice(0, 3).map((post) => (
              <Box
                key={post.id}
                component={MotionLink}
                to={`/post/${post.id}`}
                initial="rest"
                whileHover="open"
                whileTap="open"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.78)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 24px 60px rgba(15, 20, 28, 0.12)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 32px 80px rgba(15, 20, 28, 0.16)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box component={motion.div} sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={post.heroImage}
                    alt={post.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <Box
                    component={motion.div}
                    variants={windowPaneVariants}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      right: '50%',
                      transformOrigin: 'left',
                      bgcolor: 'var(--batayan-pane)',
                      borderRight: '1px solid rgba(255,255,255,0.42)',
                      pointerEvents: 'none'
                    }}
                  />
                  <Box
                    component={motion.div}
                    variants={windowPaneVariants}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      left: '50%',
                      transformOrigin: 'right',
                      bgcolor: 'var(--batayan-pane)',
                      borderLeft: '1px solid rgba(255,255,255,0.42)',
                      pointerEvents: 'none'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, bgcolor: 'var(--batayan-card)', color: 'var(--batayan-text)' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--batayan-accent)', fontWeight: 600 }}>
                      {post.section} • {post.postedDate}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1, color: 'var(--batayan-text)' }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--batayan-muted)', lineHeight: 1.6 }}>
                      {post.summary}
                    </Typography>
                  </Box>
                  <Button
                    component="span"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      p: 0,
                      fontWeight: 600,
                      color: 'var(--batayan-accent)',
                      '&:hover': {
                        color: 'var(--batayan-text)',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    বিস্তারিত পড়ুন →
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>কোনো পোস্ট পাওয়া যায়নি।</Typography>
        )} 
      </Box>
      <Box sx={{ px: { xs: 0, md: 2 } }}>
        <Typography variant="h5" gutterBottom>
          বিভাগসমূহ
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }
          }}
        >
          {cards.map((section) => (
            <Box
              key={section}
              component={MotionLink}
              to={`/section/${section}`}
              initial="rest"
              whileHover="open"
              whileTap="open"
              sx={{
                display: 'block',
                position: 'relative',
                minHeight: 220,
                overflow: 'hidden',
                borderRadius: 4,
                p: 0,
                textAlign: 'left',
                textDecoration: 'none',
                color: '#fff',
                boxShadow: '0 22px 50px rgba(46,29,20,0.18)',
                '&:hover .bg': {
                  transform: 'scale(1.08)'
                }
              }}
            >
              <Box
                className="bg"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${sectionMeta[section]?.image ?? sectionMeta.Travel.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(6px) brightness(0.75)',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.3s ease'
                }}
              />
              <Box
                component={motion.div}
                variants={windowPaneVariants}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  right: '50%',
                  transformOrigin: 'left',
                  bgcolor: 'rgba(244,239,231,0.32)',
                  borderRight: '1px solid rgba(255,255,255,0.34)',
                  pointerEvents: 'none'
                }}
              />
              <Box
                component={motion.div}
                variants={windowPaneVariants}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  left: '50%',
                  transformOrigin: 'right',
                  bgcolor: 'rgba(244,239,231,0.32)',
                  borderLeft: '1px solid rgba(255,255,255,0.34)',
                  pointerEvents: 'none'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(30,18,10,0.22)'
                }}
              />
              <Box sx={{ position: 'relative', p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {sectionMeta[section]?.header}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {sectionMeta[section]?.caption}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
