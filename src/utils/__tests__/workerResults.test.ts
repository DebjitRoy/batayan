import { describe, expect, it } from 'vitest';
import type { WorkerJob } from '../../types';
import { extractGrammarSuggestions, extractWorkerText } from '../workerResults';

describe('worker result helpers', () => {
  it('extracts summary text from a completed worker payload', () => {
    const worker: Partial<WorkerJob> = {
      status: 'completed',
      result: 'এই পোস্টের সারাংশ।'
    };

    expect(extractWorkerText(worker)).toBe('এই পোস্টের সারাংশ।');
  });

  it('extracts grammar suggestions from the completed worker payload', () => {
    const worker: Partial<WorkerJob> = {
      status: 'completed',
      result: [
        { sectionId: '123', suggestion: 'একটি সাজানো বাক্য', reason: 'বাক্যটি আরও সুন্দর।' },
        { sectionId: '456', suggestion: 'আরও স্পষ্ট শব্দ', reason: 'শব্দটি স্পষ্ট নয়।' }
      ]
    };

    expect(extractGrammarSuggestions(worker)).toEqual([
      { sectionId: '123', suggestion: 'একটি সাজানো বাক্য', reason: 'বাক্যটি আরও সুন্দর।' },
      { sectionId: '456', suggestion: 'আরও স্পষ্ট শব্দ', reason: 'শব্দটি স্পষ্ট নয়।' }
    ]);
  });
});
