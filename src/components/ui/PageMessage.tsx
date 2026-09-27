import styles from './PageMessage.module.scss';

interface Props {
  title: string;
  text?: string;
  children?: React.ReactNode;
}

/** Одна раскладка для всех коротких служебных страниц. */
export function PageMessage({ children, text, title }: Props) {
  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {text ? <p className={styles.text}>{text}</p> : null}
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </main>
  );
}

export { styles as pageMessageStyles };
