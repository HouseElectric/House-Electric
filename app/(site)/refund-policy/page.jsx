import LegalPageLayout from "@/components/LegalPageLayout";
import { getContactSettings } from "@/lib/getContactSettings";

export const metadata = {
  title: "Cancellation & Refund Policy — House Electric",
  description: "House Electric's policy on service cancellations, rescheduling and refunds.",
};

export default async function RefundPolicyPage() {
  const { email, phone } = await getContactSettings();

  const sections = [
    {
      id: "cancelling",
      title: "Cancelling a Service Request",
      body: (
        <>
          <p>
            You may cancel a service request any time before a technician has been assigned or dispatched, at
            no charge. To cancel, contact us by phone, WhatsApp, or through your account dashboard.
          </p>
          <p>
            If a technician has already been assigned or has visited the site, a nominal visit/inspection
            charge may apply, which will be communicated to you before it is charged.
          </p>
        </>
      ),
    },
    {
      id: "rescheduling",
      title: "Rescheduling",
      body: (
        <p>
          You can reschedule your preferred date and time by contacting us, subject to technician
          availability. We'll try to accommodate your new preferred slot wherever possible.
        </p>
      ),
    },
    {
      id: "refunds",
      title: "Refunds",
      body: (
        <ul>
          <li>If you have made an advance payment and cancel before work begins, the advance is refunded in full, minus any inspection/visit charge already incurred.</li>
          <li>If work has already started or materials have been purchased for your job, refunds will be adjusted for the value of work completed and materials used.</li>
          <li>Approved refunds are processed back to the original payment method within 7–10 business days.</li>
        </ul>
      ),
    },
    {
      id: "amc-cancellation",
      title: "AMC Cancellation",
      body: (
        <p>
          Annual Maintenance Contracts may be cancelled by contacting our support team. Any refund for the
          unused portion of an AMC term, if applicable, will be calculated on a pro-rata basis at our
          discretion, minus the value of any visits or services already availed.
        </p>
      ),
    },
    {
      id: "disputed-work",
      title: "Disputed or Incomplete Work",
      body: (
        <p>
          If you're not satisfied with completed work, please contact us within 7 days so we can inspect and,
          where the issue is due to our workmanship, rectify it at no additional cost.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      body: (
        <p>
          For cancellations, rescheduling or refund queries, reach us at <a href={`mailto:${email}`}>{email}</a>{" "}
          or call {phone}.
        </p>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Cancellation & Refund Policy"
      lastUpdated="September 2026"
      sections={sections}
      contact={{ email, phone }}
    />
  );
}
