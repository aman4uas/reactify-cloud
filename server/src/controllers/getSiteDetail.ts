import { Request, Response } from 'express'
import { Project } from '../models'
import mongoose from 'mongoose'

const getSiteDetail = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id
    const pId = new mongoose.Types.ObjectId(projectId)
    const project = await Project.findOne({ _id: pId }).select('-subDomain -webhookId').exec()
    return res.status(200).json({
      success: true,
      data: project
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

export { getSiteDetail }
