import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Shreyam Pokharel</title>
        <meta
          name="description"
          content="Python Programmer and Linux Enthusiast"
        />
      </Head>

      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link href="/">
            <Image
              alt="Logo"
              className={styles.brand__logo}
              src="/logo.png"
              width={40}
              height={40}
            />
          </Link>
        </div>
        <ul className={styles.nav__links}>
          <li className={[styles.nav__link, styles.active].join(" ")}>
          {/* Add Links to different pages */}
          {/* <Link href="/">Home</Link>*/}
          {/* <Link href="/blogs">Blogs</Link>*/}
          </li>
        </ul>
      </nav>

      <main className={styles.main}>
        <section className={styles.header}>
          <Image
            alt="Shreyam Pokharel"
            className={styles.profile__image}
            src="/shreyam.jpg"
            width={150}
            height={150}
          />

          <p className={styles.description}>
            <b>Shreyam Pokharel</b><br />
          </p>
          <p className={styles.text}>
    I am a passionate Linux enthusiast with a strong penchant for Python programming. I am also familiar with JavaScript, C, C++, and Bash. During my free time, I love delving into innovative programming and tech concepts. I am also interested in learning about GNU/Linux tools and concepts.
          </p>
        </section>

        <section className={styles.connect}>
          <p className={styles.connect}><b>Feel free to reach out to me!</b></p>
            <div className={styles.social__links}>
              <span className={styles.logo}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/pshreyam"
                >
                  <Image
                    src="/assets/github.svg"
                    alt="Github Logo"
                    width={72}
                    height={16}
                  />
                </a>
              </span>
              <span className={styles.logo}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.linkedin.com/in/shreyam-pokharel-62334221a/"
                >
                  <Image
                    src="/assets/linked-in.svg"
                    alt="LinkedIn Logo"
                    width={72}
                    height={16}
                  />
                </a>
              </span>
              <span className={styles.logo}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="mailto:pshreyam@gmail.com"
                >
                  <Image
                    src="/assets/email.svg"
                    alt="Email Logo"
                    width={72}
                    height={16}
                  />
                </a>
              </span>
            </div>
        </section>
      </main>

      <footer className={styles.footer}>&copy; Shreyam Pokharel (2023)</footer>
    </div>
  );
}
