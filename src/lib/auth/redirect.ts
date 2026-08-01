const isSafePath = (path: string) => {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return false;
  }

  try {
    const decodedPath = decodeURIComponent(path);

    return !decodedPath.startsWith('//') && !decodedPath.includes('\\');
  } catch {
    return false;
  }
};

export const getSafeNextPath = (nextPath: FormDataEntryValue | null, fallbackPath: string) => {
  if (typeof nextPath !== 'string' || !isSafePath(nextPath)) {
    return fallbackPath;
  }

  return nextPath;
};
