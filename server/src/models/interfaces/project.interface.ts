import { Document } from 'mongoose'

interface IProject extends Document {
  createdBy: string
  repoName: string
  branchName: string
  buildCommand: string
  sourceDirectory: string
  publishDirectory: string
  customDomain: string
  subDomain: string
  env: string
  webhookId: string
  autoDeploy: boolean
  createdAt: Date
}

export { IProject }
