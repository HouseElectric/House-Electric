import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "House Electric — Reliable Electrical Solutions for a Safer Tomorrow",
  description:
    "Electrical repair, installation, maintenance, health checks and annual maintenance contracts for homes, offices and commercial spaces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${caveat.variable}`}>
      <body className="bg-white font-sans text-[15.5px] leading-[1.65] text-body antialiased">
        {children}
      </body>
    </html>
  );
}
