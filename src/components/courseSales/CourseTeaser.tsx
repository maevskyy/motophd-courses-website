import styles from './CourseSalesPage.module.scss';

interface Props {
  courseTitle: string;
  embedUrl: null | string;
  title: string;
}

// Бесплатный тизер курса. Без видео (не залито или Stream не настроен)
// секции нет вовсе — пустой чёрный прямоугольник хуже, чем ничего.
export function CourseTeaser({ courseTitle, embedUrl, title }: Props) {
  if (!embedUrl) {
    return null;
  }

  return (
    <section className={styles.teaserSection}>
      <h2 className={styles.salesSection__title}>{title}</h2>
      <div className={styles.teaserFrame}>
        <iframe
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className={styles.teaserFrame__video}
          src={embedUrl}
          title={`${title} — ${courseTitle}`}
        />
      </div>
    </section>
  );
}
