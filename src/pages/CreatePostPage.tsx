import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CreatePostInput, SeriesItem, createSummary, fetchSeriesList, normalizePostType } from '../services/postsApi';
import { Post } from '../types';

interface CreatePostPageProps {
  onCreate: (post: CreatePostInput) => Promise<void>;
  onSummaryCreate: (contents: string) => Promise<void>;
  onGrammarCheck: (sections: Array<{ id: string; text: string }>) => Promise<void>;
  editingPost?: Post;
  generatedSummary?: string | null;
  summaryPending?: boolean;
  summaryError?: string | null;
  grammarPending?: boolean;
  grammarError?: string | null;
  grammarSuggestions?: Array<{ sectionId: string; suggestion: string; reason: string }>;
  clearSummary?: () => void;
}

const TITLE_MAXLength = 100; // keep original constant naming style if needed
const TITLE_MAX_LENGTH = 100;
const SUMMARY_MAX_LENGTH = 500;
const IMAGE_MAX_SIZE_BYTES = 300 * 1024;
const IMAGE_MAX_SIZE_LABEL = '300KB';

const buildSectionsState = (post?: Post) => {
  if (!post) {
    return [{ id: `sec-${Date.now()}`, header: '', body: '', imageFile: null }];
  }

  const sections: Array<{
    id: string;
    header: string;
    body: string;
    imageFile: File | null;
    imagePreview?: string;
    imageCaption?: string;
    videoLink?: string;
    videoCaption?: string;
  }> = [];

  for (let index = 0; index < post.sections.length; index += 1) {
    const section = post.sections[index];
    if (section.type === 'text') {
      const next = post.sections[index + 1];
      if (next?.type === 'text') {
        sections.push({
          id: `sec-${Date.now()}-${index}`,
          header: section.content,
          body: next.content,
          imageFile: null
        });
        index += 1;
      } else {
        sections.push({
          id: `sec-${Date.now()}-${index}`,
          header: '',
          body: section.content,
          imageFile: null
        });
      }
    } else if (section.type === 'image') {
      sections.push({
        id: `sec-${Date.now()}-${index}`,
        header: '',
        body: '',
        imageFile: null,
        imagePreview: section.content,
        imageCaption: section.caption
      });
    } else if (section.type === 'video') {
      sections.push({
        id: `sec-${Date.now()}-${index}`,
        header: '',
        body: '',
        imageFile: null,
        videoLink: section.content,
        videoCaption: section.caption
      });
    }
  }

  return sections.length
    ? sections
    : [{ id: `sec-${Date.now()}`, header: '', body: '', imageFile: null }];
};

export default function CreatePostPage({ onCreate, onSummaryCreate, onGrammarCheck, editingPost, generatedSummary, summaryPending, summaryError, grammarPending, grammarError, grammarSuggestions = [], clearSummary }: CreatePostPageProps) {
  const isEditMode = Boolean(editingPost);
  const [title, setTitle] = useState(editingPost?.title ?? '');
  const [summary, setSummary] = useState(editingPost?.summary ?? '');
  const [heroImage, setHeroImage] = useState(editingPost?.heroImage ?? '');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroImageError, setHeroImageError] = useState('');
  const [sectionImageErrors, setSectionImageErrors] = useState<Record<string, string>>({});
  const [searchBy, setSearchBy] = useState(editingPost?.tags?.join(', ') ?? '');
  const [status, setStatus] = useState(editingPost?.status ?? 'draft');
  const [postType, setPostType] = useState(normalizePostType(editingPost?.type ?? editingPost?.section) ?? 'travel');
  const [postedDate, setPostedDate] = useState(editingPost?.postedDate ?? new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [seriesEnabled, setSeriesEnabled] = useState(Boolean(editingPost?.series));
  const [seriesMode, setSeriesMode] = useState<'existing' | 'new'>(editingPost?.series ? 'existing' : 'new');
  const [seriesOptions, setSeriesOptions] = useState<SeriesItem[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(editingPost?.series?.seriesId ?? '');
  const [seriesPart, setSeriesPart] = useState(editingPost?.series?.part ?? 1);
  const [newSeriesTitle, setNewSeriesTitle] = useState(editingPost?.series?.title ?? '');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [newSeriesType, setNewSeriesType] = useState(normalizePostType(editingPost?.type ?? editingPost?.section) ?? 'travel');
  const [newSeriesTags, setNewSeriesTags] = useState(editingPost?.tags?.join(', ') ?? '');

  const [sectionsState, setSectionsState] = useState(buildSectionsState(editingPost));
  const [expandedSection, setExpandedSection] = useState<string | false>(sectionsState?.[0]?.id ?? false);

  useEffect(() => {
    if (!editingPost) {
      setSeriesEnabled(false);
      setSeriesMode('new');
      setSelectedSeriesId('');
      setSeriesPart(1);
      setNewSeriesTitle('');
      setNewSeriesDescription('');
      setNewSeriesType(normalizePostType(postType) ?? 'travel');
      setNewSeriesTags('');
      setSearchBy('');
      setStatus('draft');
      return;
    }

    setTitle(editingPost.title);
    setSummary(editingPost.summary);
    setHeroImage(editingPost.heroImage);
    setHeroFile(null);
    setPostType(normalizePostType(editingPost.type ?? editingPost.section) ?? 'travel');
    setPostedDate(editingPost.postedDate);
    setSectionsState(buildSectionsState(editingPost));
    setSeriesEnabled(Boolean(editingPost.series));
    setSeriesMode(editingPost.series ? 'existing' : 'new');
    setSelectedSeriesId(editingPost.series?.seriesId ?? '');
    setSeriesPart(editingPost.series?.part ?? 1);
    setNewSeriesTitle(editingPost.series?.title ?? '');
    setNewSeriesDescription('');
    setNewSeriesType(normalizePostType(editingPost.type ?? editingPost.section) ?? 'travel');
    setNewSeriesTags(editingPost.tags?.join(', ') ?? '');
    setSearchBy(editingPost.tags?.join(', ') ?? '');
    setStatus(editingPost.status ?? 'draft');
    setExpandedSection((editingPost.sections && editingPost.sections[0]) ? buildSectionsState(editingPost)[0]?.id ?? false : false);
  }, [editingPost]);

  useEffect(() => {
    fetchSeriesList()
      .then((items) => setSeriesOptions(items))
      .catch(() => setSeriesOptions([]));
  }, []);

  useEffect(() => {
    if (!editingPost?.series || seriesMode !== 'existing' || selectedSeriesId) {
      return;
    }

    const matchedSeries = seriesOptions.find(
      (series) => series.title.trim().toLowerCase() === editingPost.series?.title.trim().toLowerCase()
    );

    if (matchedSeries) {
      setSelectedSeriesId(matchedSeries.id);
    }
  }, [editingPost, seriesMode, selectedSeriesId, seriesOptions]);

  useEffect(() => {
    if (seriesMode !== 'existing' || !selectedSeriesId) {
      return;
    }

    const selectedSeries = seriesOptions.find((series) => series.id === selectedSeriesId);
    if (!selectedSeries) {
      return;
    }

    const editingSameSeries = editingPost?.series?.seriesId === selectedSeriesId
      || (!!editingPost?.series && selectedSeries.title.trim().toLowerCase() === editingPost.series.title.trim().toLowerCase());
    setSeriesPart(editingSameSeries ? editingPost?.series?.part ?? 1 : selectedSeries.totalParts + 1);
  }, [seriesMode, selectedSeriesId, seriesOptions, editingPost]);

  useEffect(() => {
    if (!sectionsState.length) {
      setExpandedSection(false);
      return;
    }

    if (expandedSection === false) return;
    const found = sectionsState.find((s) => s.id === expandedSection);
    if (!found) {
      setExpandedSection(sectionsState[0].id);
    }
  }, [sectionsState]);

  const isSeriesValid = !seriesEnabled || (seriesMode === 'existing' ? Boolean(selectedSeriesId) : Boolean(newSeriesTitle.trim() && newSeriesDescription.trim()));
  const showGrammarButton = status === 'draft' && sectionsState.some((section) => section.body.trim());

  const onCreateSummary = () => {
    const contents = sectionsState.map((s) => s.body).filter(Boolean).join(' ');
    onSummaryCreate(contents);
  };

  const onCheckGrammar = () => {
    console.log('Checking grammar for sections:', {editingPost, sectionsState});
    if(!editingPost){
      throw new Error('Can\'t do Grammar check on a new post.');
    }
    const grammerCheckSections = editingPost.sections.filter((s) => s.type === 'text').map((s) => ({ id: s.id, text: s.content }));
    onGrammarCheck(grammerCheckSections);
    // onGrammarCheck(sectionsState.map((section) => ({ id: section.id, text: section.body })));
  };

  useEffect(() => {
    if (generatedSummary) {
      setSummary(generatedSummary);
    }
  }, [generatedSummary]);

  const submit = async () => {
    if (!title || !summary || (!heroFile && !heroImage) || !isSeriesValid) return;

    const newPost: CreatePostInput = {
      title,
      postType: postType,
      gist: summary,
      heroImageFile: heroFile ?? undefined,
      status,
      searchBy: Array.from(
        new Set([
          postType,
          title,
          ...searchBy
            .split(',')
            .map((term) => term.trim())
            .filter(Boolean)
        ])
      ),
      additionalInfo: '',
      content: sectionsState.map((s) => {
        let video = s.videoLink ?? '';
        if (video.includes('watch?v=')) video = video.replace('watch?v=', 'embed/');
        if (video.includes('youtu.be/')) video = video.replace('youtu.be/', 'www.youtube.com/embed/');

        return {
          header: s.header,
          content: s.body,
          imageFile: s.imageFile,
          imgDescription: s.imageCaption,
          video,
          videoDescription: s.videoCaption
        };
      })
    };

    if (seriesEnabled) {
      if (seriesMode === 'existing' && selectedSeriesId) {
        newPost.seriesId = selectedSeriesId;
        newPost.seriesPart = seriesPart;
      }

      if (seriesMode === 'new') {
        const tags = newSeriesTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        newPost.newSeries = {
          title: newSeriesTitle.trim(),
          description: newSeriesDescription.trim(),
          postType: newSeriesType,
          searchBy: tags.length ? tags : [newSeriesTitle.trim()]
        };
        newPost.seriesPart = seriesPart;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onCreate(newPost);
    } catch {
      setSubmitError('Post could not be created. Please check login and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSectionAt = (index: number) => {
    const newSec = { id: `sec-${Date.now()}`, header: '', body: '', imageFile: null } as any;
    setSectionsState((s) => {
      const next = [...s];
      next.splice(index, 0, newSec);
      return next;
    });
    setExpandedSection(newSec.id);
  };

  const addSection = () => addSectionAt(sectionsState.length);

  const removeSection = (id: string) => {
    setSectionsState((s) => s.filter((x) => x.id !== id));
    setSectionImageErrors((errors) => {
      const nextErrors = { ...errors };
      delete nextErrors[id];
      return nextErrors;
    });
  };

  const validateImageFile = (file: File) => {
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      return `Image must be ${IMAGE_MAX_SIZE_LABEL} or smaller.`;
    }

    return '';
  };

  const handleSectionFile = (file: File, id: string) => {
    const error = validateImageFile(file);
    if (error) {
      setSectionImageErrors((errors) => ({ ...errors, [id]: error }));
      return;
    }

    setSectionImageErrors((errors) => ({ ...errors, [id]: '' }));
    const reader = new FileReader();
    reader.onload = () => {
      setSectionsState((s) => s.map((sec) => (sec.id === id ? { ...sec, imageFile: file, imagePreview: String(reader.result) } : sec)));
    };
    reader.readAsDataURL(file);
  };

  const handleHeroFile = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setHeroImageError(error);
      setHeroFile(null);
      setHeroImage('');
      return;
    }

    setHeroImageError('');
    setHeroFile(file);
    const reader = new FileReader();
    reader.onload = () => setHeroImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const postCategories = { travel: 'ভ্রমণিকা', books: 'মনের আনন্দ', miscl: 'টুকিটাকি', guest: 'অতিথির কলম' } as const;

  return (
    <Paper sx={{ p: 4, maxWidth: 760, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'পোস্ট সম্পাদনা করুন' : 'নতুন পোস্ট তৈরি করুন'}
      </Typography>

      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}
        {summaryError && <Alert severity="error">{summaryError}</Alert>}

        <TextField
          label="শিরোনাম"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          inputProps={{ maxLength: TITLE_MAX_LENGTH }}
          helperText={`${title.length}/${TITLE_MAX_LENGTH}`}
          FormHelperTextProps={{ sx: { textAlign: 'right' } }}
          fullWidth
        />

        <Select label="বিভাগ" value={postType} onChange={(event) => setPostType(event.target.value)} fullWidth>
          {Object.entries(postCategories).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="সন্ধান শব্দবন্ধ"
          value={searchBy}
          placeholder="কমা দিয়ে আলাদা করে লিখুন (যেমনঃ himalata, arunachal, arunachal pradesh)"
          onChange={(event) => setSearchBy(event.target.value)}
          inputProps={{ maxLength: SUMMARY_MAX_LENGTH }}
          multiline
          rows={1}
          fullWidth
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox checked={seriesEnabled} onChange={(event) => setSeriesEnabled(event.target.checked)} />}
            label="এই পোস্ট সিরিজের অংশ"
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="post-status-label">Status</InputLabel>
            <Select labelId="post-status-label" label="Status" value={status} onChange={(event) => setStatus(event.target.value as string)}>
              {['draft', 'published', 'archived'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {seriesEnabled && (
          <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.12)', bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              সিরিজ নির্বাচন করুন
            </Typography>

            <Select value={seriesMode} onChange={(event) => setSeriesMode(event.target.value as 'existing' | 'new')} fullWidth sx={{ mb: 2 }}>
              <MenuItem value="existing">Existing series</MenuItem>
              <MenuItem value="new">New series</MenuItem>
            </Select>

            {seriesMode === 'existing' ? (
              <Box>
                <Select value={selectedSeriesId} onChange={(event) => setSelectedSeriesId(event.target.value)} fullWidth displayEmpty>
                  <MenuItem value="">Select series</MenuItem>
                  {seriesOptions.map((series) => (
                    <MenuItem key={series.id} value={series.id}>
                      {series.title}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  label="Series part number"
                  type="number"
                  value={seriesPart}
                  onChange={(event) => setSeriesPart(Math.max(1, Number(event.target.value)))}
                  inputProps={{ min: 1 }}
                  fullWidth
                  sx={{ mt: 2 }}
                  helperText="Existing series defaults to last part + 1"
                />
              </Box>
            ) : (
              <Stack spacing={2}>
                <TextField label="Series title" value={newSeriesTitle} onChange={(event) => setNewSeriesTitle(event.target.value)} fullWidth />
                <TextField label="Series description" value={newSeriesDescription} onChange={(event) => setNewSeriesDescription(event.target.value)} multiline rows={2} fullWidth />
                <Select value={newSeriesType} onChange={(event) => setNewSeriesType(event.target.value)} fullWidth>
                  {Object.entries(postCategories).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                <TextField label="Search tags (comma separated)" value={newSeriesTags} onChange={(event) => setNewSeriesTags(event.target.value)} fullWidth />
                <TextField label="Series part number" type="number" value={seriesPart} onChange={(event) => setSeriesPart(Math.max(1, Number(event.target.value)))} inputProps={{ min: 1 }} fullWidth />
              </Stack>
            )}
          </Paper>
        )}

        <Box>
          <Typography sx={{ mb: 1 }}>হিরো ইমেজ (ব্রাউজ বা ড্র্যাগ-অ্যান্ড-ড্রপ)</Typography>
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer?.files?.[0];
              if (f) handleHeroFile(f);
            }}
            sx={{ border: '1px dashed rgba(0,0,0,0.12)', p: 2, borderRadius: 2 }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="hero-file-input"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleHeroFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <label htmlFor="hero-file-input">
              <Button component="span">Choose file</Button>
            </label>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: heroImageError ? 'error.main' : 'var(--batayan-muted)' }}>
              {heroImageError || `Maximum image size: ${IMAGE_MAX_SIZE_LABEL}`}
            </Typography>
            {heroImage && (
              <Box sx={{ mt: 2 }}>
                <img src={heroImage} alt="hero preview" style={{ width: '100%', borderRadius: 8 }} />
              </Box>
            )}
          </Box>
        </Box>

        <TextField label="প্রকাশের তারিখ" type="date" value={postedDate} onChange={(event) => setPostedDate(event.target.value)} InputLabelProps={{ shrink: true }} fullWidth />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">বিভাগ/সেকশন যোগ করুন</Typography>
            <Button onClick={addSection}>নতুন সেকশন</Button>
          </Box>

          <Stack spacing={2}>
            {sectionsState.map((sec, idx) => (
              <Accordion key={sec.id} expanded={true} onChange={(_, expanded) => setExpandedSection(expanded ? sec.id : false)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="subtitle1">{ `Section ${idx + 1}`}</Typography>
                    <Box>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); addSectionAt(idx); }}>Add before</Button>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); addSectionAt(idx + 1); }}>Add after</Button>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2 }} elevation={0}>
                    <TextField label="Section header" value={sec.header} onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, header: e.target.value } : x)))} fullWidth sx={{ mt: 1 }} />
                    <TextField label="Body" value={sec.body} onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, body: e.target.value } : x)))} multiline rows={10} fullWidth sx={{ mt: 1 }} />

                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ mb: 1 }}>Section Image (optional: browse or drop)</Typography>
                      <Box
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const f = e.dataTransfer?.files?.[0];
                          if (f) handleSectionFile(f, sec.id);
                        }}
                        sx={{ border: '1px dashed rgba(0,0,0,0.12)', p: 1, borderRadius: 1 }}
                      >
                        <input type="file" accept="image/*" style={{ display: 'none' }} id={`sec-file-${sec.id}`} onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleSectionFile(e.target.files[0], sec.id);
                            e.target.value = '';
                          }
                        }} />
                        <label htmlFor={`sec-file-${sec.id}`}>
                          <Button component="span">Choose image</Button>
                        </label>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: sectionImageErrors[sec.id] ? 'error.main' : 'var(--batayan-muted)' }}>
                          {sectionImageErrors[sec.id] || `Maximum image size: ${IMAGE_MAX_SIZE_LABEL}`}
                        </Typography>
                        {sec.imagePreview && (
                          <Box sx={{ mt: 1 }}>
                            <img src={sec.imagePreview} alt="section preview" style={{ width: '100%', borderRadius: 6 }} />
                            <TextField label="Image description" value={sec.imageCaption || ''} onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, imageCaption: e.target.value } : x)))} fullWidth sx={{ mt: 1 }} />
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <TextField label="YouTube link (optional)" value={sec.videoLink || ''} onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, videoLink: e.target.value } : x)))} fullWidth sx={{ mt: 1 }} />
                    <TextField label="YouTube description" value={sec.videoCaption || ''} onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, videoCaption: e.target.value } : x)))} fullWidth sx={{ mt: 1 }} />
                  </Paper>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>

          {(isEditMode || summary) && (
          <TextField
            label="সারাংশ"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            inputProps={{ maxLength: SUMMARY_MAX_LENGTH }}
            helperText={`${summary.length}/${SUMMARY_MAX_LENGTH}`}
            FormHelperTextProps={{ sx: { textAlign: 'right' } }}
            multiline
            rows={5}
            fullWidth
          />
        )}

        </Box>

        {isEditMode && (
          <Button variant="contained" onClick={submit} disabled={!title || !summary || (!heroFile && !heroImage) || isSubmitting || !isSeriesValid}>
             পরিবর্তন সংরক্ষণ করুন
          </Button>
        )}
        {showGrammarButton && (
          <Box>
            <Button variant="outlined" onClick={onCheckGrammar} disabled={Boolean(grammarPending)}>
              {grammarPending ? 'গ্রামার পরীক্ষা চলছে...' : 'গ্রামার ও বানান পরীক্ষা করুন'}
            </Button>
            {grammarError && <Alert severity="error" sx={{ mt: 1 }}>{grammarError}</Alert>}
            {grammarSuggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>পরামর্শ</Typography>
                <Stack spacing={1.5}>
                  {grammarSuggestions.map((suggestion) => {
                    const section = sectionsState.find((item) => item.id === suggestion.sectionId);
                    const sectionLabel = section?.header?.trim() || `Section ${sectionsState.findIndex((item) => item.id === suggestion.sectionId) + 1}`;

                    return (
                      <Alert key={`${suggestion.sectionId}-${suggestion.suggestion}`} severity="info" sx={{ alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2">{sectionLabel}</Typography>
                        <Typography variant="body2">প্রস্তাব: {suggestion.suggestion}</Typography>
                        <Typography variant="body2">কারণ: {suggestion.reason}</Typography>
                      </Alert>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        )}
        {!isEditMode && !summary && (
          <Button variant="contained" onClick={onCreateSummary} disabled={Boolean(summaryPending)}>
            {summaryPending ? 'সারাংশ তৈরি হচ্ছে...' : 'সারাংশ তৈরি করুন'}
          </Button>
        )}
        {!isEditMode && summary && (
          <Button variant="contained" onClick={submit} disabled={!title || (!heroFile && !heroImage) || isSubmitting || !isSeriesValid}>
             পোস্ট তৈরি করুন
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
