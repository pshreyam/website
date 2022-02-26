import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Custom404() {
  return (
    <div className={styles.container}>
      <Head>
        <title>404 - Shreyam Pokharel</title>
        <meta
          name="description"
          content="Python Programmer and Linux Enthusiast"
        />
      </Head>
      <div className={styles.error__container}>
        <p className={styles.error__message}>
          Sorry, the page you are requesting could not be found!
        </p>
      </div>
    </div>
  );
}
