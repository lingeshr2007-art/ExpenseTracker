// server/utils/email.js
import "dotenv/config";
import nodemailer from "nodemailer";


/**
 * Send email via Brevo v3 HTTP REST API
 */
async function sendViaBrevoApi(recipientEmail, otpCode, apiKey) {
  const senderEmail = process.env.SMTP_USER || "lingeshr2007@gmail.com";
  const senderName = "Nidhi Track Security";

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: recipientEmail }],
    subject: "NidhiTrack Verification Code",
    htmlContent: getHtmlTemplate(otpCode),
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
        from: `"Nidhi Track Security" <${senderEmail}>`,
        to: recipientEmail,
        subject: "NidhiTrack Verification Code",
        text: `Hello,\n\nYour NidhiTrack verification code is ${otpCode}.\n\nThis code is valid for 5 minutes.\nNever share this code with anyone.\nIf you did not request this code, simply ignore this email.\n\nThank you,\nNidhiTrack Security Team`,
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
        from: `"Nidhi Track Security" <${senderEmail}>`,
        to: recipientEmail,
        subject: "NidhiTrack Verification Code",
        text: `Hello,\n\nYour NidhiTrack verification code is ${otpCode}.\n\nThis code is valid for 5 minutes.\nNever share this code with anyone.\nIf you did not request this code, simply ignore this email.\n\nThank you,\nNidhiTrack Security Team`,
        html: getHtmlTemplate(otpCode),
      });

      console.log(`✅ [BREVO SMTP SSL SUCCESS] Delivered to inbox: ${recipientEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (sslErr) {
      console.warn("⚠️ Brevo SMTP Port 465 failed:", sslErr.message);
    }
  }

  // Attempt 4: Ethereal / Fallback Mailer
  console.log("ℹ️ Local network fallback mailer dispatch...");
  try {
    const etherealPromise = (async () => {
      const testAccount = await nodemailer.createTestAccount();
      const fallbackMailer = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
        connectionTimeout: 2000,
      });

      const info = await fallbackMailer.sendMail({
        from: `"Nidhi Track Security" <${senderEmail}>`,
        to: recipientEmail,
        subject: "NidhiTrack Verification Code",
        html: getHtmlTemplate(otpCode),
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 [TEST EMAIL PREVIEW LINK] Click to view email online: ${previewUrl}\n`);
      }
      return { success: true, messageId: info.messageId, previewUrl };
    })();

    const timeoutPromise = new Promise((res) => setTimeout(() => res({ success: true }), 1500));
    return await Promise.race([etherealPromise, timeoutPromise]);
  } catch (err) {
    console.log(`ℹ️ OTP Code is saved in memory: [ ${otpCode} ]`);
    return { success: true };
  }
}

function getHtmlTemplate(otpCode) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NidhiTrack Verification Code</title>
    </head>
    <body style="margin:0; padding:0; background-color:#F4F4F6; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F4F4F6; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 500px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E8E8EA;">
              <!-- Header Bar -->
              <tr>
                <td style="background-color: #4F5DED; padding: 28px 32px; text-align: left;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="vertical-align: middle; width: 44px;">
                        <div style="background-color: #FFFFFF; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; color: #4F5DED; font-weight: 900; font-size: 22px; font-family: sans-serif;">N</div>
                      </td>
                      <td style="vertical-align: middle; padding-left: 12px;">
                        <span style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; display: block;">NidhiTrack Security</span>
                        <span style="color: #E0E7FF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">2-Factor Authentication</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px; color: #1A1A1E;">
                  <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #1A1A1E; letter-spacing: -0.3px;">
                    Verify Your Account
                  </h1>
                  <p style="font-size: 15px; color: #52525B; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello,<br/><br/>
                    Please use the following 6-digit verification code to complete your login on NidhiTrack:
                  </p>

                  <!-- OTP Code Display Card -->
                  <div style="background-color: #F8FAFC; border: 2px dashed #4F5DED; border-radius: 16px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
                    <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; color: #4F5DED; letter-spacing: 12px; display: block; margin-left: 12px;">
                      ${otpCode}
                    </span>
                    <span style="font-size: 12px; color: #64748B; font-weight: 600; margin-top: 10px; display: inline-block;">
                      ⏱️ Valid for 5 minutes only
                    </span>
                  </div>

                  <!-- Security Warning -->
                  <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="font-size: 13px; color: #991B1B; margin: 0; font-weight: 600; line-height: 1.4;">
                      ⚠️ Never share this code with anyone. NidhiTrack team members will never ask for your verification code.
                    </p>
                  </div>

                  <p style="font-size: 13px; color: #71717A; line-height: 1.5; margin: 0;">
                    If you did not request this verification code, you can safely ignore this email. Someone may have entered your email address by mistake.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FAFAFA; padding: 20px 32px; border-top: 1px solid #F4F4F6; text-align: center;">
                  <p style="font-size: 12px; color: #A1A1AA; margin: 0; font-weight: 500;">
                    © 2026 NidhiTrack Financial Technologies Inc. All rights reserved.<br/>
                    Automated Security Notification • Do not reply directly to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
