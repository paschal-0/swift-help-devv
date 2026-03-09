import styles from "../landing.module.css";

const questions = [
  "How does AI triage work on Swift HELP?",
  "Is patient data secure and compliant?",
  "Can organizations manage workforce shifts?",
  "How can healthcare professionals join?",
  "Does Swift HELP support teleconsultations?",
];

export function FaqSection() {
  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.faqGrid}>
          <div className={styles.faqIntro}>
            <h2>Frequently Asked Questions</h2>
            <p>
              Clear answers about AI triage, data security, compliance, and platform
              capabilities.
            </p>
          </div>

          <div className={styles.faqList}>
            {questions.slice(0, 2).map((question) => (
              <article key={question} className={styles.faqItem}>
                <span>{question}</span>
                <span aria-hidden>?</span>
              </article>
            ))}

            <article className={styles.faqItemOpen}>
              <div>
                <h3>How can I get started with Swift HELP?</h3>
                <p>
                  Request early access or book a demo. Our onboarding team guides
                  patients, professionals, and organizations based on your use case.
                </p>
              </div>
              <span aria-hidden>?</span>
            </article>

            {questions.slice(2).map((question) => (
              <article key={question} className={styles.faqItem}>
                <span>{question}</span>
                <span aria-hidden>?</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

