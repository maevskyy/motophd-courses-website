'use client';

import { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  poster: string;
  src: string;
}

/*
  Фоновый ролик хиро играет только тогда, когда его действительно видно. Без
  этого зацикленное видео продолжало декодироваться, пока вкладка свёрнута или
  страница пролистана ниже, и грело процессор впустую (MOT-97). Браузеры
  притормаживают фоновые вкладки по-разному: Safari ставит на паузу сам, Chrome
  муted-видео не останавливает.

  Пауза — не остановка: кадр остаётся на месте, звука нет и не было, при
  возврате ролик продолжает с того же места.

  preload="none", а не "auto": не просим браузер качать ролик заранее —
  LCP-элемент хиро это постер, страница рисуется без видео. Оговорка: по
  спецификации autoplay перекрывает подсказку preload, и там, где muted-autoplay
  разрешён (Chrome и др.), загрузка mp4 стартует сразу, но с низким приоритетом.
  "none" экономит трафик там, где автозапуск заблокирован (iOS Low Power Mode,
  экономия данных), а главный рычаг скорости — вес файла: бюджет и команда
  пережатия — docs/ARCHITECTURE.md, раздел «Статические медиа лендинга».
*/
export function HeroVideo({ className, poster, src }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;

    if (!video) {
      return;
    }

    let onScreen = true;
    let tabVisible = !document.hidden;

    const sync = () => {
      if (onScreen && tabVisible) {
        // play() отдаёт промис и падает там, где автозапуск запрещён
        // (iOS в режиме экономии) — это не ошибка, показываем постер.
        void video.play().catch(() => {});

        return;
      }

      if (!video.paused) {
        video.pause();
      }
    };

    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      sync();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    // IntersectionObserver есть везде, кроме совсем старых браузеров: там
    // остаётся прежнее поведение — ролик просто играет всегда.
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((entry) => entry.isIntersecting);
              sync();
            },
            { threshold: 0 }
          );

    observer?.observe(video);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer?.disconnect();
    };
  }, []);

  return (
    <video
      autoPlay
      className={className}
      loop
      muted
      playsInline
      poster={poster}
      preload="none"
      ref={ref}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
