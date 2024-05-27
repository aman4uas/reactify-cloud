import { Request, Response } from 'express'
import { Project } from '../models'
import mongoose from 'mongoose'

const getSiteDetail = async (req: Request, res: Response) => {
  const projectId = req.params.id
  const pId = new mongoose.Types.ObjectId(projectId)
  const project = await Project.findOne({ _id: pId })
    .select('-publishDirectory -sourceDirectory -buildCommand -createdBy -subDomain -env')
    .exec()
  return res.status(200).json({
    success: true,
    data: project
  })
}

export { getSiteDetail }
