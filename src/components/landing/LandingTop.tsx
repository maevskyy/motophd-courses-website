import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
import { Icon } from '@/components/ui/Icon';
import { Section, SectionHeader } from '@/components/ui/Section';
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
            {content.stats.map((stat) => {
              const body = (
                <>
                  <dt className={hero.statLabel}>{stat.label}</dt>
                  <dd className={hero.statValue}>{stat.value}</dd>
                  {stat.note ? <dd className={hero.statNote}>{stat.note}</dd> : null}
                </>
              );

              return stat.href ? (
                <a
                  className={hero.stat}
                  href={stat.href}
                  key={stat.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {body}
                </a>
              ) : (
                <div className={hero.stat} key={stat.label}>
                  {body}
                </div>
              );
            })}
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

      <Section bordered id="about-anchor">
        <SectionHeader
          kicker={content.instructorLabel}
          title={content.instructorTitle.length > 0 ? content.instructorTitle.join(' ') : undefined}
        />
        <div className={blocks.instructor}>
          <div className={blocks.instructorAside}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${content.instructorName} — ${content.instructorRole}`}
              className={blocks.instructorPhoto}
              src="/vlad.jpg"
            />
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
            {content.instructorCopy.map((paragraph) => (
              <p className={blocks.prose} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <Link className={blocks.btnSecondary} href="/courses">
              {labels.browseAllCourses}
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className={blocks.instructorAction} src="/vlad-training.jpg" />
          </div>
        </div>
      </Section>

      <Section bordered tone="alt">
        <SectionHeader kicker={content.testimonialsLabel} title={content.testimonialsTitle.join(' ')} />
        <ul className={blocks.testimonials}>
          {content.testimonials.map((testimonial) => (
            <li className={blocks.testiCard} key={testimonial.name}>
              <p aria-label="5/5" className={blocks.testiStars}>
                {[0, 1, 2, 3, 4].map((star) => (
                  <Icon key={star} name="star" size={14} />
                ))}
              </p>
              <blockquote className={blocks.testiQuote}>{testimonial.quote}</blockquote>
              <p className={blocks.testiAuthor}>
                <span className={blocks.avatar}>{testimonial.initial}</span>
                <span>{testimonial.name}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
