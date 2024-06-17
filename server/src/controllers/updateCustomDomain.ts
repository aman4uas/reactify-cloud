import { Request, Response } from 'express'
import { Project } from '../models'
import mongoose from 'mongoose'

const sanitize = (input: string) => {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

const updateCustomDomain = async (req: Request, res: Response) => {
  try {
    const { customSubdomain, id } = req.body
    const santizedInput = sanitize(customSubdomain)
    if (santizedInput !== customSubdomain || customSubdomain.length < 4 || customSubdomain.length > 15) {
      return res.status(200).json({
        success: false,
        message: 'Invalid character input !!'
      })
    }
    const tempProject = await Project.findOne({ customDomain: customSubdomain })
    if (tempProject) {
      return res.status(200).json({
        success: false,
        message: 'Subdomain already taken !!'
      })
    }
    const updatedProject = await Project.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { customDomain: customSubdomain },
      { new: true }
    )

    if (!updatedProject) {
      return res.status(200).json({
        success: false,
        message: 'Cannot find Project'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully updated'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong !!',
      error: error
    })
  }
}

export { updateCustomDomain }
