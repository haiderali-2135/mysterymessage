// zod is typescript for schema validation
// Makes validation easy
 import {z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "Username must be atleast 2 characters")
    .max(20, "username must be no more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")



export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "invalid email address"}),
    password: z.string().min(6, {message: "Password must be atleast 6 characters"}).max(20, {message: "Password must be less that 20 characters"})
})