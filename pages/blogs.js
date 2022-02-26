import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import styles from "../styles/Home.module.css";

export default function Blogs() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Blogs - Shreyam Pokharel</title>
        <meta
          name="description"
          content="Python Programmer and Linux Enthusiast"
        />
      </Head>

      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link href="/">
            <Image
              alt="SP Logo"
              className={styles.brand__logo}
              src="/logo.png"
              width={40}
              height={40}
            />
          </Link>
        </div>
        <ul className={styles.nav__links}>
          <li className={styles.nav__link}>
            <Link href="/">Home</Link>
          </li>
          <li className={[styles.nav__link, styles.active].join(" ")}>
            <Link href="/blogs">Blogs</Link>
          </li>
        </ul>
      </nav>

      <main className={styles.sub__container}>This is the Blogs Page!</main>

      <footer className={styles.footer}>&copy; Shreyam Pokharel (2022)</footer>
    </div>
  );
}
