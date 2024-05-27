import { Request, Response } from 'express'
import { Log } from '../models'
import mongoose from 'mongoose'

const getDeploymentLogs = async (req: Request, res: Response) => {
  try {
    const deploymentId = req.body.deploymentId
    const logs = await Log.aggregate([
      {
        $match: { deploymentId: new mongoose.Types.ObjectId(deploymentId) }
      },
      {
        $sort: { createdAt: 1 }
      }
    ])

    return res.status(200).json({
      success: true,
      data: logs
    })
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error
    })
  }
}

export { getDeploymentLogs }
