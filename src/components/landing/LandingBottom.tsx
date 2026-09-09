import { Link } from '@/i18n/routing';
import { FaqAccordion } from '@/components/prototype/FaqAccordion';
import { Footer } from '@/components/prototype/Footer';
import { Section, SectionHeader } from '@/components/ui/Section';
import type { HomeContent } from '@/lib/content';
import blocks from './styles/MarketingBlocks.module.scss';

interface Props {
  content: HomeContent;
  labels: {
    joinCommunity?: string;
  };
}

export function LandingBottom({ content, labels }: Props) {
  return (
    <>
      <Section bordered>
        <SectionHeader kicker={content.howLabel} title={content.howTitle.join(' ')} />
        <ol className={blocks.steps}>
          {content.steps.map((step) => (
            <li className={blocks.step} key={step.num}>
              <span className={blocks.stepBadge}>{step.num}</span>
              <h3 className={blocks.cardTitle}>{step.title}</h3>
              <p className={blocks.cardText}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section bordered tone="alt">
        <SectionHeader kicker={content.faqLabel} title={content.faqTitle} />
        <FaqAccordion items={content.faq} />
      </Section>

      <Section bordered>
        <div className={blocks.cta}>
          <h2 className={blocks.ctaTitle}>{content.ctaTitle.join(' ')}</h2>
          <p className={blocks.ctaAccent}>{content.ctaAccent}</p>
          <p className={blocks.ctaSub}>{content.ctaSub}</p>
          {labels.joinCommunity ? (
            <Link className={blocks.ctaButton} href="/courses">
              {labels.joinCommunity}
            </Link>
          ) : null}
        </div>
      </Section>

      <Footer socialLinks={content.socialLinks} />
    </>
  );
}
