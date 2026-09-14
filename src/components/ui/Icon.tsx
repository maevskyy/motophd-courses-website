/*
  Один набор иконок на весь сайт: контурные, 24×24, толщина линии 1.6.
  До этого в интерфейсе смешивались emoji (🏠 📚 🔒 ✓ ★), unicode-стрелки (← ›)
  и контурные SVG в подвале — правило «одна библиотека, один стиль» это запрещает.
*/

export type IconName =
  | 'arrowLeft'
  | 'arrowRight'
  | 'brain'
  | 'check'
  | 'chevronDown'
  | 'chevronRight'
  | 'close'
  | 'document'
  | 'download'
  | 'flag'
  | 'grid'
  | 'instagram'
  | 'library'
  | 'lock'
  | 'menu'
  | 'minus'
  | 'motorcycle'
  | 'play'
  | 'plus'
  | 'star'
  | 'starFilled'
  | 'user'
  | 'wrench'
  | 'youtube';

const paths: Record<IconName, React.ReactNode> = {
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  brain: (
    <>
      <path d="M12 5.5a3 3 0 0 0-5.9-.7A2.8 2.8 0 0 0 4 7.4a2.9 2.9 0 0 0 .8 2 3 3 0 0 0 .5 4.4A3 3 0 0 0 9 18.6a3 3 0 0 0 3-.6z" />
      <path d="M12 5.5a3 3 0 0 1 5.9-.7A2.8 2.8 0 0 1 20 7.4a2.9 2.9 0 0 1-.8 2 3 3 0 0 1-.5 4.4A3 3 0 0 1 15 18.6a3 3 0 0 1-3-.6z" />
      <path d="M12 5.5V18" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 19h14" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21V4" />
      <path d="M6 5h11l-2 3.5L17 12H6z" />
    </>
  ),
  grid: (
    <>
      <rect height="7" rx="1.5" width="7" x="4" y="4" />
      <rect height="7" rx="1.5" width="7" x="13" y="4" />
      <rect height="7" rx="1.5" width="7" x="4" y="13" />
      <rect height="7" rx="1.5" width="7" x="13" y="13" />
    </>
  ),
  instagram: (
    <>
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.4 6.6h.01" />
    </>
  ),
  library: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  ),
  lock: (
    <>
      <rect height="10" rx="2" width="14" x="5" y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  minus: <path d="M5 12h14" />,
  motorcycle: (
    <>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M5.5 16.5 9 9h6l3.5 7.5" />
      <path d="M9 9h7.5" />
    </>
  ),
  play: <path d="M8 5.5v13l10-6.5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  star: <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z" />,
  /* Залитый вариант: fill задан на самом path, потому что у <svg> общий fill="none". */
  starFilled: (
    <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z" fill="currentColor" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  wrench: <path d="M15.5 4.5a5 5 0 0 0-6.2 6.4L4 16.2 7.8 20l5.3-5.3a5 5 0 0 0 6.4-6.2l-3 3-2.3-2.3z" />,
  youtube: (
    <>
      <rect height="14" rx="4" width="20" x="2" y="5" />
      <path d="m10.5 9 4.5 3-4.5 3z" />
    </>
  )
};

interface Props {
  /** Декоративная иконка рядом с текстом; смысл несёт подпись. */
  name: IconName;
  size?: number;
  className?: string;
  /** Подпись для случая, когда иконка — единственный носитель смысла. */
  title?: string;
}

export function Icon({ className, name, size = 20, title }: Props) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
      focusable="false"
      height={size}
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
