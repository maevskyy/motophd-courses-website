import type { CurriculumModule } from '@/lib/data';
import styles from './CourseProgram.module.scss';

// Программа на странице продажи — витрина, а не навигация: просто список
// уровней без раскрытия и без ссылок в плеер. Уроки внутри уровней тут не
// перечисляем — их состав живёт в плеере после покупки.
export function CourseProgram({ modules }: { modules: CurriculumModule[] }) {
  return (
    <ol className={styles.list}>
      {modules.map((module) => (
        <li className={styles.item} key={module.number}>
          <span className={styles.number}>{module.number}</span>
          <span className={styles.title}>{module.title}</span>
        </li>
      ))}
    </ol>
  );
}
