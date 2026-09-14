import type { Lesson } from '@/payload-types';

export type LexicalRichText = NonNullable<Lesson['body']>;

export type HeadingTag = 'h2' | 'h3';

export type LexicalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; tag: HeadingTag };

export const paragraph = (text: string): LexicalBlock => ({ type: 'paragraph', text });

export const heading = (text: string, tag: HeadingTag = 'h2'): LexicalBlock => ({
  type: 'heading',
  text,
  tag
});

// Минимум полей, который Lexical принимает при импорте состояния. Форма узлов —
// как в exportJSON() у самого Lexical и @lexical/rich-text (heading добавляет tag).
const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1
});

const elementNode = (type: 'heading' | 'paragraph', text: string) => ({
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  type,
  version: 1
});

export const toLexicalNode = (block: LexicalBlock) =>
  block.type === 'heading'
    ? { ...elementNode('heading', block.text), tag: block.tag }
    : elementNode('paragraph', block.text);

export const toLexical = (blocks: LexicalBlock[]): LexicalRichText => ({
  root: {
    children: blocks.map(toLexicalNode),
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
});

// Плоский текст → абзацы: пустая строка между ними разделяет параграфы.
export const toRichText = (text: string): LexicalRichText =>
  toLexical(text.split('\n\n').map((part) => paragraph(part)));
