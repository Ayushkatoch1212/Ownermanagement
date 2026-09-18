import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(
      process.env.SMTP_PORT || 587
    ),
    secure:
      process.env.SMTP_SECURE === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// ----------------------------------
// Registration OTP
// ----------------------------------

export async function sendVerificationOtpEmail(
  email: string,
  otp: string
) {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,

    subject:
      "PG Manager - Verify Your Email",

    text: `
Welcome to PG Manager.

Your email verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not create this account, please ignore this email.
`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
        "
      >

        <h2>PG Manager</h2>

        <p>
          Welcome to PG Manager.
        </p>

        <p>
          Use the OTP below to verify your email:
        </p>

        <div
          style="
            background:#f4f4f5;
            padding:20px;
            text-align:center;
            margin:25px 0;
            border-radius:8px;
          "
        >
          <span
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
            "
          >
            ${otp}
          </span>
        </div>

        <p>
          This OTP will expire in
          <strong>10 minutes</strong>.
        </p>

        <p style="color:#666;">
          If you did not create this account,
          please ignore this email.
        </p>

      </div>
    `,
  });
}

// ----------------------------------
// Password Reset OTP
// ----------------------------------

export async function sendPasswordResetOtpEmail(
  email: string,
  otp: string
) {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,

    subject:
      "PG Manager - Password Reset OTP",

    text: `
You requested to reset your PG Manager password.

Your password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
        "
      >

        <h2>PG Manager</h2>

        <p>
          You requested to reset your password.
        </p>

        <p>
          Use the OTP below:
        </p>

        <div
          style="
            background:#f4f4f5;
            padding:20px;
            text-align:center;
            margin:25px 0;
            border-radius:8px;
          "
        >
          <span
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
            "
          >
            ${otp}
          </span>
        </div>

        <p>
          This OTP will expire in
          <strong>10 minutes</strong>.
        </p>

        <p style="color:#666;">
          If you did not request this,
          please ignore this email.
        </p>

      </div>
    `,
  });
}