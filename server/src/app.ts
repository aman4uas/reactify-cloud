import express, {Request, Response} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

import { router } from './routes'

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: ['http://localhost:3000', FRONTEND_URL], credentials: true }))
app.use(router)

app.get("/", (req:Request, res:Response)=> {
    res.send("Server is running !!")
})

export default app
