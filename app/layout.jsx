import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "House Electric — Electrical Services in Delhi | Repair, Installation & AMC",
  description:
    "Professional electrician services in Delhi — electrical repair, installation, maintenance, health checks and Annual Maintenance Contracts (AMC) for homes, offices and commercial properties.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  authors: [{ name: "Nexa Solutions", url: "https://www.nexa-solutions.in/" }],
  creator: "Nexa Solutions",
  publisher: "Nexa Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${caveat.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="bg-white font-sans text-[15.5px] leading-[1.65] text-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#141414",
              color: "#FFFFFF",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "13.5px",
              fontWeight: 600,
              boxShadow: "0 12px 32px -8px rgba(20,20,20,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            },
            success: {
              iconTheme: { primary: "#F2B01E", secondary: "#141414" },
              style: { background: "#141414", color: "#FFFFFF" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
              style: { background: "#141414", color: "#FFFFFF" },
            },
          }}
        />
      </body>
    </html>
  );
}
