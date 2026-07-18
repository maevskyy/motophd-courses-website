import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
import type { Course, HomeContent } from '@/lib/content';
import { landingStyles as styles } from './styles';

interface Props {
  content: HomeContent;
  courses: Course[];
  labels: {
    startLearning: string;
    viewCourses: string;
  };
}

export function LandingTop({ content, courses, labels }: Props) {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <div className={styles.hero__grid} />
        <div className={styles.hero__glow} />
        <div className={styles.hero__content}>
          <div className={styles.hero__badge}>{content.heroBadge}</div>
          <h1 className={styles.hero__title}>
            {content.heroTitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            <span className={styles.red}>{content.heroRed}</span>
            <br />
            {content.heroAfterRed}
          </h1>
          <p className={styles.hero__sub}>{content.heroSub}</p>
          <div className={styles.hero__buttons}>
            <Link className={styles.button} href="/courses">
              {labels.startLearning}
            </Link>
            <Link className={styles.buttonGhost} href="/courses">
              {labels.viewCourses}
            </Link>
          </div>
          <div className={styles.hero__stats}>
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <div className={styles.stat__num}>
                  {stat.accent ? (
                    <>
                      <span className={styles.red}>{stat.accent}</span>
                      {stat.value.replace(stat.accent, '')}
                    </>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className={styles.stat__label}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className={styles.authority}>
        <div className={styles.authority__inner}>
          {content.stats.map((stat) => (
            <div className={styles.authority__item} key={stat.label}>
              <div className={styles.authority__num}>
                {stat.accent ? <span className={styles.red}>{stat.accent}</span> : stat.value}
                {stat.accent ? stat.value.replace(stat.accent, '') : null}
              </div>
              <div className={styles.authority__label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <section className={styles.section}>
        <div className={styles.section__label}>{content.coursesLabel}</div>
        <h2 className={styles.section__title}>
          {content.coursesTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <p className={styles.section__sub}>{content.coursesSub}</p>
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <CourseCard course={course} key={course.slug} />
          ))}
        </div>
      </section>
      <hr className={styles.divider} />
      <section className={styles.section}>
        <div className={styles.section__label}>{content.methodLabel}</div>
        <h2 className={styles.section__title}>{content.methodTitle}</h2>
        <p className={styles.section__sub}>{content.methodSub}</p>
        <div className={styles.methodGrid}>
          {content.method.map((item) => (
            <div className={styles.methodCard} key={item.title}>
              <div className={styles.methodIcon}>{item.icon}</div>
              <div className={styles.methodNum}>{item.num}</div>
              <div className={styles.methodTitle}>{item.title}</div>
              <div className={styles.methodDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <hr className={styles.divider} />
      <section className={styles.section}>
        <div className={styles.section__label}>{content.testimonialsLabel}</div>
        <h2 className={styles.section__title}>
          {content.testimonialsTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <div className={styles.testimonialsGrid}>
          {content.testimonials.map((testimonial) => (
            <article className={styles.testiCard} key={testimonial.name}>
              <div className={styles.testiStars}>★★★★★</div>
              <blockquote className={styles.testiQuote}>“{testimonial.quote}”</blockquote>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar}>{testimonial.initial}</div>
                <div>
                  <div className={styles.testiName}>{testimonial.name}</div>
                  <div className={styles.testiCountry}>{testimonial.country}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <hr className={styles.divider} />
    </>
  );
}
