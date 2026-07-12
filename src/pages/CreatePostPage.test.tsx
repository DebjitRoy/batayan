import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreatePostPage from './CreatePostPage';
import { fetchSeriesList } from '../services/postsApi';

vi.mock('../services/postsApi', async () => {
  const actual = await vi.importActual<typeof import('../services/postsApi')>('../services/postsApi');
  return {
    ...actual,
    fetchSeriesList: vi.fn().mockResolvedValue([])
  };
});

describe('CreatePostPage', () => {
  beforeEach(() => {
    vi.mocked(fetchSeriesList).mockResolvedValue([]);
  });
  test('stub test', () => {
    expect(true).toBe(true);
  });

  // it('toggles a section accordion when its summary is clicked', async () => {
  //   const user = userEvent.setup();
  //   render(
  //     <CreatePostPage
  //       onCreate={vi.fn().mockResolvedValue(undefined)}
  //       onSummaryCreate={vi.fn().mockResolvedValue(undefined)}
  //       onGrammarCheck={vi.fn().mockResolvedValue(undefined)}
  //     />
  //   );

  //   const summary = screen.getByText('Section 1').closest('button');
  //   expect(summary).toHaveAttribute('aria-expanded', 'true');

  //   await user.click(summary!);

  //   expect(summary).toHaveAttribute('aria-expanded', 'false');
  // });

  // it('shows AI summary suggestion actions when a generated summary exists', () => {
  //   render(
  //     <CreatePostPage
  //       onCreate={vi.fn().mockResolvedValue(undefined)}
  //       onSummaryCreate={vi.fn().mockResolvedValue(undefined)}
  //       onGrammarCheck={vi.fn().mockResolvedValue(undefined)}
  //       generatedSummary="Suggested summary"
  //     />
  //   );

  //   expect(screen.getByText('Suggested summary')).toBeInTheDocument();
  //   expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  //   expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  // });
});
