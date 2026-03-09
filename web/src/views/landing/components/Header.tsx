import { Navbar } from "./Navbar";
import styles from "../landing.module.css";

export function Header() {
  return (
    <header className={styles.headerWrap}>
      <div className={styles.container}>
        <Navbar />
      </div>
    </header>
  );
}

