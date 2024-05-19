import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const postServer = new Hono<{
  Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	},
  Variables:{
    userId: string,
    name: string
  }
}>()

postServer.use('/*', async(c,next)=>{
  const authHeader = c.req.header('Authorization');
  const secret = c.env.JWT_SECRET;
  if(!authHeader){
    return c.json({message: "undefinde jason web token"})
  }
  const jwt = authHeader.split(" ")[1]
  try {
    const jwtVerify = await verify(jwt, secret)
    c.set("userId", jwtVerify.userId)
    c.set("name", jwtVerify.name)
    await next();
  } catch (error) {
    console.log(error);
    c.status(411)
    return c.json({message: "not a verified user"})
  }
})


postServer.get('/create', (c) => {
  const userId = c.get("userId")
  return c.json(c.get("userId"))
})
export default postServer