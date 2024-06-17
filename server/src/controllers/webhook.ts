import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Project, User } from '../models'
import { updateWebhookActiveStatus } from '../utils'

const updateWebhookStatus = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      return res.status(200).json({
        success: false,
        message: 'Username is required'
      })
    }
    const current_user = await User.findOne({ username })
    if (!current_user || !current_user.gitHubToken) {
      return res.status(200).json({
        success: false,
        message: 'User or GitHub token not found'
      })
    }
    const accessToken = current_user.gitHubToken
    const projectId = req.body.projectId

    const project = await Project.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(projectId) },
      { autoDeploy: req.body.autodeploy },
      { new: true }
    )

    if (!project) {
      return res.status(200).json({
        success: false,
        message: 'Project not found !!'
      })
    }

    const repo = project.repoName
    const webhookId = project.webhookId
    const autodeploy = req.body.autodeploy

    await updateWebhookActiveStatus(accessToken, username, repo, webhookId, autodeploy)

    return res.status(200).json({
      success: true,
      message: 'Successfully updated webhook active status'
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

export { updateWebhookStatus }
