import styles from "../landing.module.css";

export function FooterSection() {
  return (
    <footer className={styles.footerSection}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.brandMarkDark}>+</span>
            <span>Swifthelp</span>
          </div>

          <div className={styles.footerLinksGroup}>
            <div className={styles.footerColumn}>
              <a href="#home">Home</a>
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
            </div>

            <div className={styles.footerColumn}>
              <a href="#faq">FAQ&apos;s</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>

            <div className={styles.footerColumn}>
              <a href="#contact">Contact us</a>
              <a href="#">Follow us</a>
              <div className={styles.footerSocials}>
                <span>in</span>
                <span>f</span>
                <span>ig</span>
                <span>x</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerNewsletter}>
          <div>
            <p>Subscribe to our newsletter</p>
            <div className={styles.newsletterInput} />
          </div>
          <button type="button" className={styles.footerSignupButton}>
            Sign Up
          </button>
        </div>

        <p className={styles.copyright}>@2026. all rights reserved</p>
      </div>
    </footer>
  );
}

