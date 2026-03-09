import styles from "../landing.module.css";

const controls = [
  "End-to-end encryption",
  "Role-based access control",
  "Multi-tenant isolation",
  "Secure infrastructure",
];

export function SecuritySection() {
  return (
    <section className={styles.securitySection}>
      <div className={styles.container}>
        <div className={styles.securityGrid}>
          <div className={styles.securityList}>
            {controls.map((control) => (
              <div key={control} className={styles.securityItem}>
                <span className={styles.securityIcon} aria-hidden>
                  ?
                </span>
                <span>{control}</span>
              </div>
            ))}
          </div>

          <div className={styles.securityCopy}>
            <h2>Security and Compliance by design</h2>
            <p>
              Built with healthcare-grade safeguards to protect patient data,
              professional records, and organizational operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

