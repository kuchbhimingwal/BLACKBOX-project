import { Hono } from 'hono'

const postServer = new Hono()

postServer.get('/', (c) => {
  return c.text('user server')
})

export default postServer