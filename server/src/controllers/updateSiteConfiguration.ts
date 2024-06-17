import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Project, User, Deployment } from '../models'
import { processEnv, dbInsertLog } from './deployApp'
import { updateWebhookActiveStatus, runECSTask } from '../utils'

const updateSiteConfiguration = async (req: Request, res: Response) => {
  try {
    const { autoDeploy, publishDirectory, buildCommand, sourceDirectory, id, env } = req.body

    const project = await Project.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        autoDeploy,
        buildCommand,
        sourceDirectory,
        publishDirectory,
        env: processEnv(env)
      },
      { new: true }
    )

    if (!project) {
      return res.status(200).json({
        success: false,
        message: 'Cannot find project ID'
      })
    }

    const current_user = await User.findOne({ username: project.createdBy })

    if (!current_user || !current_user.gitHubToken) {
      return res.status(200).json({
        success: false,
        message: 'User or GitHub token not found'
      })
    }
    await updateWebhookActiveStatus(
      current_user.gitHubToken,
      project.createdBy,
      project.repoName,
      project.webhookId,
      autoDeploy
    )

    const newDeployment = await Deployment.create({
      projectId: project._id,
      status: 'Queued'
    })

    const GIT_URL = `https://${current_user.gitHubToken}@github.com/${project.createdBy}/${project.repoName}.git`

    const envArray = [
      { name: 'GIT_URL', value: GIT_URL },
      { name: 'DEPLOYMENT_ID', value: newDeployment._id!.toString() },
      { name: 'PROJECT_ID', value: project._id!.toString() },
      { name: 'SUB_DOMAIN', value: project.subDomain }
    ]

    try {
      await runECSTask(envArray)
      await dbInsertLog('Process Queued...', '', newDeployment._id!.toString())
      const updatedDeploy = await Deployment.findOneAndUpdate(
        { _id: newDeployment._id },
        { status: 'Queued' },
        { new: true }
      )

      return res.status(200).json({
        success: true,
        message: 'Process Queued',
        data: newDeployment._id!.toString()
      })
    } catch (error) {
      await dbInsertLog('Process Failed...', '', newDeployment._id!.toString())
      const updatedDeploy = await Deployment.findOneAndUpdate(
        { _id: newDeployment._id },
        { status: 'Failed' },
        { new: true }
      )

      return res.status(200).json({
        success: false,
        message: 'Failed to Deploy'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong !!',
      error: error
    })
  }
}

export { updateSiteConfiguration }
