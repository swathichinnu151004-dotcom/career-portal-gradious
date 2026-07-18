const nodemailer = require("nodemailer");
const logger = require("./logger");
const dns = require("dns");

let cachedTransporter = null;

function getTransporter() {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  if (!user || !pass) {
    throw new Error(
      "Email is not configured: set EMAIL_USER and EMAIL_PASS in career-portal-backend/.env (use a Gmail App Password for EMAIL_PASS)."
    );
  }

  if (!cachedTransporter) {
    dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
      console.log("SMTP DNS:", addresses);
    });

 cachedTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user,
    pass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  logger: true,
  debug: true,
});
  }

  return cachedTransporter;
}

const sendMail = async ({ to, subject, text, html, from }) => {
  if (!to) {
    throw new Error("Recipient email is missing");
  }

  const authUser = (process.env.EMAIL_USER || "").trim();
  const displayName =
    process.env.MAIL_FROM_DISPLAY || "Gradious Careers (Do not reply)";
  const defaultFrom = authUser
    ? `"${displayName}" <${authUser}>`
    : `"${displayName}" <noreply@localhost>`;

  const mailOptions = {
    from: from || defaultFrom,
    to,
    subject,
    text,
    html,
  };

  const transporter = getTransporter();
  const info = await transporter.sendMail(mailOptions);
  logger.info("Email dispatched", {
    subject,
    messageId: info.messageId,
    response: info.response,
  });
  return info;
};

/** Logs whether Gmail SMTP auth works (call once at server startup). */
sendMail.verifySmtpConfig = async function verifySmtpConfig() {
  try {
    await getTransporter().verify();
    console.log("✅ SMTP Verify Success");
  } catch (e) {
    console.error("❌ SMTP VERIFY ERROR:", e);
  }
};

module.exports = sendMail;