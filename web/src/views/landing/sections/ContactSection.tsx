import styles from "../landing.module.css";

const contacts = [
  {
    title: "VISIT US",
    text: "Stop by our office to speak with our team in person and learn how our platform supports healthcare providers.",
    value: "22, Riley Road, Texas",
  },
  {
    title: "CALL US",
    text: "Prefer to talk? Give us a call and our support team will guide you through any questions.",
    value: "+2348884993662",
  },
  {
    title: "CONTACT US",
    text: "Send us a message and we will get back to you as soon as possible with the help you need.",
    value: "swifthelp@gmail.com",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <div className={styles.ctaBanner}>
          <div className={styles.ctaOverlay} />
          <div className={styles.ctaContent}>
            <h2>Ready to Experience the Future of Healthcare Access?</h2>
            <p>
              Swift HELP connects patients, professionals, and healthcare
              organizations in one intelligent platform.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryCta}>
                Get early access <span aria-hidden>?</span>
              </button>
              <button type="button" className={styles.secondaryCtaLight}>
                Book a demo <span aria-hidden>?</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contactCards}>
          {contacts.map((item) => (
            <article key={item.title} className={styles.contactCard}>
              <div className={styles.contactIcon} aria-hidden>
                {item.title === "VISIT US" ? "¦" : item.title === "CALL US" ? "?" : "?"}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

