export { courseCoverImage } from './courseCover';
export { noIndexMetadata } from './noIndex';
export {
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  toDescription
} from './pageMetadata';
export type { PageMetadataInput, SeoImage } from './pageMetadata';
export { buildRobots } from './robots';
export { DEFAULT_SITE_URL, getSiteUrl } from './siteUrl';
export { buildSitemapEntries } from './sitemap';
export type { SitemapDocument, SitemapSource } from './sitemap';
export {
  buildLanguageAlternates,
  canonicalUrl,
  localizedPath,
  resolveSeoLocale,
  toAbsoluteUrl
} from './urls';
