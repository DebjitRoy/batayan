import type { WorkerJob } from '../types';

export interface GrammarSuggestion {
  sectionId: string;
  suggestion: string;
  reason: string;
}

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  return null;
};

export const extractWorkerText = (worker: Partial<WorkerJob> | null | undefined): string | null => {
  if (!worker) {
    return null;
  }

  const direct = asString(worker.result);
  if (direct) {
    return direct;
  }

  if (worker.result && typeof worker.result === 'object') {
    const nestedSummary = asString((worker.result as Record<string, unknown>).summary);
    if (nestedSummary) {
      return nestedSummary;
    }
  }

  if (worker.data && typeof worker.data === 'object') {
    const nestedSummary = asString((worker.data as Record<string, unknown>).summary);
    if (nestedSummary) {
      return nestedSummary;
    }
  }

  const dataText = asString(worker.data);
  if (dataText) {
    return dataText;
  }

  return null;
};

export const extractGrammarSuggestions = (worker: Partial<WorkerJob> | null | undefined): GrammarSuggestion[] => {
  if (!worker) {
    return [];
  }

  const candidates = [worker.result, worker.data?.result, worker.data?.suggestions, worker.data?.grammarSuggestions, worker.data];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (Array.isArray(candidate)) {
      return candidate
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const record = item as Record<string, unknown>;
          const sectionId = asString(record.sectionId) ?? asString(record.id) ?? '';
          const suggestion = asString(record.suggestion) ?? asString(record.text) ?? '';
          const reason = asString(record.reason) ?? asString(record.explanation) ?? '';

          if (!sectionId && !suggestion && !reason) {
            return null;
          }

          return {
            sectionId,
            suggestion,
            reason
          };
        })
        .filter((item): item is GrammarSuggestion => Boolean(item));
    }
  }

  return [];
};
