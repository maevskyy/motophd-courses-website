import blocksStyles from './styles/MarketingBlocks.module.scss';
import heroStyles from './styles/Hero.module.scss';
import layoutStyles from './styles/MarketingLayout.module.scss';

export const landingStyles = { ...heroStyles, ...layoutStyles, ...blocksStyles };
