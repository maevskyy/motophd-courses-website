import { describe, expect, it } from 'vitest';

import { heading, paragraph, toLexical, toRichText } from './lexical';

const textsOf = (node: Record<string, unknown>) =>
  (node.children as { text: string }[]).map(({ text }) => text);

describe('toLexical', () => {
  it('wraps blocks into a Lexical root with one text node per block', () => {
    const { root } = toLexical([heading('Главное'), paragraph('Абзац')]);

    expect(root).toMatchObject({ direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 });
    expect(root.children).toEqual([
      expect.objectContaining({
        children: [expect.objectContaining({ mode: 'normal', text: 'Главное', type: 'text' })],
        direction: 'ltr',
        tag: 'h2',
        type: 'heading',
        version: 1
      }),
      expect.objectContaining({
        children: [expect.objectContaining({ text: 'Абзац', type: 'text' })],
        type: 'paragraph'
      })
    ]);
  });

  it('keeps the requested heading level', () => {
    const [node] = toLexical([heading('Подзаголовок', 'h3')]).root.children;

    expect(node).toMatchObject({ tag: 'h3', type: 'heading' });
  });

  it('does not put a tag on paragraphs', () => {
    const [node] = toLexical([paragraph('x')]).root.children;

    expect(node).not.toHaveProperty('tag');
  });
});

describe('toRichText', () => {
  it('splits plain text into paragraphs on blank lines', () => {
    const { root } = toRichText('Первый\n\nВторой');

    expect(root.children.map((node) => node.type)).toEqual(['paragraph', 'paragraph']);
    expect(root.children.map(textsOf)).toEqual([['Первый'], ['Второй']]);
  });

  it('keeps a single-line text as one paragraph', () => {
    expect(toRichText('Один').root.children).toHaveLength(1);
  });
});
