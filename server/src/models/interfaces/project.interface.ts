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
  createdAt: Date
}

export { IProject }
