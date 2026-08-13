import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
import type { HomeContent } from '@/lib/content';
import type { CourseCardCourse } from '@/lib/data';
import { landingStyles as styles } from './styles';

interface Props {
  content: HomeContent;
  courses: CourseCardCourse[];
  labels: {
    startLearning: string;
    viewCourses: string;
    browseAllCourses: string;
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
            {content.stats.map((stat) => {
              const body = (
                <>
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
                  {stat.note ? (
                    <div className={styles.stat__note}>
                      {stat.noteAccent ? (
                        <>
                          {stat.note.split(stat.noteAccent)[0]}
                          <span className={styles.red}>{stat.noteAccent}</span>
                          {stat.note.split(stat.noteAccent)[1]}
                        </>
                      ) : (
                        stat.note
                      )}
                    </div>
                  ) : null}
                </>
              );

              return stat.href ? (
                <a
                  className={styles.stat__link}
                  href={stat.href}
                  key={stat.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {body}
                </a>
              ) : (
                <div key={stat.label}>{body}</div>
              );
            })}
          </div>
        </div>
      </section>
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
      <div id="about-anchor" />
      <hr className={styles.divider} />
      <section className={styles.section}>
        <div className={styles.section__label}>{content.instructorLabel}</div>
        <div className={styles.instructorGrid}>
          <div>
            <h2 className={styles.section__title}>
              {content.instructorTitle.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            {content.instructorCopy.map((paragraph) => (
              <p className={styles.instructorCopy} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <Link className={styles.button} href="/courses">
              {labels.browseAllCourses}
            </Link>
          </div>
          <div className={styles.instructorCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={content.instructorName} className={styles.instructorPhoto} src="/vlad.jpg" />
            <div className={styles.instructorName}>{content.instructorName}</div>
            <div className={styles.instructorRole}>{content.instructorRole}</div>
            {content.instructorCredentials ? (
              <ul className={styles.instructorCredentials}>
                {content.instructorCredentials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
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
                <div className={styles.testiName}>{testimonial.name}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <hr className={styles.divider} />
    </>
  );
}
