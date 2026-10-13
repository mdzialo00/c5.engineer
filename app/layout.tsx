import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maciek Działo, Software Engineer",
  description:
    "Maciek Działo is a software engineer based in Kraków, Poland. Contact details and links.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
