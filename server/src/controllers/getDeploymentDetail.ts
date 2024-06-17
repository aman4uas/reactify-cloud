import { Request, Response } from 'express'
import { Deployment } from '../models'
import mongoose from 'mongoose'

const getDeploymentDetail = async (req: Request, res: Response) => {
  try {
    const deploymentId = req.params.id
    const dId = new mongoose.Types.ObjectId(deploymentId)
    const deploymentDetails = await Deployment.findOne({ _id: dId })
    return res.status(200).json({
      success: true,
      data: deploymentDetails
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong !!",
      error: error
    })
  }
}

export { getDeploymentDetail }
