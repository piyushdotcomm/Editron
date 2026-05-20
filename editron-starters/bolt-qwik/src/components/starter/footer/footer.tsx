import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer class={styles.footer}>
      <div class={styles.container}>
        <div class={styles.grid}>
          <div class={styles.section}>
            <h2 class={styles.logo}>Editron</h2>

            <p class={styles.description}>
              A modern browser-based development environment with AI-powered workflows,
              live previews, and collaborative editing.
            </p>
          </div>

          <div class={styles.section}>
            <h3 class={styles.heading}>Quick Links</h3>

            <a href="/" class={styles.link}>
              Home
            </a>

            <a href="/playground" class={styles.link}>
              Playground
            </a>

            <a href="/dashboard" class={styles.link}>
              Dashboard
            </a>
          </div>

          <div class={styles.section}>
            <h3 class={styles.heading}>Resources</h3>

            <a
              href="https://github.com/piyushdotcomm/Editron"
              target="_blank"
              rel="noopener noreferrer"
              class={styles.link}
            >
              GitHub
            </a>

            <a
              href="https://qwik.builder.io/"
              target="_blank"
              rel="noopener noreferrer"
              class={styles.link}
            >
              Qwik Docs
            </a>
          </div>

          <div class={styles.section}>
            <h3 class={styles.heading}>Community</h3>

            <a
              href="https://github.com/piyushdotcomm/Editron/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class={styles.link}
            >
              Discussions
            </a>

            <a
              href="https://github.com/piyushdotcomm/Editron/issues"
              target="_blank"
              rel="noopener noreferrer"
              class={styles.link}
            >
              Issues
            </a>
          </div>
        </div>
        <div class={styles.socials}>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class={styles.socialIcon}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              class={styles.socialIcon}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>

            <a
              href="mailto:hello@editron.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email"
              class={styles.socialIcon}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-10 5L2 7"></path>
              </svg>
            </a>
          </div>
        <div class={styles.bottom}>
          <p>© 2026 Editron. Built for developers.</p>
        </div>
      </div>
    </footer>
  );
}