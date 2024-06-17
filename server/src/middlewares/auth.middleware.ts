import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
dotenv.config()

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET!)
    req.user = payload
    next()
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: 'User Unauthorised !!'
    })
  }
}

export { auth }
