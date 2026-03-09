import styles from "../landing.module.css";

const serviceItems = [
  "Teleconsultations",
  "In-home healthcare support",
  "Specialist consultations",
  "Follow-up care coordination",
];

const orgItems = [
  "Post shifts in real time",
  "Receive professional responses instantly",
  "Track shift completion and performance",
  "Maintain continuity in service delivery",
];

export function CapabilitiesSection() {
  return (
    <section className={styles.capabilitiesSection}>
      <div className={styles.container}>
        <h2 className={styles.capabilitiesTitle}>Platform Capabilities</h2>

        <div className={styles.capabilityRow}>
          <div className={styles.capabilityTextBlock}>
            <h3>AI-Assisted Healthcare Intelligence</h3>
            <p>
              Swift HELP uses intelligent triage logic to help patients understand
              symptoms and guide them toward appropriate care options. The platform
              assists decision-making while ensuring healthcare professionals remain
              central to diagnosis and treatment.
            </p>
          </div>
          <div className={styles.capabilityVisual} />
        </div>

        <div className={styles.capabilityRowReverse}>
          <div className={styles.capabilityVisual} />
          <div className={styles.capabilityTextBlockWide}>
            <h3>On-Demand Healthcare Services</h3>
            <p>
              Swift HELP provides a digital marketplace connecting patients with
              verified professionals across various specialties.
            </p>
            <div className={styles.tagLabel}>Services include:</div>
            <ul className={styles.listWithDots}>
              {serviceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <strong>Patients can search, match, and book care with confidence.</strong>
          </div>
        </div>

        <div className={styles.capabilityRow}>
          <div className={styles.capabilityTextBlockWide}>
            <h3>Workforce & Shift Management</h3>
            <p>
              Healthcare organizations can quickly fill workforce gaps through Swift
              HELP&apos;s staffing platform.
            </p>
            <div className={styles.tagLabel}>Organizations can:</div>
            <ul className={styles.listWithDots}>
              {orgItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <strong>
              This ensures healthcare teams remain fully supported when demand rises.
            </strong>
          </div>
          <div className={styles.capabilityVisual} />
        </div>
      </div>
    </section>
  );
}

