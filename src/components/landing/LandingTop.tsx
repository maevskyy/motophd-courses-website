import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
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
    about: string;
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

          preload="none", а не "auto": не просим браузер качать ролик заранее —
          LCP-элемент хиро это постер (`poster`), страница рисуется без видео.
          Оговорка: по спецификации autoplay перекрывает подсказку preload, и там,
          где muted-autoplay разрешён (Chrome и др.), загрузка mp4 стартует сразу,
          но с низким приоритетом. "none" экономит трафик там, где автозапуск
          заблокирован (iOS Low Power Mode, экономия данных), а главный рычаг
          скорости — вес файла: бюджет и команда пережатия —
          docs/ARCHITECTURE.md, раздел «Статические медиа лендинга».
        */}
        <div className={hero.media}>
          <video
            autoPlay
            className={hero.video}
            loop
            muted
            playsInline
            poster="/hero-poster.jpg"
            preload="none"
          >
            <source src="/hero-loop.mp4" type="video/mp4" />
          </video>
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
            {content.heroTitle.join(' ')} <span className={hero.titleAccent}>{content.heroRed}</span>{' '}
            {content.heroAfterRed}
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
        <SectionHeader kicker={content.methodLabel} lead={content.methodSub} title={content.methodTitle} />
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

      <Section bordered className={blocks.instructorCompactSection}>
        <SectionHeader kicker={content.instructorLabel} />
        <div className={blocks.instructorCompact}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={content.instructorName} className={blocks.instructorCompactPhoto} src="/vlad.jpg" />
          <div>
            <p className={blocks.instructorName}>{content.instructorName}</p>
            <p className={blocks.instructorRole}>{content.instructorRole}</p>
            {content.instructorCredentials ? (
              <ul className={blocks.instructorCompactCredentials}>
                {content.instructorCredentials.slice(0, 2).map((item) => (
                  <li className={blocks.checkItem} key={item}>
                    <Icon className={blocks.checkIcon} name="check" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Link className={blocks.btnSecondary} href="/about">
            {labels.about} →
          </Link>
        </div>
      </Section>

      <Section bordered tone="alt">
        <SectionHeader kicker={content.testimonialsLabel} title={content.testimonialsTitle.join(' ')} />
        <Testimonials items={content.testimonials} />
      </Section>
    </>
  );
}
