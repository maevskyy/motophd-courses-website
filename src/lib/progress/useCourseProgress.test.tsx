import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMemoryStorage } from './storage.mock';
import { progressStorageKey } from './store';
import type { CourseProgress } from './types';
import { useCourseProgress } from './useCourseProgress';

const key = progressStorageKey('lean');

const Probe = ({ renders }: { renders: CourseProgress[] }) => {
  const { progress, markDone, setLastOpened } = useCourseProgress('lean');

  renders.push(progress);

  return (
    <div>
      <span data-testid="done">{progress.done.join(',')}</span>
      <span data-testid="last">{progress.lastOpened ?? '-'}</span>
      <button onClick={() => markDone(2)}>done</button>
      <button onClick={() => setLastOpened(3)}>open</button>
    </div>
  );
};

describe('useCourseProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts empty and picks up localStorage after mount', () => {
    window.localStorage.setItem(key, JSON.stringify({ done: [1], updatedAt: '2026-01-01' }));
    const renders: CourseProgress[] = [];

    render(<Probe renders={renders} />);

    expect(renders[0].done).toEqual([]);
    expect(screen.getByTestId('done')).toHaveTextContent('1');
  });

  it('updates state right after markDone and persists it', () => {
    render(<Probe renders={[]} />);

    act(() => {
      screen.getByText('done').click();
    });

    expect(screen.getByTestId('done')).toHaveTextContent('2');
    expect(JSON.parse(window.localStorage.getItem(key) ?? '{}').done).toEqual([2]);
  });

  it('updates lastOpened through the hook', () => {
    render(<Probe renders={[]} />);

    act(() => {
      screen.getByText('open').click();
    });

    expect(screen.getByTestId('last')).toHaveTextContent('3');
  });
});
