import nodemailer from "nodemailer"

type EmailResult = {
  delivered: boolean
  fallback: boolean
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !port || !from) {
    return null
  }

  return {
    host,
    port,
    auth: user && pass ? { user, pass } : undefined,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    from,
  }
}

export async function sendSignupOtpEmail(email: string, otp: string): Promise<EmailResult> {
  const smtp = getSmtpConfig()

  if (!smtp) {
    console.info(`[OTP DEV FALLBACK] Signup OTP for ${email}: ${otp}`)
    return { delivered: false, fallback: true }
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  })

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your NearMe verification code",
    text: `Your NearMe verification code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h2>NearMe Email Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold;">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  })

  return { delivered: true, fallback: false }
}

export async function sendDeleteAccountOtpEmail(email: string, otp: string): Promise<EmailResult> {
  const smtp = getSmtpConfig()

  if (!smtp) {
    console.info(`[OTP DEV FALLBACK] Delete account OTP for ${email}: ${otp}`)
    return { delivered: false, fallback: true }
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  })

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "NearMe account deletion OTP",
    text: `Your NearMe account deletion OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4;">
        <h2>NearMe Account Deletion Confirmation</h2>
        <p>Use this OTP to confirm permanent account deletion:</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold;">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  })

  return { delivered: true, fallback: false }
}
