import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()
const userRoute = new Hono()

userRoute.get('/signup', async(c) => {
  const body = await c.req.parseBody()
  return c.json(body)
})

export default userRoute