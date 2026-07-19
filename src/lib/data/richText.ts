const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object';

export const richTextToParagraphs = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.root) || !Array.isArray(value.root.children)) {
    return [];
  }

  return value.root.children
    .map((node) => {
      if (!isRecord(node) || !Array.isArray(node.children)) {
        return '';
      }

      return node.children
        .map((child) => (isRecord(child) && typeof child.text === 'string' ? child.text : ''))
        .filter(Boolean)
        .join('');
    })
    .map((text) => text.trim())
    .filter(Boolean);
};

export const richTextToText = (value: unknown) => richTextToParagraphs(value).join('\n\n');
