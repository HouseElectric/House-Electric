// Shared AMC terms body — used on the full /terms-and-conditions page (#amc section) and inside
// the AmcTermsModal on the AMC checkout page, so the wording only lives in one place.
export default function AmcTermsContent() {
  return (
    <>
      <p>
        These AMC-specific terms apply in addition to the general terms on this page whenever you purchase,
        renew or hold an Annual Maintenance Contract with House Electric.
      </p>

      <h3>Validity &amp; Coverage</h3>
      <p>
        Your AMC is valid for the duration shown on your plan (typically 12 months) starting from the
        activation date, for the specific property registered against it. Coverage is limited to the
        service items explicitly listed as included in your plan.
      </p>

      <h3>Service Request Process</h3>
      <p>
        Report a fault through the customer portal, WhatsApp or phone. Every request is registered with a
        unique Service Request ID, assigned to a technician, and tracked through to resolution and your
        confirmation.
      </p>

      <h3>Service / Visit Charges</h3>
      <p>
        For issues covered under your plan, the service visit and labour for diagnosis and covered
        troubleshooting are <strong>not charged separately</strong> — this is what your annual subscription
        pays for.
      </p>

      <h3>Material, New Work &amp; Major Repair Charges</h3>
      <p>
        Replacement materials (e.g. MCB, RCCB/RCBO, switches, sockets, fixtures, fans), new electrical
        points, new wiring or rewiring, DB replacement or new installation, major repairs, equipment
        replacement, and civil/false-ceiling/special-access work are <strong>not included</strong> in any
        AMC plan and are chargeable separately. You will always receive a quotation for such work, and it
        is carried out only after you approve it online — never automatically billed.
      </p>

      <h3>Exclusions</h3>
      <p>
        Your plan page and AMC certificate list the specific exclusions applicable to your plan. As a
        general rule, anything beyond preventive inspection, diagnosis and covered troubleshooting is
        treated as chargeable work under the section above.
      </p>

      <h3>Customer Access &amp; Service Timing</h3>
      <p>
        You agree to provide reasonable access to the property at the scheduled visit time. Visits are
        generally scheduled during normal business hours; off-hours or emergency visits may attract
        additional charges where applicable.
      </p>

      <h3>Response Time</h3>
      <p>
        Each plan displays a target response tier (e.g. Standard or Priority Response). These are
        operational targets, not guaranteed contractual response times, unless separately agreed in writing
        for a Commercial or Corporate AMC.
      </p>

      <h3>Cancellation &amp; Refund</h3>
      <p>
        AMC subscriptions are annual commitments. Cancellation requests can be raised through your account
        or by contacting support; any refund, if applicable, will be assessed on a pro-rata basis at House
        Electric's discretion, less the value of any visits or services already availed.
      </p>

      <h3>Renewal</h3>
      <p>
        You will be reminded ahead of your AMC's expiry from your dashboard and by email. Renewal can be
        completed online from your account. Coverage lapses if the AMC is not renewed before its expiry
        date, and a new AMC would need to be purchased to restore coverage.
      </p>

      <h3>Force Majeure</h3>
      <p>
        House Electric is not liable for delays or failure to perform services due to circumstances beyond
        its reasonable control, including natural disasters, government restrictions, strikes, or other
        events of force majeure.
      </p>

      <h3>Commercial &amp; Corporate AMC Conditions</h3>
      <p>
        Commercial and Corporate/Institutional AMCs are governed by the specific scope, visit frequency,
        SLA, manpower, materials and exclusions defined in the customer's accepted quotation, which forms
        part of these terms for that account.
      </p>

      <p className="text-[12.5px] text-body">
        This AMC terms draft is provided as a working baseline and should be reviewed and finalised with
        House Electric's legal counsel before public launch.
      </p>
    </>
  );
}
