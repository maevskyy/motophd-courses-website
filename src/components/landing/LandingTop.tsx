import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
import { HeroVideo } from './HeroVideo';
import { Icon } from '@/components/ui/Icon';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Testimonials } from './Testimonials';
import type { HomeContent } from '@/lib/content';
import type { CourseCardCourse } from '@/lib/data';
import blocks from './styles/MarketingBlocks.module.scss';
import hero from './styles/Hero.module.scss';

interface Props {
  content: HomeContent;
  courses: CourseCardCourse[];
  labels: {
    viewCourses: string;
    browseAllCourses: string;
  };
}

export function LandingTop({ content, courses, labels }: Props) {
  return (
    <>
      <section className={hero.hero}>
        {/*
          Один слой затемнения вместо трёх (сетка + радиальное свечение убраны):
          на мобильном градиент разворачивается снизу вверх, потому что там видео —
          отдельный медиа-блок над текстом, а не фон под ним.
        */}
        <div className={hero.media}>
          <HeroVideo className={hero.video} poster="/hero-poster.jpg" src="/hero-loop.mp4" />
          <div className={hero.scrim} />
          <div className={hero.glow} />
        </div>

        <div className={hero.inner}>
          <p className={hero.badge}>
            <span className={hero.badgeDot} />
            {content.heroBadge}
          </p>
          {/*
            Заголовок переносится сам по ширине контейнера: жёсткие переносы по
            строкам из контента ломали композицию при смене языка (RU-строки
            заметно длиннее EN) и требовали правок размера через :lang(ru).
          */}
          <h1 className={hero.title}>
            {content.heroTitle.join(' ')}{' '}
            <span className={hero.titleAccent}>{content.heroRed}</span> {content.heroAfterRed}
          </h1>
          <p className={hero.sub}>{content.heroSub}</p>
          <div className={hero.actions}>
            <Link className={hero.btnPrimary} href="/courses">
              {labels.viewCourses}
            </Link>
          </div>

          <dl className={hero.stats}>
            {content.stats.map((stat) => (
              <div className={hero.stat} key={stat.label}>
                <dt className={hero.statLabel}>{stat.label}</dt>
                <dd className={hero.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section>
        <SectionHeader
          kicker={content.coursesLabel}
          lead={content.coursesSub}
          title={content.coursesTitle.join(' ')}
        />
        <div className={blocks.cardsGrid}>
          {courses.map((course) => (
            <CourseCard course={course} key={course.slug} />
          ))}
        </div>
      </Section>

      <Section bordered tone="alt">
        <SectionHeader
          kicker={content.methodLabel}
          lead={content.methodSub}
          title={content.methodTitle}
        />
        <ol className={blocks.methodGrid}>
          {content.method.map((item) => (
            <li className={blocks.methodCard} key={item.title}>
              <span className={blocks.methodIcon}>
                <Icon name={item.icon} size={22} />
              </span>
              <p className={blocks.stepNum}>{item.num}</p>
              <h3 className={blocks.cardTitle}>{item.title}</h3>
              <p className={blocks.cardText}>{item.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/*
        Инструктор — по составу как в main: портрет и регалии слева, рассказ от
        первого лица, кнопка в каталог и фото с тренировки справа. Пункт «About»
        в шапке ведёт на отдельную страницу /about (MOT-73), а не сюда.
      */}
      <Section bordered>
        <SectionHeader kicker={content.instructorLabel} />
        <div className={blocks.instructor}>
          <div className={blocks.instructorAside}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={content.instructorName} className={blocks.instructorPhoto} src="/vlad.jpg" />
            <div className={blocks.instructorCard}>
              <p className={blocks.instructorName}>{content.instructorName}</p>
              <p className={blocks.instructorRole}>{content.instructorRole}</p>
              {content.instructorCredentials ? (
                <ul className={blocks.checkList}>
                  {content.instructorCredentials.map((item) => (
                    <li className={blocks.checkItem} key={item}>
                      <Icon className={blocks.checkIcon} name="check" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className={blocks.instructorBody}>
            {content.instructorTitle.length > 0 ? (
              <h2 className={blocks.instructorTitle}>{content.instructorTitle.join(' ')}</h2>
            ) : null}
            {content.instructorCopy.map((paragraph) => (
              <p className={blocks.prose} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <Link className={blocks.btnSecondary} href="/courses">
              {labels.browseAllCourses}
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={content.instructorName}
              className={blocks.instructorActionPhoto}
              src="/vlad-training.jpg"
            />
          </div>
        </div>
      </Section>

      <Section bordered tone="alt">
        <SectionHeader
          kicker={content.testimonialsLabel}
          title={content.testimonialsTitle.join(' ')}
        />
        <Testimonials items={content.testimonials} />
      </Section>
    </>
  );
}
