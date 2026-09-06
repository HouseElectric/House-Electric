import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export const metadata = {
  title: "Admin — House Electric",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
