import nodemailer from "nodemailer"
import { emailEnv } from "../env"
import {
    type SendVerificationEmailInputType, sendVerificationEmailInput,
    type SendResetPasswordEmailInputType, sendResetPasswordEmailInput
} from "./model"

const getTransporter = () => {
    const host = process.env.SMTP_HOST || emailEnv.SMTP_HOST || "smtp.gmail.com"
    const port = Number(process.env.SMTP_PORT || emailEnv.SMTP_PORT || 587)
    const user = process.env.SMTP_USER || emailEnv.SMTP_USER || "inderjeet8314@gmail.com"
    const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || emailEnv.SMTP_PASS || ""

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    })
}

class EmailService {

    public async sendVerificationEmail(payload: SendVerificationEmailInputType) {
        const { to, verificationUrl } = await sendVerificationEmailInput.parseAsync(payload)
        const transporter = getTransporter()
        const fromEmail = emailEnv.FROM_EMAIL || emailEnv.SMTP_USER || "inderjeet8314@gmail.com"

        const info = await transporter.sendMail({
            from: `"Makeforms" <${fromEmail}>`,
            to,
            subject: "Verify your email address - Makeforms",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Makeforms</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Email Verification</p>
                    </div>
                    <div style="color: #334155; line-height: 1.6; font-size: 15px;">
                        <p>Hello,</p>
                        <p>Thank you for signing up with Makeforms! Please verify your email address to complete your registration.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Verify Email Address</a>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #4f46e5; font-size: 13px;">${verificationUrl}</p>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Makeforms. All rights reserved.</p>
                </div>
            `,
        })

        console.log(`[EmailService] Verification email sent to ${to}, messageId: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    }

    public async sendResetPasswordEmail(payload: SendResetPasswordEmailInputType) {
        const { to, resetUrl } = await sendResetPasswordEmailInput.parseAsync(payload)
        const transporter = getTransporter()
        const fromEmail = emailEnv.FROM_EMAIL || emailEnv.SMTP_USER || "inderjeet8314@gmail.com"

        const info = await transporter.sendMail({
            from: `"Makeforms" <${fromEmail}>`,
            to,
            subject: "Reset your password - Makeforms",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Makeforms</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset</p>
                    </div>
                    <div style="color: #334155; line-height: 1.6; font-size: 15px;">
                        <p>Hello,</p>
                        <p>We received a request to reset the password for your Makeforms account. Click the button below to set a new password:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #dc2626; font-size: 13px;">${resetUrl}</p>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Makeforms. All rights reserved.</p>
                </div>
            `,
        })

        console.log(`[EmailService] Reset password email sent to ${to}, messageId: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    }
}

export default EmailService
