import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

import { router } from './routes'

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || `localhost:${process.env.PORT || 4000}`

app.use([
    express.json(), 
    cookieParser(), 
    cors({ origin: FRONTEND_URL, credentials: true }), 
    router
])

export default app