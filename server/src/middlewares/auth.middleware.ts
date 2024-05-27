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
    console.log('Unauthorized user !!')
    res.status(401).json({
      success: false,
      message: 'Unauthorized user !!'
    })
  }
}

export { auth }
