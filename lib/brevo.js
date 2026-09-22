const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in";
const LOGO_URL = `${SITE_URL}/logo.jpg`;
const NAVY = "#141414";
const YELLOW = "#F2B01E";

// Every template's fragment gets wrapped in a real HTML document with a viewport meta
// tag + a handful of mobile media-query overrides — without this, phone mail apps often
// render at a fixed desktop width and shrink everything down, forcing a pinch-to-zoom.
function wrapEmailDocument(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title></title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  table { border-collapse: collapse !important; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: #F1ECE1; }
  @media only screen and (max-width: 480px) {
    .eh-wrap { padding: 20px 10px !important; }
    .eh-header-pad { padding: 20px 18px !important; }
    .eh-logo-cell { display: block !important; width: 100% !important; text-align: center !important; padding-bottom: 10px !important; }
    .eh-tag-cell { display: block !important; width: 100% !important; text-align: center !important; border-left: none !important; padding-left: 0 !important; }
    .eh-hero-pad { padding: 26px 18px 6px !important; }
    .eh-body-pad { padding: 6px 18px 26px !important; }
    .eh-footer-pad { padding: 22px 18px !important; }
    .eh-h1 { font-size: 21px !important; }
    .eh-otp-box { width: 30px !important; height: 40px !important; font-size: 18px !important; }
    .eh-otp-cell { padding: 0 3px !important; }
    .eh-details-cell { display: block !important; width: 100% !important; padding: 16px !important; }
    .eh-details-divider { display: none !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F1ECE1;">
${bodyHtml}
</body>
</html>`;
}

async function sendEmail({ to, name, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "House Electric";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL in your .env file.");
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to, name: name || undefined }],
      subject,
      htmlContent: wrapEmailDocument(html),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to send email (${res.status}): ${body}`);
  }
}

// Real emoji glyphs instead of hand-drawn CSS-shape approximations — emoji are plain
// Unicode text (not <img> tags), so Gmail/Outlook/Apple Mail all render them natively
// with zero image loading, and they look far more polished than boxes-built-from-divs.
const EMOJI = {
  lock: "🔒",
  mail: "✉️",
  shield: "🛡️",
  diamond: "💎",
  headset: "🎧",
  bell: "🔔",
  wrench: "🔧",
  check: "✅",
  calendar: "📅",
};

function icon(name, color, size = 18) {
  if (EMOJI[name]) {
    return `<span style="font-size:${size}px; line-height:1; display:inline-block;">${EMOJI[name]}</span>`;
  }
  if (name === "ring") {
    return `<span style="display:inline-block; width:11px; height:11px; border:2px solid ${color}; border-radius:50%; vertical-align:middle;"></span>`;
  }
  if (name === "dot") {
    return `<span style="display:inline-block; width:6px; height:6px; background:${color}; border-radius:50%; vertical-align:middle;"></span>`;
  }
  return "";
}

function iconNote(text, color = "#a39c8c") {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding-right:7px;">${icon("ring", color)}</td>
        <td style="font-size:12.5px; line-height:1.7; color:${color};">${text}</td>
      </tr>
    </table>
  `;
}

function divider(label) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="border-top:1px solid #EFE9DC; width:42%;"></td>
        <td style="padding:0 12px; font-size:11px; font-weight:800; letter-spacing:0.4px; color:#c2baa4; white-space:nowrap;">${label}</td>
        <td style="border-top:1px solid #EFE9DC; width:42%;"></td>
      </tr>
    </table>
  `;
}

function linkBox(url) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F1; border-radius:14px;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 8px; font-size:12px; font-weight:700; color:${NAVY}; text-align:left;">Copy and paste this link in your browser:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border:1px solid #E9E2D2; border-radius:10px;">
            <tr>
              <td style="padding:10px 14px; font-size:11px; color:#8a7a4a; word-break:break-all; text-align:left;">
                <a href="${url}" style="color:#8a7a4a; text-decoration:none;">${url}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function button(label, href) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 8px;">
      <tr>
        <td style="border-radius:999px; background:${YELLOW}; box-shadow:0 16px 32px -12px rgba(242,176,30,0.75);">
          <a href="${href}" style="display:inline-block; color:${NAVY}; text-decoration:none; font-weight:800; font-size:13.5px; letter-spacing:0.3px; text-transform:uppercase; padding:15px 36px; border-radius:999px;">${label}</a>
        </td>
      </tr>
    </table>
  `;
}

function infoCard({ icon: iconName = "shield", title, text, theme = "amber" }) {
  const palette = theme === "blue" ? { bg: "#EFF6FF", iconBg: "#DBEAFE", iconColor: "#1D4ED8" } : { bg: "#FAF7F1", iconBg: "#FEF3C7", iconColor: "#92400E" };
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0; background:${palette.bg}; border-radius:14px;">
      <tr>
        <td style="padding:16px 18px; vertical-align:top; width:46px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="34" height="34" align="center" valign="middle" style="width:34px; height:34px; border-radius:10px; background:${palette.iconBg};">${icon(iconName, palette.iconColor, 17)}</td>
          </tr></table>
        </td>
        <td style="padding:16px 18px 16px 0; text-align:left;">
          <p style="margin:0 0 3px; font-size:13px; font-weight:800; color:${NAVY};">${title}</p>
          <p style="margin:0; font-size:12px; line-height:1.6; color:#8a8478;">${text}</p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Shared branded wrapper for every transactional email — a header with the logo and a
 * tagline, a soft hero band with a large icon badge and a two-tone heading, the body
 * content, a trust-signal row, and a dark footer with social badges. Keeps every
 * template visually consistent with the site's palette.
 */
function emailLayout({ preheader = "", badgeIcon, badgeIconColor = "#92400E", badgeBg = "#FEF3C7", badgePill, headingPlain, headingHighlight, body, footerNote }) {
  return `
  <div class="eh-wrap" style="background:#F1ECE1; padding:36px 14px; font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; box-shadow:0 24px 60px -24px rgba(20,20,20,0.35); border-radius:22px; overflow:hidden;">

      <!-- Accent bar -->
      <tr>
        <td style="background:linear-gradient(90deg,${NAVY},${YELLOW},${NAVY}); height:5px; line-height:5px; font-size:0;">&nbsp;</td>
      </tr>

      <!-- Header -->
      <tr>
        <td class="eh-header-pad" style="background:#FFFFFF; padding:26px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="eh-logo-cell" align="left" style="vertical-align:middle;">
                <img src="${LOGO_URL}" alt="House Electric" width="150" style="display:inline-block; height:auto; max-width:150px; border:0;" />
              </td>
              <td class="eh-tag-cell" align="right" style="vertical-align:middle; border-left:1px solid #EFE9DC; padding-left:16px;">
                <p style="margin:0; font-size:11px; font-weight:700; color:#9a927e; line-height:1.5;">Bright Homes<br />Brighter Tomorrows</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero -->
      <tr>
        <td class="eh-hero-pad" style="background:linear-gradient(180deg,#FDF6E9,#FFFFFF); padding:38px 32px 8px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
            <tr>
              <td width="88" height="88" align="center" valign="middle" style="width:88px; height:88px; border-radius:50%; background:${badgeBg}; box-shadow:0 10px 24px -8px rgba(146,64,14,0.35);">
                ${icon(badgeIcon, badgeIconColor, 38)}
              </td>
            </tr>
          </table>
          ${
            badgePill
              ? `<span style="display:inline-block; margin-bottom:14px; padding:5px 14px; border-radius:999px; background:#FEF3C7; color:#92400E; font-size:10.5px; font-weight:800; letter-spacing:0.4px;">${badgePill}</span><br/>`
              : ""
          }
          <h1 class="eh-h1" style="margin:0; font-size:26px; font-weight:800; line-height:1.25;">
            <span style="color:${NAVY};">${headingPlain}</span><span style="color:${YELLOW};">${headingHighlight}</span>
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td class="eh-body-pad" style="background:#FFFFFF; padding:8px 36px 34px; text-align:center;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="eh-footer-pad" style="background:${NAVY}; padding:28px 32px; text-align:center; border-top:1px solid #F1EBDD;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="padding-right:7px;">${icon("dot", YELLOW)}</td>
              <td style="font-size:12px; font-weight:800; letter-spacing:0.4px; color:${YELLOW};">HOUSE ELECTRIC</td>
            </tr>
          </table>
          <p style="margin:6px 0 0; font-size:11px; color:#a8a8a8;">Trusted Electrical Services in Delhi</p>
          <p style="margin:2px 0 0; font-size:10.5px; color:#6f6f6f;">Powering Homes. Building Trust.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto;">
      <tr>
        <td style="padding:20px 20px 0; text-align:center;">
          <p style="margin:0; font-size:12px; line-height:1.7; color:#9a927e;">
            ${footerNote || "This is an automated message — please do not reply directly to this email."}
          </p>
          <p style="margin:6px 0 0; font-size:11.5px; color:#b3ab97;">© ${new Date().getFullYear()} House Electric, Delhi, India. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function otpBoxes(code) {
  const cell = (digit) => `
    <td class="eh-otp-cell" style="padding:0 4px;">
      <div class="eh-otp-box" style="width:38px; height:46px; line-height:46px; text-align:center; background:linear-gradient(135deg,#FFFCF4,#FBF1DC); border:1px solid #E9D9AE; border-radius:10px; font-size:22px; font-weight:800; color:${NAVY};">${digit}</div>
    </td>
  `;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto; padding:10px 8px; border:1.5px dashed #E9D9AE; border-radius:16px;">
      <tr>${String(code).split("").map(cell).join("")}</tr>
    </table>
  `;
}

export async function sendOtpEmail({ to, name, code, purpose }) {
  const subject =
    purpose === "reset" ? "Reset your House Electric password" : "Verify your House Electric account";
  const intro =
    purpose === "reset"
      ? "Use the verification code below to reset your password."
      : "Use the verification code below to verify your email and finish creating your account.";

  const html = emailLayout({
    preheader: `Your verification code is ${code}`,
    badgeIcon: purpose === "reset" ? "lock" : "mail",
    badgeIconColor: purpose === "reset" ? "#92400E" : "#1D4ED8",
    badgeBg: purpose === "reset" ? "#FEF3C7" : "#DBEAFE",
    headingPlain: purpose === "reset" ? "Reset Your " : "Verify Your ",
    headingHighlight: purpose === "reset" ? "Password" : "Email",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:38ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">${intro}</p>
      ${otpBoxes(code)}
      ${iconNote("This code expires in 10 minutes.")}
      ${infoCard({
        icon: "lock",
        title: "Didn't request this?",
        text: "If you didn't request this email, you can safely ignore it — no changes will be made to your account.",
      })}
    `,
  });

  await sendEmail({ to, name, subject, html });
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = emailLayout({
    preheader: "Reset your House Electric account password",
    badgeIcon: "lock",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    headingPlain: "Reset Your ",
    headingHighlight: "Password",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:38ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        We received a request to reset the password for your House Electric account. Click the button below to choose a new one.
      </p>
      ${button("Reset My Password", resetUrl)}
      <div style="margin:14px 0 0;">${iconNote("This link expires in 30 minutes.")}</div>
      ${divider("OR")}
      ${linkBox(resetUrl)}
      ${infoCard({
        icon: "shield",
        title: "Didn't request a password reset?",
        text: "If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.",
        theme: "blue",
      })}
    `,
  });

  await sendEmail({ to, name, subject: "Reset your House Electric password", html });
}

function amcDetailsBox({ amcNumber, planName }) {
  const row = (iconName, label, value) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td style="padding-right:12px; vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="32" height="32" align="center" valign="middle" style="width:32px; height:32px; border-radius:9px; background:#FEF3C7;">${icon(iconName, "#92400E", 15)}</td>
          </tr></table>
        </td>
        <td style="text-align:left;">
          <p style="margin:0; font-size:10px; font-weight:800; letter-spacing:0.4px; color:#9a927e;">${label}</p>
          <p style="margin:1px 0 0; font-size:13.5px; font-weight:800; color:${NAVY};">${value}</p>
        </td>
      </tr>
    </table>
  `;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; border:1px solid #F0D98A; border-radius:16px;">
      <tr>
        <td class="eh-details-cell" style="padding:20px; width:55%; vertical-align:top;">
          ${row("ring", "AMC NUMBER", amcNumber)}
          ${row("diamond", "PLAN", planName)}
        </td>
        <td class="eh-details-divider" style="width:1px; background:#F0D98A;"></td>
        <td class="eh-details-cell" style="padding:20px; text-align:center; vertical-align:middle;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
            <tr><td width="40" height="40" align="center" valign="middle" style="width:40px; height:40px; border-radius:50%; background:#FEF3C7;">${icon("shield", "#92400E", 19)}</td></tr>
          </table>
          <p style="margin:0; font-size:12.5px; font-style:italic; font-weight:700; color:${NAVY}; line-height:1.4;">Stay Covered<br/>Stay Worry-Free</p>
        </td>
      </tr>
    </table>
  `;
}

export async function sendAmcReminderEmail({ to, name, amcNumber, planName, expiryDate, daysRemaining }) {
  const subject = `Your House Electric AMC expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;

  const html = emailLayout({
    preheader: `${amcNumber} expires on ${expiryDate}`,
    badgeIcon: "shield",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: "AMC RENEWAL DUE",
    headingPlain: "Your AMC is ",
    headingHighlight: "Expiring Soon",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:40ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Your Annual Maintenance Contract expires on
        <span style="display:inline-block; margin:2px 4px; padding:2px 10px; border-radius:8px; background:#FEF3C7; color:#92400E; font-weight:800;">${expiryDate}</span>
        — that's <strong style="color:${NAVY};">${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong> from now.
      </p>
      ${amcDetailsBox({ amcNumber, planName })}
      <p style="margin:0 auto; max-width:40ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Renew now to keep your electrical maintenance coverage and priority service without a gap.
      </p>
      ${button("Renew My AMC", `${SITE_URL}/account/amc`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0; background:#FAF7F1; border-radius:14px;">
        <tr>
          <td style="padding:16px 18px; vertical-align:middle; width:46px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td width="34" height="34" align="center" valign="middle" style="width:34px; height:34px; border-radius:10px; background:#FEF3C7;">${icon("diamond", "#92400E", 17)}</td>
            </tr></table>
          </td>
          <td style="padding:16px 0; text-align:left; vertical-align:middle;">
            <p style="margin:0 0 2px; font-size:13px; font-weight:800; color:${NAVY};">Need Help?</p>
            <p style="margin:0; font-size:12px; line-height:1.5; color:#8a8478;">Our support team is always here to help you.</p>
          </td>
          <td style="padding:16px 18px 16px 0; text-align:right; vertical-align:middle; white-space:nowrap;">
            <a href="${SITE_URL}/contact" style="display:inline-block; border:1.5px solid ${NAVY}; color:${NAVY}; text-decoration:none; font-weight:800; font-size:11.5px; padding:9px 16px; border-radius:999px;">Contact Support</a>
          </td>
        </tr>
      </table>
    `,
  });

  await sendEmail({ to, name, subject, html });
}

function summaryRow(label, value) {
  return `
    <tr>
      <td style="padding:8px 0; font-size:12.5px; color:#8a8478; text-align:left;">${label}</td>
      <td style="padding:8px 0; font-size:13px; font-weight:800; color:${NAVY}; text-align:right;">${value}</td>
    </tr>
  `;
}

export async function sendAmcActivatedEmail({ to, name, amcNumber, planName, startDate, expiryDate, amountPaid, isRenewal = false }) {
  const subject = isRenewal
    ? `Your House Electric AMC has been renewed — ${amcNumber}`
    : `Your House Electric AMC is now active — ${amcNumber}`;

  const html = emailLayout({
    preheader: `${planName} is active until ${expiryDate}`,
    badgeIcon: "shield",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: isRenewal ? "AMC RENEWED" : "AMC ACTIVATED",
    headingPlain: "Your AMC is ",
    headingHighlight: isRenewal ? "Renewed" : "Now Active",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Thank you — your payment was received and your Annual Maintenance Contract is
        ${isRenewal ? "renewed and" : ""} <strong style="color:${NAVY};">active</strong>. Here are your plan details:
      </p>
      ${amcDetailsBox({ amcNumber, planName })}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0; border-top:1px solid #F1EBDD;">
        ${summaryRow("Start Date", startDate)}
        ${summaryRow("Valid Until", expiryDate)}
        ${amountPaid ? summaryRow("Amount Paid", amountPaid) : ""}
      </table>
      <p style="margin:22px auto 0; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        We'll remind you before your plan expires, and you can view your coverage, visit schedule and service history anytime from your account.
      </p>
      ${button("View My AMC", `${SITE_URL}/account/amc`)}
    `,
  });

  await sendEmail({ to, name, subject, html });
}

const REQUEST_STATUS_COPY = {
  requested: {
    pill: "REQUEST RECEIVED",
    icon: "bell",
    headingPlain: "We've Got Your ",
    headingHighlight: "Request",
    line: "We've received your service request and our team is reviewing it. We'll assign a technician shortly.",
  },
  under_review: {
    pill: "UNDER REVIEW",
    icon: "bell",
    headingPlain: "Your Request is ",
    headingHighlight: "Under Review",
    line: "Our team is reviewing your request and will assign a technician shortly.",
  },
  assigned: {
    pill: "TECHNICIAN ASSIGNED",
    icon: "wrench",
    headingPlain: "A Technician is ",
    headingHighlight: "Assigned",
    line: "A technician has been assigned to your request and will reach out to confirm the visit.",
  },
  scheduled: {
    pill: "VISIT SCHEDULED",
    icon: "calendar",
    headingPlain: "Your Visit is ",
    headingHighlight: "Scheduled",
    line: "Your service visit has been scheduled. Our technician will arrive as planned.",
  },
  on_the_way: {
    pill: "TECHNICIAN ON THE WAY",
    icon: "wrench",
    headingPlain: "Your Technician is ",
    headingHighlight: "On The Way",
    line: "Our technician is on the way to your property.",
  },
  in_progress: {
    pill: "WORK IN PROGRESS",
    icon: "wrench",
    headingPlain: "Your Service is ",
    headingHighlight: "In Progress",
    line: "Our technician is currently working on your request.",
  },
  material_required: {
    pill: "MATERIAL REQUIRED",
    icon: "wrench",
    headingPlain: "Additional Material ",
    headingHighlight: "Required",
    line: "Our technician found that some material or additional work is needed. We'll send you a quote shortly for your approval.",
  },
  customer_approval_pending: {
    pill: "APPROVAL NEEDED",
    icon: "bell",
    headingPlain: "Your Approval is ",
    headingHighlight: "Needed",
    line: "A quote for the additional material/work is ready for your review. Please approve it so we can proceed.",
  },
  completed: {
    pill: "SERVICE COMPLETED",
    icon: "check",
    headingPlain: "Service ",
    headingHighlight: "Completed",
    line: "Your service has been marked complete. Please confirm completion and let us know how it went from your dashboard.",
  },
  confirmed: {
    pill: "COMPLETION CONFIRMED",
    icon: "check",
    headingPlain: "Thanks For ",
    headingHighlight: "Confirming",
    line: "Thanks for confirming — we're glad we could help. Your request will now be closed.",
  },
  closed: {
    pill: "REQUEST CLOSED",
    icon: "check",
    headingPlain: "Request ",
    headingHighlight: "Closed",
    line: "This service request is now closed. Reach out anytime if the issue recurs.",
  },
  cancelled: {
    pill: "REQUEST CANCELLED",
    icon: "shield",
    headingPlain: "Request ",
    headingHighlight: "Cancelled",
    line: "This service request has been cancelled. If this wasn't expected, please contact our support team.",
  },
};

function requestDetailsBox({ ticketNumber, serviceType, technicianName, technicianPhone }) {
  const row = (iconName, label, value) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td style="padding-right:12px; vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="32" height="32" align="center" valign="middle" style="width:32px; height:32px; border-radius:9px; background:#FEF3C7;">${icon(iconName, "#92400E", 15)}</td>
          </tr></table>
        </td>
        <td style="text-align:left;">
          <p style="margin:0; font-size:10px; font-weight:800; letter-spacing:0.4px; color:#9a927e;">${label}</p>
          <p style="margin:1px 0 0; font-size:13.5px; font-weight:800; color:${NAVY};">${value}</p>
        </td>
      </tr>
    </table>
  `;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; border:1px solid #F0D98A; border-radius:16px;">
      <tr>
        <td style="padding:20px; text-align:left; vertical-align:top;">
          ${row("ring", "TICKET NUMBER", ticketNumber)}
          ${row("wrench", "SERVICE TYPE", serviceType)}
          ${technicianName ? row("bell", "TECHNICIAN", technicianName + (technicianPhone ? ` · ${technicianPhone}` : "")) : ""}
        </td>
      </tr>
    </table>
  `;
}

export async function sendServiceRequestStatusEmail({ to, name, ticketNumber, serviceType, status, technicianName, technicianPhone }) {
  const copy = REQUEST_STATUS_COPY[status] || REQUEST_STATUS_COPY.requested;
  const subject = `${copy.pill.charAt(0) + copy.pill.slice(1).toLowerCase()} — ${ticketNumber}`;

  const html = emailLayout({
    preheader: `${ticketNumber} — ${copy.pill.toLowerCase()}`,
    badgeIcon: copy.icon,
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: copy.pill,
    headingPlain: copy.headingPlain,
    headingHighlight: copy.headingHighlight,
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">${copy.line}</p>
      ${requestDetailsBox({ ticketNumber, serviceType, technicianName, technicianPhone })}
      ${button("View My Request", `${SITE_URL}/account/requests`)}
    `,
  });

  await sendEmail({ to, name, subject, html });
}

function technicianJobDetailsBox({ ticketNumber, serviceType, customerName, customerMobile, address, scheduledDate, scheduledTime }) {
  const row = (iconName, label, value) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td style="padding-right:12px; vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="32" height="32" align="center" valign="middle" style="width:32px; height:32px; border-radius:9px; background:#FEF3C7;">${icon(iconName, "#92400E", 15)}</td>
          </tr></table>
        </td>
        <td style="text-align:left;">
          <p style="margin:0; font-size:10px; font-weight:800; letter-spacing:0.4px; color:#9a927e;">${label}</p>
          <p style="margin:1px 0 0; font-size:13.5px; font-weight:800; color:${NAVY};">${value}</p>
        </td>
      </tr>
    </table>
  `;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; border:1px solid #F0D98A; border-radius:16px;">
      <tr>
        <td style="padding:20px; text-align:left; vertical-align:top;">
          ${row("ring", "TICKET NUMBER", ticketNumber)}
          ${row("wrench", "SERVICE TYPE", serviceType)}
          ${customerName ? row("bell", "CUSTOMER", customerName + (customerMobile ? ` · ${customerMobile}` : "")) : ""}
          ${address ? row("bell", "ADDRESS", address) : ""}
          ${scheduledDate ? row("calendar", "SCHEDULED VISIT", `${scheduledDate}${scheduledTime ? ` · ${scheduledTime}` : ""}`) : ""}
        </td>
      </tr>
    </table>
  `;
}

export async function sendTechnicianJobAssignedEmail({
  to,
  name,
  ticketNumber,
  serviceType,
  customerName,
  customerMobile,
  address,
  scheduledDate,
  scheduledTime,
}) {
  const subject = `New Job Assigned — ${ticketNumber}`;

  const html = emailLayout({
    preheader: `You've been assigned a new service request — ${ticketNumber}`,
    badgeIcon: "wrench",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: "NEW JOB ASSIGNED",
    headingPlain: "New Job ",
    headingHighlight: "Assigned",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        You've been assigned a new service request. Check the details below and update the job status from your technician portal once you're on the way.
      </p>
      ${technicianJobDetailsBox({ ticketNumber, serviceType, customerName, customerMobile, address, scheduledDate, scheduledTime })}
      ${button("View My Jobs", `${SITE_URL}/technician`)}
    `,
  });

  await sendEmail({ to, name, subject, html });
}

const ENQUIRY_COPY = {
  booking: { pill: "BOOKING RECEIVED", headingPlain: "We've Got Your ", headingHighlight: "Booking" },
  amc: { pill: "AMC ENQUIRY RECEIVED", headingPlain: "We've Got Your ", headingHighlight: "AMC Enquiry" },
  corporate: { pill: "QUOTATION REQUESTED", headingPlain: "We've Got Your ", headingHighlight: "Request" },
};

export async function sendEnquiryReceivedEmail({ to, name, variant = "booking", lines }) {
  const copy = ENQUIRY_COPY[variant] || ENQUIRY_COPY.booking;
  const subject = `${copy.pill.charAt(0) + copy.pill.slice(1).toLowerCase()} — House Electric`;

  const html = emailLayout({
    preheader: "Our team will get back to you shortly.",
    badgeIcon: "bell",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: copy.pill,
    headingPlain: copy.headingPlain,
    headingHighlight: copy.headingHighlight,
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Thank you for reaching out — our team has received your request and will contact you shortly.
      </p>
      ${adminLinesTable(lines)}
    `,
  });

  await sendEmail({ to, name, subject, html });
}

export async function sendQuotationCreatedEmail({ to, name, quotationNumber, total, validUntil, quotationId }) {
  const html = emailLayout({
    preheader: `Quotation ${quotationNumber} is ready for your review`,
    badgeIcon: "diamond",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: "NEW QUOTATION",
    headingPlain: "Your Quotation is ",
    headingHighlight: "Ready",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        We've prepared a quotation for you. Please review the details and let us know if you'd like to proceed.
      </p>
      ${adminLinesTable([
        { label: "Quotation Number", value: quotationNumber },
        { label: "Total Amount", value: total != null ? `₹${Number(total).toLocaleString("en-IN")}` : null },
        { label: "Valid Until", value: validUntil },
      ])}
      ${button("View & Accept Quotation", `${SITE_URL}/account/quotations/${quotationId}`)}
    `,
  });

  await sendEmail({ to, name, subject: `Your quotation ${quotationNumber} is ready`, html });
}

export async function sendInvoiceCreatedEmail({ to, name, invoiceNumber, totalAmount, invoiceId }) {
  const html = emailLayout({
    preheader: `Invoice ${invoiceNumber} has been generated`,
    badgeIcon: "diamond",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: "NEW INVOICE",
    headingPlain: "Your Invoice is ",
    headingHighlight: "Ready",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        An invoice has been generated for your service. View the details and pay securely online anytime.
      </p>
      ${adminLinesTable([
        { label: "Invoice Number", value: invoiceNumber },
        { label: "Total Amount", value: totalAmount != null ? `₹${Number(totalAmount).toLocaleString("en-IN")}` : null },
      ])}
      ${button("View & Pay Invoice", `${SITE_URL}/account/invoices/${invoiceId}`)}
    `,
  });

  await sendEmail({ to, name, subject: `Your invoice ${invoiceNumber} is ready`, html });
}

export async function sendPaymentReceivedEmail({ to, name, refNumber, amount, viewLabel, viewHref }) {
  const html = emailLayout({
    preheader: `Payment received for ${refNumber}`,
    badgeIcon: "check",
    badgeIconColor: "#047857",
    badgeBg: "#D1FAE5",
    badgePill: "PAYMENT SUCCESSFUL",
    headingPlain: "Payment ",
    headingHighlight: "Received",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Thank you — we've received your payment. Here's a quick summary:
      </p>
      ${adminLinesTable([
        { label: "Reference", value: refNumber },
        { label: "Amount Paid", value: amount != null ? `₹${Number(amount).toLocaleString("en-IN")}` : null },
      ])}
      ${button(viewLabel || "View Details", viewHref)}
    `,
  });

  await sendEmail({ to, name, subject: `Payment received — ${refNumber}`, html });
}

export async function sendHealthCheckBookedEmail({ to, name, requestNumber, preferredDate }) {
  const html = emailLayout({
    preheader: `We've received your health check booking ${requestNumber}`,
    badgeIcon: "shield",
    badgeIconColor: "#1D4ED8",
    badgeBg: "#DBEAFE",
    badgePill: "HEALTH CHECK BOOKED",
    headingPlain: "Your Health Check is ",
    headingHighlight: "Booked",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Thank you for booking an Electrical Health Check. Our team will contact you shortly to confirm the visit.
      </p>
      ${adminLinesTable([
        { label: "Request Number", value: requestNumber },
        { label: "Preferred Date", value: preferredDate },
      ])}
    `,
  });

  await sendEmail({ to, name, subject: `Health check booking received — ${requestNumber}`, html });
}

export async function sendHealthReportReadyEmail({ to, name, reportNumber, reportId, recommendedPlanName }) {
  const html = emailLayout({
    preheader: `Your Electrical Health Report ${reportNumber} is ready`,
    badgeIcon: "diamond",
    badgeIconColor: "#92400E",
    badgeBg: "#FEF3C7",
    badgePill: "HEALTH REPORT READY",
    headingPlain: "Your Health Report is ",
    headingHighlight: "Ready",
    body: `
      <p style="margin:0 0 4px; font-size:14.5px; line-height:1.7; color:#5a5a5a;">Hi${name ? ` ${name}` : ""},</p>
      <p style="margin:0 auto; max-width:42ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">
        Our engineer has completed your electrical inspection. Your detailed health report is ready to view and download.
      </p>
      ${adminLinesTable([
        { label: "Report Number", value: reportNumber },
        { label: "Recommended Plan", value: recommendedPlanName },
      ])}
      ${button("View My Report", `${SITE_URL}/account/health-reports/${reportId}`)}
    `,
  });

  await sendEmail({ to, name, subject: `Your electrical health report ${reportNumber} is ready`, html });
}

function adminLinesTable(lines) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; border:1px solid #F0D98A; border-radius:16px;">
      <tr>
        <td style="padding:20px; text-align:left;">
          ${lines
            .filter((l) => l.value)
            .map(
              (l) => `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                  <tr>
                    <td style="font-size:11.5px; font-weight:700; color:#9a927e; width:38%; vertical-align:top;">${l.label}</td>
                    <td style="font-size:13px; font-weight:700; color:${NAVY}; vertical-align:top;">${l.value}</td>
                  </tr>
                </table>
              `
            )
            .join("")}
        </td>
      </tr>
    </table>
  `;
}

// Internal alert emails to the business inbox — new enquiry/booking/service request leads.
export async function sendAdminAlertEmail({ to, subject, badgePill, headingPlain, headingHighlight, intro, lines, ctaLabel, ctaHref }) {
  const html = emailLayout({
    preheader: subject,
    badgeIcon: "bell",
    badgeIconColor: "#1D4ED8",
    badgeBg: "#DBEAFE",
    badgePill,
    headingPlain,
    headingHighlight,
    body: `
      ${intro ? `<p style="margin:0 auto 4px; max-width:44ch; font-size:14.5px; line-height:1.7; color:#5a5a5a;">${intro}</p>` : ""}
      ${adminLinesTable(lines)}
      ${ctaHref ? button(ctaLabel || "View in Admin Panel", ctaHref) : ""}
    `,
  });

  await sendEmail({ to, subject, html });
}
