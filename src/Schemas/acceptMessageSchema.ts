import {z} from 'zod'

export const acceptMessageSchema = z.object({
    acceptMessages: z.boolean()
})

// This is only the message schema