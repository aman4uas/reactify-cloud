import { Request, Response } from 'express'
import { Deployment } from '../models'
import mongoose from 'mongoose'

const getSiteDeployments = async (req: Request, res: Response) => {
  try {
    const projectId = new mongoose.Types.ObjectId(req.body.projectId)

    const deployments = await Deployment.aggregate([
      {
        $match: { projectId: projectId }
      },
      {
        $sort: { createdAt: -1 }
      }
    ])

    return res.status(200).json({
      success: true,
      data: deployments
    })
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error
    })
  }
}

export { getSiteDeployments }
