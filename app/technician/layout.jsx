import { TechnicianAuthProvider } from "@/contexts/TechnicianAuthContext";

export const metadata = {
  title: "Technician — House Electric",
  robots: { index: false, follow: false },
};

export default function TechnicianRootLayout({ children }) {
  return <TechnicianAuthProvider>{children}</TechnicianAuthProvider>;
}
