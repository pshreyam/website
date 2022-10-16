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
            <Typewriter
              options={{ loop: true, cursor: "_" }}
              onInit={(typewriter) => {
                typewriter
                  .typeString("<b>Shreyam Pokharel.</b>")
                  .pauseFor(1000)
                  .deleteAll()
                  .start();
              }}
            />
            Computer Engineering @ Kathmandu University <br />
            (2018 - present)
          </p>
          <p>I am a Linux enthusiast and have strong interests in programming. I code mainly in (but not limited to) Python programming language. Besides Python, I am also able to work with languages such as Rust and Javascript. I also have fair bit of experience around scripting using Python and Bash. I spend my leisure hours exploring about new ideas, especially related to programming and technologies.</p>
        </section>

        {/*
        <section className={styles.skills}>
          <h1 className={styles.skills__header}>My Skills:</h1>
          <p>
            <ul>
              <li>Python3</li>
              <li>Linux</li>
              <li>Django</li>
              <li>Flask</li>
              <li>PyQt5</li>
            </ul>
          </p>
        </section>
        */}

        <section className={styles.connect}>
          <p className={styles.connect}><b>Connect with me!</b></p>
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

      <footer className={styles.footer}>&copy; Shreyam Pokharel (2022)</footer>
    </div>
  );
}
