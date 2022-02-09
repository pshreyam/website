import Head from 'next/head'
import Image from 'next/image'
import Typewriter from 'typewriter-effect'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Shreyam Pokharel</title>
        <meta name="description" content="Python Programmer and Linux Enthusiast" />
      </Head>

      <main className={styles.main}>
        <h4 className={styles.title}>
          About Me
        </h4>
        <Image alt="Shreyam Pokharel" className={styles.profile__image} src="https://gitlab.com/uploads/-/system/user/avatar/7811853/avatar.png" width={200} height={200} />
      </main>

      <section className={styles.content}>
        <p className={styles.description}>
          Hello, this is
           <Typewriter
            options={{loop:true, cursor: "_"}}
            onInit={(typewriter) => {
              typewriter.typeString('<b>Shreyam Pokharel.</b>')
                .pauseFor(1000)
                .deleteAll()
                .start();
            }}
          />
          I am currently pursuing Computer Engineering at Kathmandu University.
        </p>

        <p>
            <h4 className={styles.skills__header}>My Skills:</h4>
            <ul>
              <li>Python3</li>
              <li>Linux</li>
              <li>Django</li>
              <li>Flask</li>
              <li>PyQt5</li>
            </ul>
        </p>
        <p className={styles.connect}>
          You may connect with me using:
        </p>
        <div className={styles.social__links}>
          <span className={styles.logo}>
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/pshreyam">
                    <Image src="/logo/github.svg" alt="Github Logo" width={72} height={16} />
              </a>
          </span>
          <span className={styles.logo}>
            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/shreyam-pokharel-62334221a/">
                  <Image src="/logo/linked-in.svg" alt="LinkedIn Logo" width={72} height={16} />
            </a>
          </span>
        </div>
        <p className={`${styles.description} ${styles.fade}`}>
          Contents in this website will be updated soon!
        </p>
      </section>

      <footer className={styles.footer}>
        &copy; Shreyam Pokharel (2022)
      </footer>
    </div>
  )
}
