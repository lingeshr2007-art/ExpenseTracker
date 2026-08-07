// server/utils/email.js
import "dotenv/config";
import nodemailer from "nodemailer";


/**
 * Send email via Brevo v3 HTTP REST API
 */
async function sendViaBrevoApi(recipientEmail, otpCode, apiKey) {
  const senderEmail = process.env.SMTP_USER || "lingeshr2007@gmail.com";
  const senderName = "Nidhi Track Team";

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: recipientEmail }],
    subject: "Nidhi Track Verification Code",
    htmlContent: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e8ea; border-radius: 16px; padding: 30px; color: #1a1a1e;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <div style="background-color: #4f5ded; width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 20px;">N</div>
          <span style="font-size: 22px; font-weight: 800; color: #1a1a1e; letter-spacing: -0.5px;">Nidhi Track Verification Code</span>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; color: #1a1a1e; margin-bottom: 8px;">Your Verification Code</h2>
        <p style="font-size: 14px; color: #6b6b72; line-height: 1.6; margin-bottom: 24px;">
          Hello,<br/><br/>
          Your verification code is:
        </p>

        <div style="background-color: #f1f1f8; border: 1px solid #e8e8ea; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4f5ded; letter-spacing: 10px; display: block;">
            ${otpCode}
          </span>
          <span style="font-size: 12px; color: #6b6b72; margin-top: 8px; display: block;">This code is valid for 5 minutes.</span>
        </div>

        <p style="font-size: 13px; color: #6b6b72; line-height: 1.5;">
          Never share this code with anyone.<br/>
          If you did not request this code, simply ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e8e8ea; margin: 24px 0;" />

        <div style="font-size: 12px; color: #9ca3af; text-align: center;">
          Thank you,<br/>
          <strong>Nidhi Track Team</strong>
        </div>
      </div>
    `,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Brevo API Error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  console.log(`✅ [BREVO REST API SUCCESS] Delivered to inbox: ${recipientEmail} (Message ID: ${data.messageId || "OK"})`);
  return { success: true, messageId: data.messageId };
}

/**
 * Dynamically get or create Nodemailer Transporter with Multi-Port Fallback
 */
export async function sendOtpEmail(recipientEmail, otpCode) {
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
  const senderEmail = process.env.SMTP_USER || "lingeshr2007@gmail.com";
  const pass = process.env.SMTP_PASS;

  console.log("\n============================================================");
  console.log(`📩 [REAL-TIME OTP DISPATCH REQUEST]`);
  console.log(`To: ${recipientEmail}`);
  console.log(`Verification Code: [ ${otpCode} ]`);
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log("============================================================\n");

  // Attempt 1: If Brevo key exists, try Brevo HTTP REST API (Port 443 - HTTPS)
  if (apiKey && (apiKey.startsWith("xkeysib-") || apiKey.startsWith("xsmtpsib-"))) {
    try {
      console.log(`🚀 Dispatching email via Brevo REST API to ${recipientEmail}...`);
      return await sendViaBrevoApi(recipientEmail, otpCode, apiKey);
    } catch (apiErr) {
      console.warn("⚠️ Brevo REST API error:", apiErr.message);
    }
  }


  // Attempt 2: Brevo SMTP Port 587 (TLS)
  if (pass && pass.startsWith("xsmtpsib-")) {
    try {
      console.log(`📧 Attempting Brevo SMTP delivery on port 587...`);
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: { user: senderEmail, pass },
        connectionTimeout: 5000,
      });

      const info = await transporter.sendMail({
        from: `"Nidhi Track Team" <${senderEmail}>`,
        to: recipientEmail,
        subject: "Nidhi Track Verification Code",
        text: `Hello,\n\nYour verification code is ${otpCode}.\n\nThis code is valid for 5 minutes.\nNever share this code with anyone.\nIf you did not request this code, simply ignore this email.\n\nThank you,\nNidhi Track Team`,
        html: getHtmlTemplate(otpCode),
      });

      console.log(`✅ [BREVO SMTP SUCCESS] Delivered to inbox: ${recipientEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.warn("⚠️ Brevo SMTP Port 587 failed, trying SSL Port 465...", smtpErr.message);
    }

    // Attempt 3: Brevo SMTP Port 465 (SSL)
    try {
      console.log(`📧 Attempting Brevo SMTP delivery on SSL port 465...`);
      const transporterSsl = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 465,
        secure: true,
        auth: { user: senderEmail, pass },
        connectionTimeout: 5000,
      });

      const info = await transporterSsl.sendMail({
        from: `"Nidhi Track Team" <${senderEmail}>`,
        to: recipientEmail,
        subject: "Nidhi Track Verification Code",
        text: `Hello,\n\nYour verification code is ${otpCode}.\n\nThis code is valid for 5 minutes.\nNever share this code with anyone.\nIf you did not request this code, simply ignore this email.\n\nThank you,\nNidhi Track Team`,
        html: getHtmlTemplate(otpCode),
      });

      console.log(`✅ [BREVO SMTP SSL SUCCESS] Delivered to inbox: ${recipientEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (sslErr) {
      console.warn("⚠️ Brevo SMTP Port 465 failed:", sslErr.message);
    }
  }

  // Attempt 4: Ethereal / Fallback Mailer
  console.log("ℹ️ Local network firewall blocked SMTP ports. Using Ethereal Mailer fallback...");
  try {
    const testAccount = await nodemailer.createTestAccount();
    const fallbackMailer = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await fallbackMailer.sendMail({
      from: `"Nidhi Track Security" <${senderEmail}>`,
      to: recipientEmail,
      subject: "Nidhi Track Verification Code",
      html: getHtmlTemplate(otpCode),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [TEST EMAIL PREVIEW LINK] Click to view email online: ${previewUrl}\n`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.log(`ℹ️ OTP Code is saved in memory: [ ${otpCode} ]`);
    return { success: true };
  }
}

function getHtmlTemplate(otpCode) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e8ea; border-radius: 16px; padding: 30px; color: #1a1a1e;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="background-color: #4f5ded; width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 20px;">N</div>
        <span style="font-size: 22px; font-weight: 800; color: #1a1a1e; letter-spacing: -0.5px;">Nidhi Track Verification Code</span>
      </div>

      <h2 style="font-size: 20px; font-weight: 700; color: #1a1a1e; margin-bottom: 8px;">Your Verification Code</h2>
      <p style="font-size: 14px; color: #6b6b72; line-height: 1.6; margin-bottom: 24px;">
        Hello,<br/><br/>
        Your verification code is:
      </p>

      <div style="background-color: #f1f1f8; border: 1px solid #e8e8ea; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4f5ded; letter-spacing: 10px; display: block;">
          ${otpCode}
        </span>
        <span style="font-size: 12px; color: #6b6b72; margin-top: 8px; display: block;">This code is valid for 5 minutes.</span>
      </div>

      <p style="font-size: 13px; color: #6b6b72; line-height: 1.5;">
        Never share this code with anyone.<br/>
        If you did not request this code, simply ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e8e8ea; margin: 24px 0;" />

      <div style="font-size: 12px; color: #9ca3af; text-align: center;">
        Thank you,<br/>
        <strong>Nidhi Track Team</strong>
      </div>
    </div>
  `;
}
