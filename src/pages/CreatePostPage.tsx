import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, IconButton, Select, MenuItem } from '@mui/material';
import { Post } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';

interface CreatePostPageProps {
  onCreate: (post: Post) => void;
}

const TITLE_MAX_LENGTH = 100;
const SUMMARY_MAX_LENGTH = 500;
const IMAGE_MAX_SIZE_BYTES = 300 * 1024;
const IMAGE_MAX_SIZE_LABEL = '300KB';

export default function CreatePostPage({ onCreate }: CreatePostPageProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroImageError, setHeroImageError] = useState('');
  const [sectionImageErrors, setSectionImageErrors] = useState<Record<string, string>>({});
  const [section, setSection] = useState('Travel');
  const [type, setType] = useState('Travel');
  const [postedDate, setPostedDate] = useState(new Date().toISOString().slice(0, 10));

  const [sectionsState, setSectionsState] = useState<{
    id: string;
    header: string;
    body: string;
    imageFile: File | null;
    imagePreview?: string;
    imageCaption?: string;
    videoLink?: string;
    videoCaption?: string;
  }[]>([]);

  const submit = () => {
    if (!title || !summary || !heroImage) return;
    const contentSections: Post['sections'] = [];

    // Add summary as an initial text section
    contentSections.push({ id: `s-summary-${Date.now()}`, type: 'text', content: summary });

    // Convert each composed section into one or more ContentSection entries
    sectionsState.forEach((s, idx) => {
      if (s.header) {
        contentSections.push({ id: `s-${idx}-header-${Date.now()}`, type: 'text', content: s.header });
      }
      if (s.body) {
        contentSections.push({ id: `s-${idx}-body-${Date.now()}`, type: 'text', content: s.body });
      }
      if (s.imagePreview) {
        contentSections.push({ id: `s-${idx}-img-${Date.now()}`, type: 'image', content: s.imagePreview, caption: s.imageCaption });
      }
      if (s.videoLink) {
        // normalize youtube urls to embed form when possible
        let embed = s.videoLink;
        if (embed.includes('watch?v=')) embed = embed.replace('watch?v=', 'embed/');
        if (embed.includes('youtu.be/')) embed = embed.replace('youtu.be/', 'www.youtube.com/embed/');
        contentSections.push({ id: `s-${idx}-vid-${Date.now()}`, type: 'video', content: embed, caption: s.videoCaption });
      }
    });

    const newPost: Post = {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now()}`,
      title,
      summary,
      heroImage,
      addedDate: postedDate,
      postedDate,
      section,
      type,
      tags: [section.toLowerCase(), 'new'],
      sections: contentSections,
      comments: []
    };

    onCreate(newPost);
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
        নতুন পোস্ট তৈরি করুন
      </Typography>
      <Stack spacing={3}>
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
        </Box>

        <Button variant="contained" onClick={submit} disabled={!title || !summary || !heroImage}>
          পোস্ট তৈরি করুন
        </Button>
      </Stack>
    </Paper>
  );
}
