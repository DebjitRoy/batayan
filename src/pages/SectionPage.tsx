import { keyframes } from '@emotion/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Pagination, TextField, Paper, IconButton, ClickAwayListener, InputAdornment, Chip } from '@mui/material';
import { useMobileFeatureHint } from '../contexts/MobileFeatureHintContext';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const pulseOutline = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(196, 159, 120, 0.12); }
  50% { box-shadow: 0 0 0 16px rgba(196, 159, 120, 0.08); }
`;
import { Post } from '../types';
import PostList from '../components/PostList';
import { PostListSkeleton } from '../components/SkeletonLoaders';
import { fetchPosts } from '../services/postsApi';
import coverTravel from '../../img/cover_travel.jpg';
import coverBooks from '../../img/cover_books.jpg';
import coverGuest from '../../img/cover_guest.jpg';
import coverMisl from '../../img/cover_misl.jpg';

export const sectionMeta: Record<string, { image: string; header: string; caption: string; details: string, icon?: string }> = {
  Travel: { image: coverTravel, header: 'ভ্রমণিকা', caption:  'ভ্রমণ সংকলন। কাছে দূরে, দেশে বিদেশে, নানান অভিজ্ঞতা।', 
    details:"এখন আর ভ্রমণের জন্যে ছুটির তোয়াক্কা করতে হয়না। বছরের যেকোন সময়ে বেড়িয়ে পড়তে পারলেই হলো।শুধু রেস্তো থাকা চাই। এখন তো গুগল, বিভিন্ন ট্রাভেল গাইড বুক, ট‍্যুর অপারেটর সংগঠন, পর্যটন মেলা -- ভ্রমণ অনেক সহজ করে দিয়েছে।\n\nমনে আছে ছোট বেলায় বাবা মার সাথে বেড়াতে যেতাম একটা টাইম টেবিল ও একখানা ভ্রমণ সঙ্গী ভরসা করে। যাবতীয় খরচের টাকা একটা কাঁধব‍্যাগে থাকতো,পথে ঘাটে চুরি চামারির অত ভয় ছিল না।\n\nএখন পরিবার ছাড়াও সাথে আছে প্রয়াসের বন্ধুরা, স্বামীর কর্মক্ষেত্রের বন্ধুরা পরিবার সহ, আছে ভাইবোনের দল ,সুযোগ সুবিধামতো বেড়িয়ে পড়ি।" 
  },
  Essays: { image: coverBooks, header: 'মনের আনন্দ', caption: 'বই পড়া, গান শোনা, সিনেমা দেখা, আর আড্ডার সাথে ধর্মচর্চাও।', 
    details:"ব‌ই পড়তে ভালোবাসি ছোট থেকেই। সব রকমের ব‌ই, রবীন্দ্রনাথ, বঙ্কিমচন্দ্র, শরৎচন্দ্র থেকে আধুনিক লেখক। বিভূতিভূষণ বন্দোপাধ্যায়ের লেখা পড়তে খুব ভালো লাগে।\n\nব‌ই পড়তে পড়তে কখনো কালকূটের সাথে পথ চলি, কখনো ঋজু‌দার সঙ্গে জঙ্গলে ঘুরে বেড়াই, কখনো নীললোহিতের সাথে দিকশূণ‍্যপুরে পাড়ি জমাই। আবার যখন ঠাকুরের ব‌ই পড়ি মন ঘরের কোনায় স্থির হয়ে বসে।\n\nআগে বেশিরভাগ সিনেমা হতো বিখ্যাত লেখকের ব‌ই থেকে গল্প নিয়ে। তাই সেই সব সিনেমা দেখতে যত ভালো লাগতো সেগুলো নিয়ে নিজেদের মধ্যে গল্প করতেও ভালো লাগত। এখনো অনেক ভালো সিনেমা তৈরী হয়। যেগুলো ভালো লাগেসেগুলো নিয়ে গল্প করতে ইচ্ছে করে।\n\nদিন যত গড়াচ্ছে, যত অস্তাচলের দিকে এগিয়ে যাচ্ছি, পুরোনো কথা ভাবতে, বলতে খুব ভালো লাগে। কর্মহীন অবসর জীবনকে আনন্দময় রাখতে যা প্রয়োজন তা হলো আনন্দ উপভোগ করার ক্ষমতা‌কে টিকিয়ে রাখা, বাঁচিয়ে রাখা, মুগ্ধ হতে, বিস্মিত হতে পারা। মনকে আনন্দিত হতে দেওয়া।" 
  },
  Miscellaneous: { image: coverMisl, header: 'টুকিটাকি', caption: 'সব রকম চিন্তা ভাবনা, ভালো লাগা, মন্দ লাগা; যা কিছু মনে आসে।', 
    details:"স্মৃতি‌র তোরঙ্গটি খুলতেই দেখি কতো কিছু জমে আছে তার মধ্যে।\nআমার ছেলেবেলা আমার মেয়েবেলা আমার ঘরসংসার বেলা।\n\nকতো মধুর স্মৃতি, কতো পাওয়া না পাওয়ার গল্প । কত কিছু দেখলাম, কত কিছু অদেখা অচেনা রয়ে গেল। কতো কিছু পেলাম, কতো হারিয়ে ফেললাম, কতো লোকের সাথে দেখা হল, কতো লোককে ভুলে গেলাম। \n\nজাদুকরের বাক্সের মতো আমার এই তোরঙ্গটি নানা ভাবনা চিন্তা, ইচ্ছা, আশা, কল্পনা দিয়ে ভরা।\n\nটুকিটাকি তে টুকরো কথা টুকরো স্মৃতি টুকরো গল্প দিয়ে ভরিয়ে দেব।  যেমন পুরোনো কথা থাকবে তেমনই বর্তমান ও ভবিষ্যতের ও ছায়াপাত হবে এখানে।" },
  'Guest': { image: coverGuest, header: 'অতিথির কলম', caption: 'এই কলমটি আপনার। আপনাদের কিছু বাছাই করা লেখার সংকলন', 
    details:"আমার বাতায়নের আঙিনায় অতিথিদের স্বাগতম।\n\nতাঁদের সৃষ্টির স্বাদ আমার পাঠকদের সাথে ভাগ করে নিতে এই বিভাগটি চালু করা হলো।" },
  // 'Photos': { image: coverMisl, header: 'ফটো ग্যালারি', caption: 'দেখা आর भावনার सংमিশ्रণ।', details:"" }
};

interface SectionPageProps {
  posts: Post[];
  fontSize: number;
  isLoadingPosts: boolean;
}

const PAGE_SIZE = 10;

export default function SectionPage({ posts, isLoadingPosts }: SectionPageProps) {
  const { sectionId } = useParams<{ sectionId: string }>();
  const sectionPosts = useMemo(
    () => posts.filter((post) => post.section === sectionId),
    [posts, sectionId]
  );
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [apiSearchPosts, setApiSearchPosts] = useState<Post[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const ignoreClickAway = useRef(false);
  const desktopSearchRef = useRef<HTMLInputElement | null>(null);
  const trimmedQuery = query.trim();
  const shouldUseApiSearch = trimmedQuery.length >= 2;
  const hintStep = useMobileFeatureHint();
  const searchHintActive = hintStep >= 2;

  useEffect(() => {
    if (!shouldUseApiSearch) {
      setApiSearchPosts(null);
      setIsSearching(false);
      return undefined;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      fetchPosts(100, undefined, trimmedQuery)
        .then((results) => {
          if (!isMounted) return;
          setApiSearchPosts(results);
        })
        .catch(() => {
          if (!isMounted) return;
          setApiSearchPosts([]);
        })
        .finally(() => {
          if (!isMounted) return;
          setIsSearching(false);
        });
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [shouldUseApiSearch, trimmedQuery]);

  const searchSourcePosts = apiSearchPosts ?? sectionPosts;

  const filteredPosts = useMemo(
    () =>
      searchSourcePosts.filter((post) => {
        const matchesSection = post.section === sectionId;
        const matchesQuery =
          shouldUseApiSearch ||
          `${post.title} ${post.summary} ${post.tags.join(' ')}`.toLowerCase().includes(trimmedQuery.toLowerCase());
        return matchesSection && matchesQuery;
      }),
    [searchSourcePosts, sectionId, shouldUseApiSearch, trimmedQuery]
  );

  useEffect(() => {
    setPage(1);
  }, [sectionPosts, query]);

  // focus the floating search input when it is opened
  useEffect(() => {
    if (!isSearchOpen) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [isSearchOpen]);

  // Scroll to top whenever the sectionId changes (navigating to a new section)
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // no-op in environments without window
    }
  }, [sectionId]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
          minHeight: { xs: 220, md: 300 },
          backgroundImage: `url(${sectionMeta[sectionId ?? 'Travel']?.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(16,10,6,0.15), rgba(16,10,6,0.65))' }} />
        <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, textShadow: '0 12px 24px rgba(0,0,0,0.3)' }}>
            {sectionMeta[sectionId ?? 'Travel']?.header ?? sectionId}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', mt: 1, maxWidth: 760, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {sectionMeta[sectionId ?? 'Travel']?.details ?? 'এই বিভাগের গল্প ও পাঠ।'}
          </Typography>
          <Box sx={{ mt: 2, display: { xs: 'none', md: 'block' }, maxWidth: 560 }}>
            <TextField
              inputRef={desktopSearchRef}
              size="small"
              placeholder="পোস্ট খুঁজুন"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              fullWidth
              sx={{ bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 1 }}
            />
          </Box>
        </Box>
      </Box>
      {isLoadingPosts ? (
        <PostListSkeleton count={6} />
      ) : sectionPosts.length ? (
          <>
            {query && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={query}
                  onClick={() => {
                    const isDesktop = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width:900px)').matches;
                    if (isDesktop) {
                      desktopSearchRef.current?.focus();
                    } else {
                      if (!isSearchOpen) {
                        ignoreClickAway.current = true;
                        setIsSearchOpen(true);
                        // allow ClickAwayListener to ignore this click
                        setTimeout(() => (ignoreClickAway.current = false), 0);
                      } else {
                        searchInputRef.current?.focus();
                      }
                    }
                  }}
                  onDelete={() => {
                    setQuery('');
                    setIsSearchOpen(false);
                  }}
                />
              </Box>
            )}
            {isSearching ? (
              <PostListSkeleton count={3} />
            ) : filteredPosts.length ? (
              <>
                <PostList posts={currentPosts} title={`${sectionId}`} />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
                <Typography>No posts found for this search.</Typography>
              </Box>
            )}
          </>
      ) : (
        <Typography>এই বিভাগের কোনো পোস্ট পাওয়া যায়নি।</Typography>
      )}

      <ClickAwayListener onClickAway={() => {
        if (ignoreClickAway.current) {
          ignoreClickAway.current = false;
          return;
        }
        setIsSearchOpen(false);
      }}>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            left: isSearchOpen ? { xs: 16, sm: 'auto' } : 'auto',
            right: 16,
            bottom: 92,
            zIndex: 1400,
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1,
            p: isSearchOpen ? 1 : 0,
            bgcolor: 'var(--batayan-card)',
            borderRadius: 3,
            border: searchHintActive ? '1px solid rgba(196, 159, 120, 0.45)' : '1px solid transparent',
            boxShadow: searchHintActive ? '0 18px 38px rgba(0,0,0,0.18)' : '0 12px 30px rgba(0,0,0,0.12)',
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            animation: searchHintActive ? `${pulseOutline} 1.8s ease-in-out 0.15s infinite` : 'none',
            transition: 'transform 0.35s ease 0.85s, box-shadow 0.35s ease 0.85s, border-color 0.35s ease 0.85s',
            width: isSearchOpen ? { xs: 'auto', sm: 320 } : 44,
            minWidth: isSearchOpen ? 0 : 44,
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          {isSearchOpen ? (
            <TextField
              inputRef={searchInputRef}
              size="small"
              placeholder="পোস্ট খুঁজুন"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setIsSearchOpen(false)}
                      sx={{ color: 'inherit' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                borderRadius: 2
              }}
            />
          ) : (
            <IconButton
              onClick={() => setIsSearchOpen(true)}
              size="small"
              sx={{ color: 'inherit', display: { xs: 'flex', md: 'none' } }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>
      </ClickAwayListener>
    </Box>
  );
}
