const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in";
const LOGO_URL = `${SITE_URL}/logo.jpg`;
const NAVY = "#141414";
const YELLOW = "#F2B01E";

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
      htmlContent: html,
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
  <div style="background:#F1ECE1; padding:36px 14px; font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; box-shadow:0 24px 60px -24px rgba(20,20,20,0.35); border-radius:22px; overflow:hidden;">

      <!-- Accent bar -->
      <tr>
        <td style="background:linear-gradient(90deg,${NAVY},${YELLOW},${NAVY}); height:5px; line-height:5px; font-size:0;">&nbsp;</td>
      </tr>

      <!-- Header -->
      <tr>
        <td style="background:#FFFFFF; padding:26px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left" style="vertical-align:middle;">
                <img src="${LOGO_URL}" alt="House Electric" width="150" style="display:inline-block; height:auto; max-width:150px; border:0;" />
              </td>
              <td align="right" style="vertical-align:middle; border-left:1px solid #EFE9DC; padding-left:16px;">
                <p style="margin:0; font-size:11px; font-weight:700; color:#9a927e; line-height:1.5;">Bright Homes<br />Brighter Tomorrows</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero -->
      <tr>
        <td style="background:linear-gradient(180deg,#FDF6E9,#FFFFFF); padding:38px 32px 8px; text-align:center;">
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
          <h1 style="margin:0; font-size:26px; font-weight:800; line-height:1.25;">
            <span style="color:${NAVY};">${headingPlain}</span><span style="color:${YELLOW};">${headingHighlight}</span>
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#FFFFFF; padding:8px 36px 34px; text-align:center;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:${NAVY}; padding:28px 32px; text-align:center; border-top:1px solid #F1EBDD;">
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
    <td style="padding:0 4px;">
      <div style="width:38px; height:46px; line-height:46px; text-align:center; background:linear-gradient(135deg,#FFFCF4,#FBF1DC); border:1px solid #E9D9AE; border-radius:10px; font-size:22px; font-weight:800; color:${NAVY};">${digit}</div>
    </td>
  `;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto; padding:10px 14px; border:1.5px dashed #E9D9AE; border-radius:16px;">
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
        <td style="padding:20px; width:55%; vertical-align:top;">
          ${row("ring", "AMC NUMBER", amcNumber)}
          ${row("diamond", "PLAN", planName)}
        </td>
        <td style="width:1px; background:#F0D98A;"></td>
        <td style="padding:20px; text-align:center; vertical-align:middle;">
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
