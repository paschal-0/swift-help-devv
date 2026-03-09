import styles from "../landing.module.css";

export function HeroSection() {
  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Smarter Healthcare Access, Workforce, and AI Triage - All in One
              Platform
            </h1>
            <p className={styles.heroText}>
              Swift HELP connects patients, healthcare professionals, and organizations
              through intelligent symptom triage, on-demand care services, and real-time
              workforce management.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryCta}>
                Get early access <span aria-hidden>?</span>
              </button>
              <button type="button" className={styles.secondaryCta}>
                Book a demo <span aria-hidden>?</span>
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCircle} />
            <div className={styles.heroPortrait} />
            <div className={styles.heroBadgeTop}>Intelligent Workforce Management</div>
            <div className={styles.heroBadgeMiddle}>Smarter Healthcare</div>
            <div className={styles.heroBadgeBottom}>Smarter Workflow</div>
          </div>
        </div>

        <div className={styles.trustedBox}>
          <p className={styles.trustedTitle}>Trusted Platform for</p>
          <div className={styles.trustedPills}>
            <span className={styles.trustedPillPrimary}>Patients</span>
            <span className={styles.trustedPillDark}>Healthcare Professionals</span>
            <span className={styles.trustedPillLight}>Organisations</span>
          </div>
        </div>
      </div>
    </section>
  );
}

