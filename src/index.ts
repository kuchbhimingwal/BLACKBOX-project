import { Hono } from 'hono'
import userRoute from './routes/users'
import postServer from './routes/posts'
const app = new Hono()

app.route('/user', userRoute)
app.route('/post', postServer)

export default app
