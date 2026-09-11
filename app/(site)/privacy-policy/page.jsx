import LegalPageLayout from "@/components/LegalPageLayout";
import { getContactSettings } from "@/lib/getContactSettings";

export const metadata = {
  title: "Privacy Policy — House Electric",
  description: "How House Electric collects, uses and protects your personal information.",
};

export default async function PrivacyPolicyPage() {
  const { email, phone, address } = await getContactSettings();

  const sections = [
    {
      id: "overview",
      title: "Overview",
      body: (
        <p>
          House Electric ("we", "us", "our") respects your privacy. This Privacy Policy explains what
          information we collect when you use our website or services, how we use it, and the choices you
          have.
        </p>
      ),
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      body: (
        <ul>
          <li>Contact details you provide — name, mobile number, email address, service location/address.</li>
          <li>Account details if you register for a customer account — email and password (stored securely, never in plain text).</li>
          <li>Service details — the type of service requested, problem description, preferred date/time.</li>
          <li>Communications you send us via our booking form, WhatsApp, phone or email.</li>
          <li>Basic technical data such as browser type and pages visited, used only to improve the website.</li>
        </ul>
      ),
    },
    {
      id: "how-we-use-it",
      title: "How We Use Your Information",
      body: (
        <ul>
          <li>To respond to enquiries and schedule/complete the electrical services you request.</li>
          <li>To send service-related updates — booking confirmation, technician assignment, quotations and invoices.</li>
          <li>To manage your Annual Maintenance Contract (AMC) and send renewal reminders.</li>
          <li>To improve our services and website experience.</li>
        </ul>
      ),
    },
    {
      id: "sharing",
      title: "Sharing of Information",
      body: (
        <p>
          We do not sell your personal information. We may share limited details with technicians assigned
          to your service request, and with payment processors when online payment is available, solely to
          complete the transaction. We may disclose information if required by law.
        </p>
      ),
    },
    {
      id: "data-security",
      title: "Data Security",
      body: (
        <p>
          We use industry-standard measures to protect your data, including encrypted storage and access
          controls. Payment card details are never stored on our servers — all online payments (when
          available) are processed through a secure, PCI-compliant payment gateway.
        </p>
      ),
    },
    {
      id: "your-choices",
      title: "Your Choices",
      body: (
        <p>
          You can review and update your profile information at any time from your account dashboard, or
          contact us to request correction or deletion of your data, subject to any records we are legally
          required to retain.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      body: (
        <p>
          For any privacy-related questions, contact us at <a href={`mailto:${email}`}>{email}</a>, call{" "}
          {phone}, or write to us at {address}.
        </p>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="September 2026"
      sections={sections}
      contact={{ email, phone }}
    />
  );
}
