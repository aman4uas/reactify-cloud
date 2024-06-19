import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { runECSTask } from '../utils'
import { Project, User, Deployment, Log } from '../models'

const dbInsertLog = async (output1: string, output2: string, DEPLOYMENT_ID: string) => {
  if (output1) console.log(output1)
  if (output2) console.log(output2)
  const deploymentId = new mongoose.Types.ObjectId(DEPLOYMENT_ID!)
  const logEntry = new Log({ deploymentId, output1, output2 })
  await logEntry.save()
}

const autoDeploySite = async (req: Request, res: Response) => {
  try {
    const webhook = req.webhook
    if (!webhook) {
      return res.status(200).json({
        success: false,
        message: 'Cannot find webhook !!'
      })
    }

    const { branch, repo, username, event } = webhook
    if (!branch || !repo || !username || !event) {
      return res.status(200).json({
        success: false,
        message: 'Input fields missing - Server'
      })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(200).json({
        success: false,
        message: 'Cannot find User'
      })
    }

    const project = await Project.findOne({
      createdBy: username,
      repoName: repo,
      branchName: branch
    })
    if (!project) {
      return res.status(200).json({
        success: false,
        message: 'Project not found !!'
      })
    }

    const newDeployment = await Deployment.create({
      projectId: project._id,
      status: 'Queued'
    })
    const DEPLOYMENT_ID = newDeployment._id!.toString()

    const envArray = [
      { name: 'GIT_URL', value: `https://${user.gitHubToken}@github.com/${username}/${repo}.git` },
      { name: 'DEPLOYMENT_ID', value: newDeployment._id!.toString() },
      { name: 'PROJECT_ID', value: project._id!.toString() },
      { name: 'SUB_DOMAIN', value: project.subDomain }
    ]

    try {
      await runECSTask(envArray)
      await dbInsertLog('Process Queued...', '', DEPLOYMENT_ID)
      const updatedDeploy = await Deployment.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(DEPLOYMENT_ID) },
        { status: 'Queued' },
        { new: true }
      )
      console.log(updatedDeploy)
      return res.status(200).json({
        success: true,
        message: 'Process Queued',
        data: DEPLOYMENT_ID
      })
    } catch (error) {
      await dbInsertLog('Process Failed...', '', DEPLOYMENT_ID)
      const updatedDeploy = await Deployment.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(DEPLOYMENT_ID) },
        { status: 'Failed' },
        { new: true }
      )
      console.log(error)
      return res.status(200).json({
        success: false,
        message: 'Failed to Deploy !!'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong (in autodeploy)!!',
      error: error
    })
  }
}

export { autoDeploySite }
