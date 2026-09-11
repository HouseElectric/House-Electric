import LegalPageLayout from "@/components/LegalPageLayout";
import { getContactSettings } from "@/lib/getContactSettings";

export const metadata = {
  title: "Disclaimer — House Electric",
  description: "Disclaimer regarding the information and services provided on the House Electric website.",
};

export default async function DisclaimerPage() {
  const { email, phone } = await getContactSettings();

  const sections = [
    {
      id: "general",
      title: "General Information",
      body: (
        <p>
          The content on this website — including service descriptions, blog articles and electrical safety
          tips — is provided for general informational purposes only. It is not a substitute for an
          in-person inspection by a qualified electrician.
        </p>
      ),
    },
    {
      id: "no-diy",
      title: "No DIY Guarantee",
      body: (
        <p>
          Any electrical safety tips or maintenance checklists shared on this website or blog are general
          guidance only. Electrical work carries real safety risk — always have work performed or reviewed by
          a qualified, licensed electrician. House Electric is not responsible for injury or damage resulting
          from electrical work performed by anyone other than our technicians.
        </p>
      ),
    },
    {
      id: "service-areas",
      title: "Service Areas & Availability",
      body: (
        <p>
          Service areas, response times and "emergency" or "24/7" availability mentioned on this website
          reflect our current service capability and may change without notice. Please confirm availability
          for your specific location and timing when booking.
        </p>
      ),
    },
    {
      id: "pricing",
      title: "Pricing",
      body: (
        <p>
          Any pricing shown on this website is indicative and subject to confirmation after inspection or via
          a formal quotation, unless explicitly marked as fixed/final pricing.
        </p>
      ),
    },
    {
      id: "third-party-links",
      title: "Third-Party Links",
      body: (
        <p>
          This website may link to third-party sites (such as our Google Business Profile or payment
          gateway). We are not responsible for the content or practices of those external sites.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      body: (
        <p>
          Questions about this disclaimer can be sent to <a href={`mailto:${email}`}>{email}</a> or by calling{" "}
          {phone}.
        </p>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Disclaimer"
      lastUpdated="September 2026"
      sections={sections}
      contact={{ email, phone }}
    />
  );
}
