import { containerClass } from "../classes";
import { Navbar } from "./Navbar";

export function Header() {
  return (
    <header className="bg-[#e3f2fd] py-[40px] pb-[25px]">
      <div className={containerClass}>
        <Navbar />
      </div>
    </header>
  );
}
