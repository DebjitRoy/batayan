import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostCard from '../PostCard';
import { Post } from '../../types';

const samplePost: Post = {
  id: 'test-post',
  title: 'পরীক্ষার পোস্ট',
  summary: 'এটি একটি টেস্ট পোস্ট সারাংশ।',
  heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  addedDate: '2026-05-30',
  postedDate: '2026-05-30',
  section: 'Test',
  type: 'Test',
  tags: ['টেস্ট'],
  sections: [],
  comments: []
};

test('renders post card with title and summary', () => {
  render(
    <MemoryRouter>
      <PostCard post={samplePost} />
    </MemoryRouter>
  );
  expect(screen.getByText('পরীক্ষার পোস্ট')).toBeInTheDocument();
  expect(screen.getByText('এটি একটি টেস্ট পোস্ট সারাংশ।')).toBeInTheDocument();
});
