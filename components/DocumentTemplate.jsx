import { forwardRef } from "react";
import {
  HomeIcon,
  WrenchIcon,
  LightbulbIcon,
  CheckCircle,
  PinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  CalendarIcon,
  ClockIcon,
  ClipboardIcon,
  UserIcon,
} from "@/components/icons";

const NAVY = "#12294B";
const YELLOW = "#F2B01E";

const FEATURES = [
  { icon: HomeIcon, label: "Electrical Installations" },
  { icon: WrenchIcon, label: "Repairs & Maintenance" },
  { icon: LightbulbIcon, label: "LED & Lighting Solutions" },
  { icon: CheckCircle, label: "Safe. Reliable. Always On." },
];

function splitTerms(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The single shared "letterhead" document layout used both for the on-screen preview
 * and browser printing (window.print()). The footer uses the .doc-print-footer class
 * (see globals.css) to become position:fixed only when printing, so it repeats pinned
 * to the bottom of every physical page even if the content spans multiple pages.
 */
const DocumentTemplate = forwardRef(function DocumentTemplate(
  {
    kind = "quotation",
    docNumber,
    statusLabel,
    statusColor = "#64748b",
    customerName,
    customerEmail,
    customerMobile,
    dateIssued,
    secondaryLabel,
    secondaryValue,
    items = [],
    totals = [],
    finalTotal,
    terms,
    address,
    phone,
    email,
    gstin,
  },
  ref
) {
  const titleSplit = kind === "invoice" ? ["INVO", "ICE"] : ["QUOTA", "TION"];
  const termsList = splitTerms(terms);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "794px",
        flexShrink: 0,
        background: "#ffffff",
        fontFamily: "-apple-system, Segoe UI, Roboto, Arial, sans-serif",
        color: "#1a1a1a",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ============ HEADER ============ */}
      <div style={{ position: "relative", height: "178px", background: "#F7F5EE", overflow: "hidden" }}>
        {/* Diagonal split drawn as SVG polygons — html2canvas doesn't reliably honor CSS clip-path */}
        <svg
          width="794"
          height="178"
          viewBox="0 0 794 178"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        >
          <polygon points="0,0 520,0 430,178 0,178" fill={NAVY} />
          <polygon points="520,0 542,0 452,178 430,178" fill={YELLOW} />
        </svg>

        {/* Left content — over navy */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "420px",
            height: "100%",
            padding: "20px 0 16px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#ffffff",
                padding: "6px 12px",
                borderRadius: "10px",
                boxShadow: "0 4px 14px -3px rgba(0,0,0,0.4)",
              }}
            >
              <img src="/logo.jpg" alt="House Electric" style={{ height: "22px", width: "auto", display: "block" }} />
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <span style={{ width: "16px", height: "1.5px", background: YELLOW, borderRadius: "1px" }} />
              <span style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "1.8px", color: "rgba(255,255,255,0.65)" }}>
                TRUSTED ELECTRICAL SERVICES
              </span>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                style={{
                  width: "88px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  paddingLeft: i === 0 ? 0 : "14px",
                  marginLeft: i === 0 ? 0 : "14px",
                  borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: "27px",
                    height: "27px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(242,176,30,0.14)",
                    border: `1px solid rgba(242,176,30,0.4)`,
                  }}
                >
                  <Icon size={13} color={YELLOW} />
                </span>
                <span style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.35 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right content — over light area */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            padding: "20px 34px 16px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1.6px", color: "rgba(18,41,75,0.55)", lineHeight: 1.6 }}>
            POWERING
            <br />A BRIGHTER TOMORROW
          </div>

          <div>
            <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "1px", lineHeight: 1 }}>
              <span style={{ color: NAVY }}>{titleSplit[0]}</span>
              <span style={{ color: YELLOW }}>{titleSplit[1]}</span>
            </div>
            <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "1.2px", color: "#9a9a9a", marginTop: "3px" }}>
              QUALITY PRODUCTS. BETTER SPACES.
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "3px 13px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                fontSize: "10.5px",
                fontWeight: 800,
                color: NAVY,
              }}
            >
              {docNumber}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "6px",
                marginLeft: "auto",
                width: "fit-content",
                padding: "3px 13px",
                borderRadius: "999px",
                border: `1.5px solid ${statusColor}`,
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                color: statusColor,
              }}
            >
              <CheckCircle size={11} color={statusColor} />
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="doc-print-body" style={{ position: "relative", padding: "22px 44px 0" }}>
        {/* Decorative background flourishes */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(242,176,30,0.10) 0%, rgba(242,176,30,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "0",
            width: "70px",
            height: "70px",
            backgroundImage: "radial-gradient(#E9D9AE 1.4px, transparent 1.4px)",
            backgroundSize: "10px 10px",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* Company info + illustration */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: NAVY }}>House Electric</div>
            <div style={{ fontSize: "10.5px", color: "#8a8a8a", fontWeight: 600, marginBottom: "8px" }}>
              Trusted Electrical Services in Delhi
            </div>
            <InfoLine icon={PinIcon} text={address} />
            <InfoLine icon={PhoneIcon} text={phone} />
            <InfoLine icon={MailIcon} text={email} />
            {gstin && <InfoLine icon={GlobeIcon} text={`GSTIN: ${gstin}`} bold />}
          </div>

          <div style={{ width: "170px", display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
            <LightbulbIcon size={42} color={YELLOW} strokeWidth={1.5} />
            <div className="font-script" style={{ fontSize: "21px", color: NAVY, lineHeight: 1.05, textAlign: "center", marginTop: "3px" }}>
              Bright Ideas
              <br />
              Better Spaces
            </div>
            <div style={{ width: "60px", height: "3px", background: YELLOW, borderRadius: "2px", marginTop: "3px" }} />
          </div>
        </div>

        {/* Billed to + dates */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            background: "#F3F1EA",
            border: "1px solid #EAE3D2",
            borderRadius: "14px",
            padding: "13px 22px",
            marginBottom: "16px",
            breakInside: "avoid",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: YELLOW,
                boxShadow: "0 6px 14px -4px rgba(242,176,30,0.55)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <UserIcon size={18} color={NAVY} />
            </span>
            <div>
              <div style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.6px", color: "#9a927e", textTransform: "uppercase" }}>
                Billed To
              </div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: NAVY }}>{customerName}</div>
              <div style={{ fontSize: "11.5px", color: "#6b6b6b" }}>{customerEmail}</div>
            </div>
          </div>

          <div style={{ width: "1px", alignSelf: "stretch", background: "#E3DECF" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "180px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarIcon size={13} color={NAVY} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a927e", flex: 1 }}>Date Issued</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: NAVY }}>{dateIssued}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ClockIcon size={13} color={NAVY} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a927e", flex: 1 }}>{secondaryLabel}</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: NAVY }}>{secondaryValue || "—"}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", breakInside: "avoid" }}>
          <thead>
            <tr style={{ background: NAVY }}>
              <Th style={{ width: "34px", textAlign: "center" }}>#</Th>
              <Th style={{ textAlign: "left" }}>Description</Th>
              <Th style={{ textAlign: "right" }}>Qty</Th>
              <Th style={{ textAlign: "right" }}>Rate</Th>
              <Th style={{ textAlign: "right" }}>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? "#FAF8F3" : "#ffffff", borderBottom: "1px solid #EFE9DC" }}>
                <td style={{ padding: "8px 8px", textAlign: "center", color: "#9a927e", fontWeight: 700 }}>{i + 1}</td>
                <td style={{ padding: "8px 8px", fontWeight: 600, color: "#1a1a1a" }}>{it.description}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", color: "#5a5a5a" }}>{it.qty}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", color: "#5a5a5a" }}>₹{Number(it.rate).toLocaleString("en-IN")}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", fontWeight: 800, color: NAVY }}>
                  ₹{Number(it.qty * it.rate).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Thank-you + totals row */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "16px", breakInside: "avoid" }}>
          <LightbulbIcon
            size={170}
            color={NAVY}
            strokeWidth={1}
            style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: 0.035 }}
          />

          <div style={{ maxWidth: "260px", position: "relative" }}>
            <div className="font-script" style={{ fontSize: "26px", color: NAVY, lineHeight: 1 }}>
              Thank You!
            </div>
            <div style={{ width: "50px", height: "3px", background: YELLOW, borderRadius: "2px", margin: "3px 0 7px" }} />
            <div style={{ fontSize: "11.5px", color: "#5a5a5a", fontWeight: 600 }}>for choosing House Electric</div>
            <div style={{ fontSize: "10px", color: "#9a927e", marginTop: "7px", lineHeight: 1.5 }}>
              This is a system-generated {kind} and does not require a physical stamp.
            </div>
          </div>

          <div style={{ width: "250px", position: "relative", flex: "none" }}>
            <div style={{ border: "1px solid #E3DECF", borderRadius: "12px", padding: "12px 16px", background: "#FAF8F3", boxShadow: "0 2px 8px -4px rgba(20,20,20,0.06)" }}>
              {totals.map((t) => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5a5a5a", padding: "2px 0" }}>
                  <span>{t.label}</span>
                  <span style={{ fontWeight: 700, color: t.color || NAVY }}>{t.value}</span>
                </div>
              ))}
            </div>
            {finalTotal && (
              <div
                style={{
                  marginTop: "6px",
                  background: `linear-gradient(135deg, #FFDD6B, ${YELLOW})`,
                  borderRadius: "10px",
                  padding: "10px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 10px 22px -10px rgba(242,176,30,0.7)",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 800, color: NAVY }}>{finalTotal.label}</span>
                <span style={{ fontSize: "16px", fontWeight: 900, color: NAVY }}>{finalTotal.value}</span>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        {termsList.length > 0 && (
          <div style={{ background: "#F3F1EA", border: "1px solid #EAE3D2", borderRadius: "14px", padding: "13px 20px", marginTop: "16px", breakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
              <ClipboardIcon size={14} color={NAVY} />
              <span style={{ fontSize: "12px", fontWeight: 800, color: NAVY }}>Terms &amp; Conditions</span>
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: "11px", color: "#5a5a5a", lineHeight: 1.65 }}>
              {termsList.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "22px", breakInside: "avoid" }}>
          <div style={{ fontSize: "10.5px", color: "#c2baa4", maxWidth: "240px" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-script" style={{ fontSize: "24px", color: NAVY }}>
              House Electric
            </div>
            <div style={{ width: "180px", borderBottom: "1.5px solid #1a1a1a", marginTop: "2px" }} />
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: NAVY, marginTop: "5px" }}>Authorized Signatory</div>
            <div style={{ fontSize: "10px", color: "#9a927e" }}>House Electric</div>
          </div>
        </div>

      </div>

      {/* ============ FOOTER — normal flow on screen, fixed-to-page-bottom (repeats on every printed page) when printing ============ */}
      <div className="doc-print-footer" style={{ height: "56px", background: NAVY, overflow: "hidden", breakInside: "avoid" }}>
        <svg
          width="794"
          height="56"
          viewBox="0 0 794 56"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0.9 }}
        >
          <polygon points="556,0 794,0 794,56 460,56" fill={YELLOW} />
        </svg>
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 36px",
          }}
        >
          <div style={{ display: "flex", gap: "18px" }}>
            <FooterItem icon={PhoneIcon} text={phone} />
            <FooterItem icon={MailIcon} text={email} />
            <FooterItem icon={PinIcon} text="New Delhi, Delhi" />
          </div>
          <div className="font-script" style={{ fontSize: "15px", color: NAVY, textAlign: "right", lineHeight: 1.1 }}>
            Let's Build a Brighter
            <br />
            Tomorrow Together
          </div>
        </div>
      </div>
    </div>
  );
});

function InfoLine({ icon: Icon, text, bold }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "5px", maxWidth: "300px" }}>
      <Icon size={12} color={NAVY} style={{ marginTop: "2px", flex: "none" }} />
      <span style={{ fontSize: "11.5px", color: bold ? NAVY : "#5a5a5a", fontWeight: bold ? 700 : 500, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function Th({ children, style }) {
  return (
    <th
      style={{
        padding: "12px 10px",
        color: "#fff",
        fontSize: "10.5px",
        fontWeight: 800,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function FooterItem({ icon: Icon, text }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Icon size={13} color={YELLOW} />
      <span style={{ fontSize: "10.5px", color: "#fff", fontWeight: 600 }}>{text}</span>
    </div>
  );
}

export default DocumentTemplate;
