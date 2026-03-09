import styles from "../landing.module.css";

const cards = [
  {
    title: "Check Symptoms or Request Care",
    text: "Patients can use the AI symptom checker to understand possible conditions and receive guidance on the next step for care.",
    action: "Analyze symptoms",
  },
  {
    title: "Connect With the Right Professional",
    text: "Search, match, and book qualified healthcare professionals for virtual consultations or in-person services.",
    action: "Book professional",
  },
  {
    title: "Deliver Care or Fill Workforce Needs",
    text: "Healthcare professionals provide consultations, while organizations can post and fill staffing shifts in real time.",
    action: "Start consultation",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className={styles.howSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeadingCenter}>
          <h2>How It Works</h2>
          <p>
            From symptom assessment to professional consultation, our system
            simplifies care delivery in three secure steps.
          </p>
        </div>

        <div className={styles.stepsRow}>
          <div className={styles.stepBubble}>Step 01</div>
          <div className={styles.stepConnector} />
          <div className={styles.stepBubble}>Step 02</div>
          <div className={styles.stepConnector} />
          <div className={styles.stepBubble}>Step 03</div>
        </div>

        <div className={styles.howCards}>
          {cards.map((card, index) => (
            <article key={card.title} className={styles.howCard}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <div className={styles.howDemo}>
                <div className={styles.howDemoInput}>Describe your symptoms</div>
                <button type="button" className={styles.howDemoButton}>
                  {card.action}
                </button>
                {index > 0 && <div className={styles.howDemoSecondary} />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

