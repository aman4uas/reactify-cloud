import { Request, Response } from 'express'

const logout = async (req: Request, res: Response) => {
  res.status(200).cookie('accessToken', '').json({
    success: true,
    message: 'Succefully logged out !!'
  })
}

export { logout }
