import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

import { UserSchema , LogginSchema } from "@kuchbhimingwal/blackbox-zod"

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


userRoute.post('/signup', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const secret = c.env.JWT_SECRET;

  const { success } = UserSchema.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({message:"invalid creadentials"})
  }
  try {
    
    const userCheck = await prisma.user.findUnique({
      where:{
        email: body.email,
        password: body.password
      }
    });
    if(userCheck){
      c.status(401);
      return c.json({message: "user already exists"})
    }
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
    c.status(401)
    return c.json({message: "error while sign up!!"})
  }
})

userRoute.post('/login', async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const secret = c.env.JWT_SECRET;
  const { success } = LogginSchema.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({message:"invalid creadentials"})
  }
  try {
    const res = await prisma.user.findUnique({
      where:{
        email: body.email,
        password: body.password
      }
    });
    if(!res){
      c.status(401)
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
    c.status(401)
    return c.json({message: " Issue while logging in"})
  }
})

export default userRoute