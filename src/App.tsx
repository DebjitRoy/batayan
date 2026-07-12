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
import { CreatePostInput, deletePost, fetchPost, fetchPosts, getWorkerData, loginAuthor, registerAuthor, updatePost, updatePostStatus, createPost, CreatePostResponse } from './services/postsApi';
import { GrammarSuggestion, extractGrammarSuggestions, extractWorkerText } from './utils/workerResults';

function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(null);
  const [activeWorkerType, setActiveWorkerType] = useState<'summary' | 'grammarCheck' | null>(null);
  const [activeSummaryJobId, setActiveSummaryJobId] = useState<string | null>(null);
  const [activegrammerJobId, setActivegrammerJobId] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [summaryPending, setSummaryPending] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [grammarPending, setGrammarPending] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);
  const [grammarCompleted, setGrammarCompleted] = useState(false);
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
    if (!response.token) {
      throw new Error('Login failed');
    }
    setUser({ name: response.user.name || response.user.email, token: response.token });
    setTimeout(() => {
      navigate('/admin');
    }, 500);
  };
  const handleRegister = async (email: string, password: string) => {
    const response = await registerAuthor(email, password);
    if (!response.token) {
      throw new Error('Registration failed');
    }
    setUser({ name: response.user.name || response.user.email, token: response.token });
    setTimeout(() => {
      navigate('/admin');
    }, 500);
  };

  const handleSavePost = async (newPost: CreatePostInput) => {
    if (!user) return;
    setGrammarSuggestions([]);
    setGeneratedSummary(null);
    
    try {
      let response: CreatePostResponse;
      
      if (editingPost) {
        response = await updatePost(editingPost.id, newPost, user.token);
        setPosts((current) => current.map((post) => (post.id === response.post.id ? response.post : post)));
      } else {
        response = await createPost(newPost, user.token);
      }
      
      // Auto-start polling for AI results
      if (response.summaryJobId) {
        setActiveSummaryJobId(response.summaryJobId);
        setSummaryPending(true);
      }
      if (response.grammerJobId) {
        setActivegrammerJobId(response.grammerJobId);
        setGrammarPending(true);
      }
      
      // Navigate to edit page to show suggestions as they come in
      const postId = response.post.id;
      navigate(`/create?edit=${postId}`);
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!activeWorkerId || !user || !activeWorkerType) return;

    let cancelled = false;
    const intervals = [1000, 2000, 3000, 5000];

    (async function poll() {
      let attempt = 0;
      while (!cancelled) {
        try {
          const worker = await getWorkerData(activeWorkerId, user.token);
          if (cancelled) break;

          const resolvedType = worker.jobType ?? activeWorkerType;

          if (worker.status === 'completed') {
            if (resolvedType === 'grammarCheck') {
              setGrammarSuggestions(extractGrammarSuggestions(worker));
              setGrammarPending(false);
              setGrammarError(null);
              setGrammarCompleted(true);
            } else {
              setGeneratedSummary(extractWorkerText(worker) ?? null);
              setSummaryPending(false);
              setSummaryError(null);
            }

            setActiveWorkerId(null);
            setActiveWorkerType(null);
            break;
          }

          if (worker.status === 'failed') {
            if (resolvedType === 'grammarCheck') {
              setGrammarError(worker.error ?? 'গ্রামার পরীক্ষায় ব্যর্থ হয়েছে।');
              setGrammarPending(false);
              setGrammarCompleted(false);
            } else {
              setSummaryError(worker.error ?? 'সারাংশ তৈরিতে ব্যর্থ হয়েছে।');
              setSummaryPending(false);
            }
            setActiveWorkerId(null);
            setActiveWorkerType(null);
            break;
          }
        } catch {
          if (activeWorkerType === 'grammarCheck') {
            setGrammarError('সার্ভারে জব স্ট্যাটাস পাওয়া যায়নি। পরে চেষ্টা করুন।');
            setGrammarPending(false);
            setGrammarCompleted(false);
          } else {
            setSummaryError('সার্ভারে জব স্ট্যাটাস পাওয়া যায়নি। পরে চেষ্টা করুন।');
            setSummaryPending(false);
          }
          setActiveWorkerId(null);
          setActiveWorkerType(null);
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
  }, [activeWorkerId, activeWorkerType, user]);

  // Auto-poll for summary and grammar results after post creation/update
  useEffect(() => {
    if ((!activeSummaryJobId && !activegrammerJobId) || !user) return;

    let cancelled = false;
    const intervals = [1000, 2000, 3000, 5000];

    (async function pollAI() {
      let attempt = 0;
      while (!cancelled) {
        try {
          if (activeSummaryJobId) {
            const summaryWorker = await getWorkerData(activeSummaryJobId, user.token);
            if (!cancelled && summaryWorker.status === 'completed') {
              setGeneratedSummary(extractWorkerText(summaryWorker) ?? null);
              setSummaryPending(false);
              setSummaryError(null);
              setActiveSummaryJobId(null);
            } else if (!cancelled && summaryWorker.status === 'failed') {
              setSummaryError(summaryWorker.error ?? 'সারাংশ তৈরিতে ব্যর্থ হয়েছে।');
              setSummaryPending(false);
              setActiveSummaryJobId(null);
            }
          }

          if (activegrammerJobId) {
            const grammarWorker = await getWorkerData(activegrammerJobId, user.token);
            if (!cancelled && grammarWorker.status === 'completed') {
              setGrammarSuggestions(extractGrammarSuggestions(grammarWorker));
              setGrammarPending(false);
              setGrammarError(null);
              setGrammarCompleted(true);
              setActivegrammerJobId(null);
            } else if (!cancelled && grammarWorker.status === 'failed') {
              setGrammarError(grammarWorker.error ?? 'গ্রামার পরীক্ষায় ব্যর্থ হয়েছে।');
              setGrammarPending(false);
              setGrammarCompleted(false);
              setActivegrammerJobId(null);
            }
          }

          // If both are done, stop polling
          if (!activeSummaryJobId && !activegrammerJobId) {
            break;
          }
        } catch (error) {
          console.error('Error polling AI results:', error);
          if (activeSummaryJobId) {
            setSummaryError('সার্ভারে জব স্ট্যাটাস পাওয়া যায়নি। পরে চেষ্টা করুন।');
            setSummaryPending(false);
            setActiveSummaryJobId(null);
          }
          if (activegrammerJobId) {
            setGrammarError('সার্ভারে জব স্ট্যাটাস পাওয়া যায়নি। পরে চেষ্টা করুন।');
            setGrammarPending(false);
            setGrammarCompleted(false);
            setActivegrammerJobId(null);
          }
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
  }, [activeSummaryJobId, activegrammerJobId, user]);

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
                  editingPost={editingPost} 
                  generatedSummary={generatedSummary} 
                  summaryPending={summaryPending} 
                  summaryError={summaryError} 
                  grammarPending={grammarPending}
                  grammarError={grammarError}
                  grammarCompleted={grammarCompleted}
                  grammarSuggestions={grammarSuggestions}
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
