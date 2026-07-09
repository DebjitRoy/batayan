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
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CreatePostPage from './pages/CreatePostPage';
import { posts as initialPosts } from './data/posts';
import { Post } from './types';
import { CreatePostInput, createPost, createSummary, deletePost, fetchPost, fetchPosts, getWorkerData, loginAuthor, registerAuthor, updatePost, updatePostStatus } from './services/postsApi';

function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [summaryPending, setSummaryPending] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
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

  const [editingPostFromApi, setEditingPostFromApi] = useState<Post | undefined>(undefined);
  const editingPostId = useMemo(() => new URLSearchParams(location.search).get('edit'), [location.search]);
  const editingPost = useMemo(() => {
    if (!editingPostId) return undefined;
    return posts.find((post) => post.id === editingPostId) ?? editingPostFromApi;
  }, [editingPostId, posts, editingPostFromApi]);

  useEffect(() => {
    let isMounted = true;

    if (!editingPostId) {
      setEditingPostFromApi(undefined);
      return;
    }

    const localPost = posts.find((post) => post.id === editingPostId);
    if (localPost) {
      return;
    }

    fetchPost(editingPostId)
      .then((post) => {
        if (isMounted) {
          setEditingPostFromApi(post);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEditingPostFromApi(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [editingPostId, posts]);

  const handleLogin = async (email: string, password: string) => {
    const response = await loginAuthor(email, password);
    setUser({ name: response.user.name || response.user.email, token: response.token });
    if(user) {
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    }
  };
  const handleRegister = async (email: string, password: string) => {
    const response = await registerAuthor(email, password);
    setUser({ name: response.user.name || response.user.email, token: response.token });
    if(user) {
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    }
  };

  const handleSavePost = async (newPost: CreatePostInput) => {
    if (!user) return;

    if (editingPost) {
      const updatedPost = await updatePost(editingPost.id, newPost, user.token);
      setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    } else {
      const createdPost = await createPost(newPost, user.token);
      setPosts((current) => [createdPost, ...current]);
    }

    navigate('/admin');
  };

  const handleSummaryCreate = async (contents: string) => {
    if (!user) return;
    try {
      setSummaryError(null);
      setGeneratedSummary(null);
      const jobId = await createSummary(contents, user.token);
      setSummaryId(jobId);
      setSummaryPending(true);
      console.log('Summary ID created:', jobId);
    } catch (err) {
      setSummaryError('সারাংশ তৈরিতে ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setSummaryPending(false);
    }
  }

  // Poll worker endpoint using intervals until completed/failed
  useEffect(() => {
    if (!summaryId || !user) return;

    let cancelled = false;
    const intervals = [1000, 2000, 3000, 5000];

    const getSummaryFromWorker = (worker: any): string | null => {
      if (!worker) return null;
      if (typeof worker.result === 'string') return worker.result;
      if (worker.result && typeof worker.result.summary === 'string') return worker.result.summary;
      if (worker.data && typeof worker.data.summary === 'string') return worker.data.summary;
      if (typeof worker.data === 'string') return worker.data;
      return null;
    };

    (async function poll() {
      let attempt = 0;
      while (!cancelled) {
        try {
          const worker = await getWorkerData(summaryId as string, user.token);
          if (cancelled) break;

          if (worker.status === 'completed') {
            const text = getSummaryFromWorker(worker);
            setGeneratedSummary(text ?? null);
            setSummaryPending(false);
            setSummaryId(null);
            setSummaryError(null);
            break;
          }

          if (worker.status === 'failed') {
            setSummaryError(worker.error ?? 'সারাংশ তৈরিতে ব্যর্থ হয়েছে।');
            setSummaryPending(false);
            setSummaryId(null);
            break;
          }
        } catch (e) {
          // network or server error - set error and stop polling
          setSummaryError('সার্ভারে জব স্ট্যাটাস পাওয়া যায়নি। পরে চেষ্টা করুন।');
          setSummaryPending(false);
          setSummaryId(null);
          break;
        }

        const wait = intervals[Math.min(attempt, intervals.length - 1)];
        await new Promise((res) => setTimeout(res, wait));
        attempt += 1;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [summaryId, user]);

  const handleDelete = async (id: string) => {
    if (user) {
      await deletePost(id, user.token);
    }
    setPosts((current) => current.filter((post) => post.id !== id));
  };

  const handleUpdateStatus = async (postId: string, status: string) => {
    if (!user) return;

    const updatedPost = await updatePostStatus(postId, status, user.token);
    setPosts((current) => {
      const existing = current.find((post) => post.id === updatedPost.id);
      if (!existing) {
        return updatedPost.status === 'published' ? [updatedPost, ...current] : current;
      }

      if (updatedPost.status !== 'published') {
        return current.filter((post) => post.id !== updatedPost.id);
      }

      return current.map((post) => (post.id === updatedPost.id ? updatedPost : post));
    });
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
                element={<PostPage posts={posts} fontSize={fontSize} isLoadingPosts={isLoadingPosts} userToken={user?.token} />}
              />
              <Route path="/index" element={<SearchIndex posts={posts} isLoadingPosts={isLoadingPosts} />} />
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
              <Route
                path="/admin"
                element={user ? <AdminPage posts={posts} onDelete={handleDelete} onStatusChange={handleUpdateStatus} userToken={user.token} /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/create"
                element={user ? 
                <CreatePostPage 
                  onCreate={handleSavePost} 
                  onSummaryCreate={handleSummaryCreate} 
                  editingPost={editingPost} 
                  generatedSummary={generatedSummary} 
                  summaryPending={summaryPending} 
                  summaryError={summaryError} 
                  clearSummary={() => { setGeneratedSummary(null); setSummaryError(null); }} /> : <Navigate to="/login" replace />}
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
