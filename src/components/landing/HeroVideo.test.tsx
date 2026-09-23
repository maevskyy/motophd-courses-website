import { render } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroVideo } from './HeroVideo';

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let notify: ObserverCallback;
const disconnect = vi.fn();
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback) {
        notify = callback;
      }

      disconnect = disconnect;
      observe = vi.fn();
      unobserve = vi.fn();
    }
  );

  // jsdom не умеет проигрывать медиа: play/pause подменяем и следим за вызовами.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  play.mockClear();
  pause.mockClear();
  disconnect.mockClear();
});

const renderHero = () =>
  render(<HeroVideo className="video" poster="/hero-poster.jpg" src="/hero-loop.mp4" />);

const setPaused = (value: boolean) => {
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(value);
};

describe('фоновый ролик хиро', () => {
  it('останавливается, когда уезжает из вьюпорта, и снова играет при возврате', () => {
    renderHero();
    setPaused(false);

    act(() => notify([{ isIntersecting: false }]));
    expect(pause).toHaveBeenCalled();

    play.mockClear();
    setPaused(true);

    act(() => notify([{ isIntersecting: true }]));
    expect(play).toHaveBeenCalled();
  });

  it('останавливается, когда вкладку убрали из виду', () => {
    renderHero();
    act(() => notify([{ isIntersecting: true }]));

    setPaused(false);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(pause).toHaveBeenCalled();
  });

  it('не трогает ролик, который и так на паузе', () => {
    renderHero();
    setPaused(true);

    act(() => notify([{ isIntersecting: false }]));

    expect(pause).not.toHaveBeenCalled();
  });

  it('отписывается от наблюдателя, когда секция уходит со страницы', () => {
    const { unmount } = renderHero();

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
