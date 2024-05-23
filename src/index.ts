import { Hono } from 'hono'
import userRoute from './routes/users'
import postServer from './routes/posts'
import { cors } from  'hono/cors'
const app = new Hono()

app.use('/*', cors())
app.route('/user', userRoute)
app.route('/post', postServer)

export default app
