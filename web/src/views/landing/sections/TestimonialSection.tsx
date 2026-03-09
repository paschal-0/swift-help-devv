import styles from "../landing.module.css";

const testimonials = [
  {
    quote:
      "Built with healthcare-grade safeguards to protect patient data, professional records, and organizational operations.",
    name: "Silvia Angel",
    role: "Medical Director",
  },
  {
    quote:
      "Swift HELP helped our team reduce triage wait times and coordinate professionals faster across peak demand hours.",
    name: "David Mensah",
    role: "Operations Lead",
  },
  {
    quote:
      "The workforce module made shift coverage measurable and predictable without sacrificing quality of care.",
    name: "Amaka Nnadi",
    role: "Hospital Admin",
  },
];

export function TestimonialSection() {
  return (
    <section className={styles.testimonialSection}>
      <div className={styles.container}>
        <div className={styles.testimonialLayout}>
          <div className={styles.testimonialCopy}>
            <span className={styles.testimonialBadge}>Testimonial</span>
            <h2>Trusted by Healthcare Providers & Organizations</h2>
            <p>
              Delivering measurable impact across patient care, professional
              efficiency, and operational management.
            </p>
          </div>

          <div className={styles.testimonialRail}>
            {testimonials.map((item, index) => (
              <article key={item.name} className={styles.testimonialCard}>
                <span className={styles.quoteMark}>“</span>
                <p>{item.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.avatar} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
                {index === 0 && <div className={styles.testimonialHighlight} />}
              </article>
            ))}
          </div>
        </div>

        <div className={styles.testimonialControls}>
          <button type="button" aria-label="Previous testimonial">
            ?
          </button>
          <button type="button" aria-label="Next testimonial">
            ?
          </button>
        </div>
      </div>
    </section>
  );
}

