import { IDeployment } from './interfaces'
import { Schema, model } from 'mongoose'

enum Status {
  Processing = 'Processing',
  Queued = 'Queued',
  Failed = 'Failed',
  Success = 'Success'
}

const DeploymentSchema = new Schema<IDeployment>({
  projectId: {
    type: Schema.Types.ObjectId,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Status,
    default: Status.Queued
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Deployment = model<IDeployment>('Deployment', DeploymentSchema)
export default Deployment
