import { useEffect, useState } from 'react';
import { Alert, Box, Button, TextField, Typography, Paper, Stack, IconButton, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { CreatePostInput } from '../services/postsApi';
import { Post } from '../types';

interface CreatePostPageProps {
  onCreate: (post: CreatePostInput) => Promise<void>;
  editingPost?: Post;
}

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

export default function CreatePostPage({ onCreate, editingPost }: CreatePostPageProps) {
  const isEditMode = Boolean(editingPost);
  const [title, setTitle] = useState(editingPost?.title ?? '');
  const [summary, setSummary] = useState(editingPost?.summary ?? '');
  const [heroImage, setHeroImage] = useState(editingPost?.heroImage ?? '');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroImageError, setHeroImageError] = useState('');
  const [sectionImageErrors, setSectionImageErrors] = useState<Record<string, string>>({});
  const [section, setSection] = useState(editingPost?.section ?? 'travel');
  const [type, setType] = useState(editingPost?.type ?? editingPost?.section ?? 'travel');
  const [postedDate, setPostedDate] = useState(editingPost?.postedDate ?? new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [sectionsState, setSectionsState] = useState(buildSectionsState(editingPost));

  useEffect(() => {
    if (!editingPost) {
      return;
    }

    setTitle(editingPost.title);
    setSummary(editingPost.summary);
    setHeroImage(editingPost.heroImage);
    setHeroFile(null);
    setSection(editingPost.section);
    setType(editingPost.type ?? editingPost.section);
    setPostedDate(editingPost.postedDate);
    setSectionsState(buildSectionsState(editingPost));
  }, [editingPost]);

  const submit = async () => {
    if (!title || !summary || (!heroFile && !heroImage)) return;

    const newPost: CreatePostInput = {
      title,
      postType: type || section,
      gist: summary,
      heroImageFile: heroFile ?? undefined,
      searchBy: [section, title],
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

  const addSection = () => {
    setSectionsState((s) => [...s, { id: `sec-${Date.now()}`, header: '', body: '', imageFile: null }]);
  };

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
  const postCategories = { travel: "ভ্রমণিকা" ,  books: "মনের আনন্দ" , miscl: "টুকিটাকি" , guest: "অতিথির কলম" };

  return (
    <Paper sx={{ p: 4, maxWidth: 760, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'পোস্ট সম্পাদনা করুন' : 'নতুন পোস্ট তৈরি করুন'}
      </Typography>
      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}
        <TextField
          label="শিরোনাম"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          inputProps={{ maxLength: TITLE_MAX_LENGTH }}
          helperText={`${title.length}/${TITLE_MAX_LENGTH}`}
          FormHelperTextProps={{ sx: { textAlign: 'right' } }}
          fullWidth
        />
        <Select label="বিভাগ" value={section} onChange={(event) => setSection(event.target.value)} fullWidth>
          {Object.entries(postCategories).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="সারাংশ"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          inputProps={{ maxLength: SUMMARY_MAX_LENGTH }}
          helperText={`${summary.length}/${SUMMARY_MAX_LENGTH}`}
          FormHelperTextProps={{ sx: { textAlign: 'right' } }}
          multiline
          rows={3}
          fullWidth
        />

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

       
        <TextField label="ধরন" value={type} onChange={(event) => setType(event.target.value)} fullWidth />
        <TextField
          label="প্রকাশের তারিখ"
          type="date"
          value={postedDate}
          onChange={(event) => setPostedDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">বিভাগ/সেকশন যোগ করুন</Typography>
            <Button onClick={addSection}>নতুন সেকশন</Button>
          </Box>
          <Stack spacing={2}>
            {sectionsState.map((sec) => (
              <Paper key={sec.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Section</Typography>
                  <IconButton size="small" onClick={() => removeSection(sec.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  label="Section header"
                  value={sec.header}
                  onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, header: e.target.value } : x)))}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Body"
                  value={sec.body}
                  onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, body: e.target.value } : x)))}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mt: 1 }}
                />

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
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`sec-file-${sec.id}`}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSectionFile(e.target.files[0], sec.id);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label htmlFor={`sec-file-${sec.id}`}>
                      <Button component="span">Choose image</Button>
                    </label>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        color: sectionImageErrors[sec.id] ? 'error.main' : 'var(--batayan-muted)'
                      }}
                    >
                      {sectionImageErrors[sec.id] || `Maximum image size: ${IMAGE_MAX_SIZE_LABEL}`}
                    </Typography>
                    {sec.imagePreview && (
                      <Box sx={{ mt: 1 }}>
                        <img src={sec.imagePreview} alt="section preview" style={{ width: '100%', borderRadius: 6 }} />
                        <TextField
                          label="Image description"
                          value={sec.imageCaption || ''}
                          onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, imageCaption: e.target.value } : x)))}
                          fullWidth
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                <TextField
                  label="YouTube link (optional)"
                  value={sec.videoLink || ''}
                  onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, videoLink: e.target.value } : x)))}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="YouTube description"
                  value={sec.videoCaption || ''}
                  onChange={(e) => setSectionsState((s) => s.map((x) => (x.id === sec.id ? { ...x, videoCaption: e.target.value } : x)))}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              </Paper>
            ))}
          </Stack>
          <Button onClick={addSection}>নতুন সেকশন</Button>
        </Box>

        <Button variant="contained" onClick={submit} disabled={!title || !summary || (!heroFile && !heroImage) || isSubmitting}>
          {isEditMode ? 'পরিবর্তন সংরক্ষণ করুন' : 'পোস্ট তৈরি করুন'}
        </Button>
      </Stack>
    </Paper>
  );
}
