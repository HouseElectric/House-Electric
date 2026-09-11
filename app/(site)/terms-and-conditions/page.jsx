import LegalPageLayout from "@/components/LegalPageLayout";
import { getContactSettings } from "@/lib/getContactSettings";

export const metadata = {
  title: "Terms & Conditions — House Electric",
  description: "Terms and conditions for using House Electric's website and electrical services.",
};

export default async function TermsPage() {
  const { email, phone } = await getContactSettings();

  const sections = [
    {
      id: "overview",
      title: "Overview",
      body: (
        <p>
          These Terms &amp; Conditions govern your use of the House Electric website and the electrical
          services we provide. By booking a service, creating an account, or using this website, you agree
          to these terms.
        </p>
      ),
    },
    {
      id: "services",
      title: "Services",
      body: (
        <p>
          House Electric provides electrical repair, installation, maintenance, health checks, Annual
          Maintenance Contracts (AMC) and related electrical services for residential, commercial and
          corporate properties. Availability of a specific service depends on your location and our current
          service areas.
        </p>
      ),
    },
    {
      id: "bookings",
      title: "Bookings & Quotations",
      body: (
        <ul>
          <li>Submitting a booking or enquiry form does not guarantee a fixed price — final pricing is confirmed after inspection, or as stated in a formal quotation.</li>
          <li>A quotation is valid only until the date mentioned on it. Prices may change after expiry.</li>
          <li>Work begins only after you accept a quotation, where one has been issued.</li>
        </ul>
      ),
    },
    {
      id: "payments",
      title: "Payments & Invoices",
      body: (
        <p>
          Invoices are issued for completed work and/or AMC plans. Payment terms will be communicated at the
          time of quotation or invoicing. Where online payment is available, it is processed through a secure
          third-party payment gateway; House Electric does not store your card details.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Customer Accounts",
      body: (
        <p>
          You are responsible for maintaining the confidentiality of your account login details and for all
          activity under your account. Please notify us immediately of any unauthorised use.
        </p>
      ),
    },
    {
      id: "amc",
      title: "Annual Maintenance Contracts (AMC)",
      body: (
        <p>
          AMC coverage, duration and pricing are as described on your AMC plan at the time of activation. AMC
          benefits apply only to the services explicitly listed in your plan's coverage.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      body: (
        <p>
          While we take all reasonable care and follow standard safety practices, House Electric is not
          liable for pre-existing faults, damage caused by third-party equipment, or issues arising from work
          not performed by House Electric.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      body: (
        <p>
          We may update these terms from time to time. Continued use of our website or services after an
          update constitutes acceptance of the revised terms.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      body: (
        <p>
          Questions about these terms can be sent to <a href={`mailto:${email}`}>{email}</a> or by calling{" "}
          {phone}.
        </p>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Terms & Conditions"
      lastUpdated="September 2026"
      sections={sections}
      contact={{ email, phone }}
    />
  );
}
