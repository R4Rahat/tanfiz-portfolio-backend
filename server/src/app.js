import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorHandler from './middleware/error.middleware.js'
import adminRoutes from './modules/admin/admin.routes.js'

const app = express()

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(cookieParser())


app.get('/health', (req, res) => {
    res.sendStatus(200)
})

app.use('/api/admin', adminRoutes)

app.use(errorHandler);

export default app