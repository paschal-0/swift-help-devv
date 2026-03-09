import styles from "../landing.module.css";

const features = [
  {
    title: "Patients",
    text: "Check symptoms, book consultations, and manage care.",
  },
  {
    title: "Professionals",
    text: "Offer services, manage schedules, and grow your reach.",
  },
  {
    title: "Organizations",
    text: "Fill staffing gaps and manage workforce efficiently.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.featuresHeadingRow}>
          <h2>Built for Every Healthcare Stakeholder</h2>
          <p>Swift HELP is designed to serve the entire healthcare ecosystem.</p>
        </div>

        <div className={styles.featureCards}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureImage} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <button type="button" className={styles.learnMoreButton}>
                Learn More
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

