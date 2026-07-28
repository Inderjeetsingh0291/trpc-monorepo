import { db, eq } from '@repo/database'
import * as JWT from 'jsonwebtoken'
import { usersTable } from '@repo/database/models/user'
import { randomBytes, createHmac } from 'crypto'
import { type CreateUserWithEmailAndPasswordInputType, createUserwithEmailAndPasswordInput, GenerateUserTokenPayload, GenerateUserTokenPayloadType,SignInUserWithEmailAndPasswordInputType, signInUserWithEmailAndPasswordInput } from "./model"
import { env } from '../env'

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
            profileImageUrl: usersTable.profileImageUrl
        }).from(usersTable).where(eq(usersTable.id, userId))
        if (!user || user.length === 0) throw new Error(`User with id ${userId} not exists`)
            return user[0]!
    }

    private async generateHash(salt: string, password: string) {
        return createHmac('sha256', salt).update(password).digest('hex')
    }


    public async createUserwithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
        const { fullName, email, password } = await createUserwithEmailAndPasswordInput.parseAsync(payload)

        // check if user with email already exists
        const existingUserWithEmail = await this.getUserByEmail(email)

        if (existingUserWithEmail) {
            throw new Error(`User with email ${email} already exists`)
        }

        // calculate salt and hash the password
        const salt = randomBytes(16).toString('hex')
        const hash = await this.generateHash(salt, password)

        // create user in the database
        const userInsertResult = await db.insert(usersTable).values({
            fullName,
            email,
            password: hash,
            salt
        }).returning({
            id: usersTable.id
        })

        const newUser = userInsertResult[0]
        if (!newUser || !newUser.id) throw new Error(`Something went wrong while creating user with email ${email}`)

        const userId = newUser.id
        const { token } = await this.generateUserToken({
            id: userId
        })

        return {
            id: userId,
            token
        }
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
}

export default userService