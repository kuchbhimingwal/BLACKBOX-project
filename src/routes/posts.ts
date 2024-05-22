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

postServer.post('/create', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");
  const body = await c.req.json();
  try {
    const res = await prisma.post.create({
      data:{
        title: body.title,
        content: body.content,
        authorId : userId
      }
    });
    console.log(res);
    c.status(200)
    return c.json({message:"post created"})
  } catch (error) {
    console.log(error);
    c.status(411)
    return c.json({message: "error whiel creating post"})
  }
})

postServer.put('/update/:id', async(c)=>{
  const postId = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");

  const body = await c.req.json();
  try {
    const res = await prisma.post.update({
      where:{
        id: postId,
        authorId: userId
      },
      data:{
        title: body.title,
        published: body.publish,
        content: body.content
      }
    })
    console.log(res);
    
    return c.json({message: "updated", newpost: res})
  } catch (error) {
    console.log(error);
    return c.json({message: "error while updating"})
  }

})
postServer.put('/publish/:id', async(c)=>{
  const postId = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");

  try {
    const res = await prisma.post.update({
      where:{
        id: postId,
        authorId: userId
      },
      data:{
        published: true
      }
    })
    console.log(res);
    
    return c.json({message: "published"})
  } catch (error) {
    console.log(error);
    return c.json({message: "error while publishing"})
  }
})
postServer.delete("/delete/:id", async(c)=>{
  const postId = c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");
  try {
    const res = prisma.post.delete({
      where:{
        id: postId,
        authorId: userId
      }
    })
    return c.json({meassage: "post deleted", res: res})
  } catch (error) {
    console.log(error);
    c.status(411)
    return c.json({message: "error while deleting"});
    
  }
})
export default postServer