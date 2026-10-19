import { profile } from "@c5-engineer/lib/profile";
import FooterYear from "./footer-year";

export default function Footer() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-[640px] px-6 pb-10 text-center text-sm text-muted">
      © <FooterYear buildYear={new Date().getFullYear()} /> {profile.name}. All
      rights reserved.
    </footer>
  );
}
