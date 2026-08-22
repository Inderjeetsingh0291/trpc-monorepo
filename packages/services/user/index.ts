import { db, eq } from '@repo/database'
import * as JWT from 'jsonwebtoken'
import { usersTable } from '@repo/database/models/user'
import { randomBytes, createHmac } from 'crypto'
import { type CreateUserWithEmailAndPasswordInputType, createUserwithEmailAndPasswordInput, GenerateUserTokenPayload, GenerateUserTokenPayloadType,SignInUserWithEmailAndPasswordInputType, signInUserWithEmailAndPasswordInput } from "./model"
import { env } from '../env'
import EmailService from '../email'

const emailService = new EmailService()

class userService {

    private async getUserByEmail(email: string) {
        const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
        if (!result || result.length === 0) return null
        return result[0]
    }

    private async generateUserToken(payload: GenerateUserTokenPayloadType) {
        const { id } = await GenerateUserTokenPayload.parseAsync(payload)
        console.log({secretKey: env.JWT_SECRET})
        const token = JWT.sign({ id }, env.JWT_SECRET, { expiresIn: "12h" })
        return { token }
    }

    private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
        try{
            const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType
            return verificationResult
        } catch (error) {
            throw new Error('Invalid token')
        }
    }

    public async getUserInfoById(userId: string) {
        const user = await db.select({
            id: usersTable.id,
            fullName: usersTable.fullName,
            email: usersTable.email,
            emailVerified: usersTable.emailVerified,
            profileImageUrl: usersTable.profileImageUrl
        }).from(usersTable).where(eq(usersTable.id, userId))
        if (!user || user.length === 0) throw new Error(`User with id ${userId} not exists`)
            return user[0]!
    }

    private async generateHash(salt: string, password: string) {
        return createHmac('sha256', salt).update(password).digest('hex')
    }


    public async createUserwithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType, baseUrl?: string) {
        const { fullName, email, password } = await createUserwithEmailAndPasswordInput.parseAsync(payload)

        // check if user with email already exists
        const existingUserWithEmail = await this.getUserByEmail(email)

        if (existingUserWithEmail) {
            throw new Error(`User with email ${email} already exists`)
        }

        // calculate salt and hash the password
        const salt = randomBytes(16).toString('hex')
        const hash = await this.generateHash(salt, password)
        const verificationToken = randomBytes(32).toString('hex')

        // create user in the database
        const userInsertResult = await db.insert(usersTable).values({
            fullName,
            email,
            password: hash,
            salt,
            emailVerified: false,
            verificationToken,
        }).returning({
            id: usersTable.id
        })

        const newUser = userInsertResult[0]
        if (!newUser || !newUser.id) throw new Error(`Something went wrong while creating user with email ${email}`)

        const userId = newUser.id
        const { token } = await this.generateUserToken({
            id: userId
        })

        // Automatically send verification email
        const defaultHost = process.env.NODE_ENV === "production" ? "https://make-forms.vercel.app" : "http://localhost:3000"
        const hostUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || defaultHost
        const verificationUrl = `${hostUrl}/verify-email?token=${verificationToken}`
        
        try {
            await emailService.sendVerificationEmail({ to: email, verificationUrl })
        } catch (err) {
            console.error("[userService] Error sending verification email:", err)
        }

        return {
            id: userId,
            token
        }
    }

    public async verifyEmailToken(token: string) {
        if (!token) throw new Error("Verification token is required")

        const users = await db.select().from(usersTable).where(eq(usersTable.verificationToken, token))
        if (!users || users.length === 0) {
            throw new Error("Invalid or expired verification token")
        }

        const user = users[0]!
        await db.update(usersTable).set({
            emailVerified: true,
            verificationToken: null,
        }).where(eq(usersTable.id, user.id))

        return { success: true, message: "Email verified successfully" }
    }

    public async resendVerificationEmail(email: string, baseUrl?: string) {
        const user = await this.getUserByEmail(email)
        if (!user) {
            throw new Error(`User with email ${email} not found`)
        }

        if (user.emailVerified) {
            return { success: true, message: "Email is already verified" }
        }

        const verificationToken = randomBytes(32).toString('hex')
        await db.update(usersTable).set({
            verificationToken
        }).where(eq(usersTable.id, user.id))

        const defaultHost = process.env.NODE_ENV === "production" ? "https://make-forms.vercel.app" : "http://localhost:3000"
        const hostUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || defaultHost
        const verificationUrl = `${hostUrl}/verify-email?token=${verificationToken}`

        await emailService.sendVerificationEmail({ to: email, verificationUrl })

        return { success: true, message: "Verification email sent successfully" }
    }

    public async forgotPassword(email: string, baseUrl?: string) {
        const user = await this.getUserByEmail(email)
        if (!user) {
            // Return success anyway for security so user enumeration is not allowed
            return { success: true, message: "If an account exists with this email, a reset link has been sent." }
        }

        const resetToken = randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        await db.update(usersTable).set({
            resetPasswordToken: resetToken,
            resetPasswordExpires: expires,
        }).where(eq(usersTable.id, user.id))

        const defaultHost = process.env.NODE_ENV === "production" ? "https://make-forms.vercel.app" : "http://localhost:3000"
        const hostUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || defaultHost
        const resetUrl = `${hostUrl}/reset-password?token=${resetToken}`

        await emailService.sendResetPasswordEmail({ to: email, resetUrl })

        return { success: true, message: "Password reset email sent successfully" }
    }

    public async resetPassword(token: string, newPassword: string) {
        if (!token) throw new Error("Reset password token is required")

        const users = await db.select().from(usersTable).where(eq(usersTable.resetPasswordToken, token))
        if (!users || users.length === 0) {
            throw new Error("Invalid or expired password reset token")
        }

        const user = users[0]!
        if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
            throw new Error("Password reset token has expired. Please request a new one.")
        }

        const salt = randomBytes(16).toString('hex')
        const hash = await this.generateHash(salt, newPassword)

        await db.update(usersTable).set({
            password: hash,
            salt,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        }).where(eq(usersTable.id, user.id))

        return { success: true, message: "Password updated successfully" }
    }

    public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
        const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload)

        const existingUser = await this.getUserByEmail(email)
        if (!existingUser) 
            throw new Error(`User with email ${email} not found`)
        
        if(!existingUser.password || !existingUser.salt) 
            throw new Error(`Invalid Authentication method`)

        const hash = await this.generateHash(existingUser.salt, password)
        if(existingUser.password !== hash) 
            throw new Error(`Invalid email address or Password`)
        
        const {token} = await this.generateUserToken({
            id: existingUser.id
        })

        return {
            id: existingUser.id,
            token
        }
    }

    public async verifyAndDecodeUserToken(token: string) {
        const { id } = await this.verifyUserToken(token)
        return {id}
    }

    public async getOrCreateDefaultUser() {
        const users = await db.select({ id: usersTable.id }).from(usersTable).limit(1)
        if (users && users.length > 0 && users[0]?.id) {
            return { id: users[0].id }
        }
        const created = await db.insert(usersTable).values({
            fullName: "Inderjeet Singh",
            email: "inderjeet8314@gmail.com",
        }).returning({ id: usersTable.id })
        return { id: created[0]!.id }
    }

    public async sendVerificationEmail(payload: { to: string; verificationUrl: string }) {
        return emailService.sendVerificationEmail(payload)
    }

    public async sendResetPasswordEmail(payload: { to: string; resetUrl: string }) {
        return emailService.sendResetPasswordEmail(payload)
    }
}

export default userService