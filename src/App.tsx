import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, CssBaseline } from '@mui/material';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SectionPage from './pages/SectionPage';
import PostPage from './pages/PostPage';
import LatestPostRedirect from './pages/LatestPostRedirect';
import SearchIndex from './pages/SearchIndex';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CreatePostPage from './pages/CreatePostPage';
import { posts as initialPosts } from './data/posts';
import { Post } from './types';
import { CreatePostInput, createPost, deletePost, fetchPosts, loginAuthor } from './services/postsApi';

function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [colorMode, setColorMode] = useState<'dark' | 'light'>('light');
  const [user, setUser] = useState<{ name: string; token: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const sections = useMemo(
    () => Array.from(new Set(posts.map((post) => post.section))),
    [posts]
  );

  const handleLogin = async (email: string, password: string) => {
    const response = await loginAuthor(email, password);
    setUser({ name: response.user.name || response.user.email, token: response.token });
    navigate('/admin');
  };

  const handleCreatePost = async (newPost: CreatePostInput) => {
    if (!user) return;
    const createdPost = await createPost(newPost, user.token);
    setPosts((current) => [createdPost, ...current]);
    navigate('/admin');
  };

  const handleDelete = async (id: string) => {
    if (user) {
      await deletePost(id, user.token);
    }
    setPosts((current) => current.filter((post) => post.id !== id));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dataset.theme = colorMode;
  }, [colorMode]);

  useEffect(() => {
    let isMounted = true;

    fetchPosts()
      .then((apiPosts) => {
        if (!isMounted) return;
        setPosts(apiPosts);
        setPostsError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setPostsError('লাইভ পোস্ট লোড করা যায়নি। সাময়িকভাবে নমুনা ডেটা দেখানো হচ্ছে।');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingPosts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--batayan-bg)', color: 'var(--batayan-text)', transition: 'background-color 0.28s ease, color 0.28s ease' }}>
      <CssBaseline />
      <Layout
        user={user}
        onLogout={() => setUser(null)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        colorMode={colorMode}
        onColorModeToggle={() => setColorMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
      >
        {postsError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {postsError}
          </Alert>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 48% 0 48%)' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 8% 0 8%)' }}
            transition={{ duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', transformOrigin: 'center' }}
          >
            <Routes>
              <Route path="/" element={<HomePage posts={posts} sections={sections} isLoading={isLoadingPosts} />} />
              <Route
                path="/section/:sectionId"
                element={<SectionPage posts={posts} fontSize={fontSize} isLoadingPosts={isLoadingPosts} />}
              />
              <Route path="/post/latest" element={<LatestPostRedirect />} />
              <Route
                path="/post/:postId"
                element={<PostPage posts={posts} fontSize={fontSize} isLoadingPosts={isLoadingPosts} />}
              />
              <Route path="/index" element={<SearchIndex posts={posts} isLoadingPosts={isLoadingPosts} />} />
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route
                path="/admin"
                element={user ? <AdminPage posts={posts} onDelete={handleDelete} /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/create"
                element={user ? <CreatePostPage onCreate={handleCreatePost} /> : <Navigate to="/login" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Layout>
    </Box>
  );
}

export default App;
