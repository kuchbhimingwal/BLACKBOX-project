import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
const userRoute = new Hono<{
  Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	},
  Variables:{
    userId: string,
    name: string
  }
}>()


userRoute.get('/signup', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const secret = c.env.JWT_SECRET;
  try {
    const res = await prisma.user.create({
      data:{
        name: body.name,
        email: body.email,
        password: body.password
      }
    })
    const payload = {
      userId: res.id,
      name: res.name
      // exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
    }
    const token = await sign(payload, secret)
    
    return c.json({token: token, message: "Siggen up"})
  } catch (error) {
    console.log(error);
    return c.json({message: "error while logging in!!"})
  }
})

userRoute.get('/login', async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const secret = c.env.JWT_SECRET;
  try {
    const res = await prisma.user.findUnique({
      where:{
        email: body.email,
        password: body.password
      }
    });
    if(!res){
      return c.json({message: "Check you credential"})
    }
    const payload = {
      userId: res.id,
      name: res.name
      // exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
    }
    const token = await sign(payload, secret)
    return c.json({message: "logged in", token: token})
  } catch (error) {
    console.log(error);
    return c.json({message: " Issue while logging in"})
  }
})

export default userRoute