import { Box, Typography } from '@mui/material';
import { ContentSection } from '../types';

interface SectionRendererProps {
  sections: ContentSection[];
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {sections.map((section) => {
        if (section.type === 'text') {
          return (
            <Typography key={section.id} sx={{ lineHeight: 1.8 }}>
              {section.content}
            </Typography>
          );
        }

        if (section.type === 'image') {
          return (
            <Box key={section.id} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 18px 40px rgba(46,29,20,0.12)' }}>
              <img src={section.content} alt={section.caption || 'Image'} style={{ width: '100%', display: 'block' }} />
              {section.caption && (
                <Typography sx={{ p: 1, fontSize: 14, color: 'var(--batayan-muted)' }}>{section.caption}</Typography>
              )}
            </Box>
          );
        }

        return (
          <Box key={section.id} sx={{ position: 'relative', pt: '56.25%', overflow: 'hidden', borderRadius: 3 }}>
            <iframe
              title="embedded video"
              src={section.content}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
