import express from 'express'
import statusRouter from './routes/status.route.js'
import authRouter from './routes/auth.route.js'
import mongoDB from './config/db.config.js'
import cors from 'cors'
import productRouter from './routes/product.route.js'
import errorHandlerMiddleware from './middlewares/errorHandler.middleware.js'
import { customCorsMiddleware } from './middlewares/cors.middleware.js'
import cartRouter from './routes/cart.route.js'

const PORT = 3000
const app = express()

app.use(customCorsMiddleware)

//cors es un middleware que habilita las consultas de origen cruzadas
app.use(cors())
app.use(express.json({ limit: '3mb' }))

app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/cart', cartRouter)


app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
    console.log(`el servidor se esta ejecutando en http://localhost:${PORT}`)
})