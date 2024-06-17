import { Document, Schema, model } from 'mongoose'

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

const ProjectSchema = new Schema<IProject>({
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  repoName: {
    type: String,
    required: true,
    trim: true
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  buildCommand: {
    type: String,
    trim: true
  },
  sourceDirectory: {
    type: String,
    trim: true
  },
  publishDirectory: {
    type: String,
    trim: true
  },
  env: {
    type: String,
    trim: true
  },
  customDomain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  subDomain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  webhookId: {
    type: String,
    trim: true
  },
  autoDeploy: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Project = model<IProject>('Project', ProjectSchema)

export { Project }
