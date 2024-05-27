import { Request, Response } from 'express'
import { User, Project, Deployment, Log } from '../models'
import { runECSTask } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'

interface KeyValue {
  key: string
  value: string
  visible: boolean
}

function sanitize(input: String) {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

const dbInsertLog = async (output1: string, output2: string, DEPLOYMENT_ID: string) => {
  if (output1) console.log(output1)
  if (output2) console.log(output2)
  const deploymentId = new mongoose.Types.ObjectId(DEPLOYMENT_ID!)
  const logEntry = new Log({ deploymentId, output1, output2 })
  await logEntry.save()
}

function generateShortUUID() {
  let length = 15
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const processEnv = (array: KeyValue[]): String => {
  const result: Record<string, string> = {}
  array.forEach((item) => {
    if (item.key.length !== 0 && item.value.length !== 0) result[item.key] = item.value
  })
  const env = JSON.stringify(result)
  return env
}

const deployApp = async (req: Request, res: Response) => {
  const username = req.user?.username
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    })
  }
  const current_user = await User.findOne({ username })

  if (!current_user || !current_user.gitHubToken) {
    return res.status(404).json({
      success: false,
      message: 'User or GitHub token not found'
    })
  }
  const accessToken = current_user.gitHubToken
  const GIT_URL = `https://${accessToken}@github.com/${username}/${req.body.repo}.git`
  const SUB_DOMAIN = uuidv4()
  const CUSTOM_DOMAIN = sanitize(username) + '-' + sanitize(req.body.repo) + '-' + generateShortUUID()

  let project = await Project.findOneAndUpdate(
    {
      createdBy: username,
      repoName: req.body.repo,
      branchName: req.body.selectedBranch
    },
    {
      buildCommand: req.body.buildCommand,
      sourceDirectory: req.body.baseDirectory,
      publishDirectory: req.body.buildDirectory,
      env: processEnv(req.body.envVariables),
    },
    {
      new: true
    }
  )

  if(!project) {
    project = await Project.create({
      createdBy: username,
      repoName: req.body.repo,
      branchName: req.body.selectedBranch,
      buildCommand: req.body.buildCommand,
      sourceDirectory: req.body.baseDirectory,
      publishDirectory: req.body.buildDirectory,
      env: processEnv(req.body.envVariables),
      customDomain: CUSTOM_DOMAIN,
      subDomain: SUB_DOMAIN
    })
  }
  
  const PROJECT_ID = project._id

  const newDeployment = await Deployment.create({
    projectId: PROJECT_ID,
    status: 'Queued'
  })

  const DEPLOYMENT_ID = newDeployment._id!.toString()

  const envArray = [
    { name: 'GIT_URL', value: GIT_URL },
    { name: 'DEPLOYMENT_ID', value: DEPLOYMENT_ID.toString() },
    { name: 'PROJECT_ID', value: PROJECT_ID!.toString() },
    { name: 'SUB_DOMAIN', value: SUB_DOMAIN }
  ]

  try {
    console.log('Run task command')
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
    return res.status(400).json({
      success: false,
      message: 'Failed to Deploy'
    })
  }
}

export { deployApp }
