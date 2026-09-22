import { forwardRef } from "react";
import { AmcBadge, CalendarIcon, CheckCircle, HomeIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

const NAVY = "#12294B";
const YELLOW = "#F2B01E";

/**
 * A4-portrait certificate letterhead — deliberately different from the invoice/quotation
 * template (decorative border + centered ceremonial layout) since a certificate reads as
 * a keepsake document, not a line-item bill.
 */
const CertificateTemplate = forwardRef(function CertificateTemplate(
  { amcNumber, planName, customerName, propertyLabel, propertyAddress, startDate, expiryDate, coverage = [], address, phone, email },
  ref
) {
  return (
    <div
      ref={ref}
      className="print:[zoom:0.92] print:mx-auto"
      style={{
        position: "relative",
        width: "794px",
        flexShrink: 0,
        background: "#ffffff",
        fontFamily: "-apple-system, Segoe UI, Roboto, Arial, sans-serif",
        color: "#1a1a1a",
        boxSizing: "border-box",
        padding: "20px",
      }}
    >
      <div style={{ position: "relative", border: `3px solid ${NAVY}`, borderRadius: "10px", padding: "6px" }}>
        <div style={{ border: `1.5px solid ${YELLOW}`, borderRadius: "6px", padding: "28px 52px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <img src="/logo.jpg" alt="House Electric" style={{ height: "30px", width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ width: "30px", height: "1.5px", background: YELLOW }} />
            <span style={{ fontSize: "10.5px", fontWeight: 800, letterSpacing: "2.5px", color: "#8a8a8a" }}>CERTIFICATE OF COVERAGE</span>
            <span style={{ width: "30px", height: "1.5px", background: YELLOW }} />
          </div>

          <div style={{ fontSize: "30px", fontWeight: 900, color: NAVY, lineHeight: 1.2 }}>
            Annual Maintenance <span style={{ color: YELLOW }}>Contract</span>
          </div>

          <p style={{ margin: "12px auto 0", maxWidth: "440px", fontSize: "13px", lineHeight: 1.6, color: "#5a5a5a" }}>
            This certifies that
          </p>
          <div style={{ margin: "6px 0", fontSize: "22px", fontWeight: 800, color: NAVY }}>{customerName || "—"}</div>
          <p style={{ margin: "0 auto", maxWidth: "460px", fontSize: "13px", lineHeight: 1.7, color: "#5a5a5a" }}>
            holds an active <b style={{ color: NAVY }}>{planName}</b> Annual Maintenance Contract with House Electric for the property
            covered below.
          </p>

          <div
            style={{
              margin: "18px 0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              textAlign: "left",
              background: "#FAF8F3",
              border: "1px solid #EAE3D2",
              borderRadius: "14px",
              padding: "16px 24px",
            }}
          >
            <Field icon={AmcBadge} label="AMC Number" value={amcNumber} />
            <Field icon={CheckCircle} label="Plan" value={planName} />
            <Field icon={HomeIcon} label="Property" value={propertyLabel || "—"} />
            <Field icon={PinIcon} label="Property Address" value={propertyAddress || "—"} />
            <Field icon={CalendarIcon} label="Valid From" value={startDate} />
            <Field icon={CalendarIcon} label="Valid Until" value={expiryDate} />
          </div>

          {coverage.length > 0 && (
            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <p style={{ fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.6px", color: "#9a927e", textTransform: "uppercase", marginBottom: "6px" }}>
                Coverage Included
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                {coverage.map((c) => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#3a3a3a" }}>
                    <CheckCircle size={12} color="#059669" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ margin: "0 0 16px", fontSize: "10.5px", color: "#9a927e", lineHeight: 1.5 }}>
            This AMC covers the service component for the maintenance items listed above. Replacement materials, new
            electrical work and major repairs are chargeable separately as per the AMC Terms &amp; Conditions.
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ textAlign: "left" }}>
              <Field icon={PhoneIcon} label="Phone" value={phone} inline />
              <Field icon={MailIcon} label="Email" value={email} inline />
              <div style={{ fontSize: "10.5px", color: "#9a927e", marginTop: "3px" }}>{address}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="font-script" style={{ fontSize: "22px", color: NAVY }}>
                House Electric
              </div>
              <div style={{ width: "170px", borderBottom: "1.5px solid #1a1a1a", marginTop: "2px" }} />
              <div style={{ fontSize: "10px", fontWeight: 700, color: NAVY, marginTop: "5px" }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function Field({ icon: Icon, label, value, inline }) {
  if (inline) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#5a5a5a", marginBottom: "2px" }}>
        <Icon size={11} color={NAVY} />
        {value || "—"}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon size={13} color="#92400E" />
      </span>
      <div>
        <div style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.4px", color: "#9a927e", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: "12.5px", fontWeight: 700, color: NAVY }}>{value}</div>
      </div>
    </div>
  );
}

export default CertificateTemplate;
