import { Request, Response } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

import { User } from '../models'
import { JWT_EXPIRY_TIME } from '../constants'

interface IPayload {
  username: String
}

const githubAuth = async (req: Request, res: Response) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`
  )
}

const callback = async (req: Request, res: Response) => {
  try {
    const result = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: req.query.code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    )
  
    const githubAcessToken = result.data.access_token
    const apiUrl = 'https://api.github.com/user'
  
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${githubAcessToken}`
      }
    })
  
    const currentUser = await User.findOne({ username: response.data.login })
  
    const payload: IPayload = { username: response.data.login }
    const userAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: JWT_EXPIRY_TIME
    })
  
    if (currentUser) {
      const updatedUser = await User.findOneAndUpdate(
        { username: response.data.login },
        { gitHubToken: githubAcessToken },
        { new: true }
      )
    } else {
      const newUser = new User({
        name: response.data.name || "GitHub User",
        username: response.data.login,
        gitHubToken: githubAcessToken
      })
      await newUser.save()
    }
  
    const option = {
      httpOnly: true,
      secure: true
    }
  
    res.cookie('accessToken', userAccessToken, option).redirect(`${process.env.FRONTEND_URL}`)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong !!",
      error: error
    })
  }
}

export { callback, githubAuth }
