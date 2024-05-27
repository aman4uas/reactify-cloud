import { Document, Types } from 'mongoose'

enum Status {
  Processing = 'Processing',
  Queued = 'Queued',
  Failed = 'Failed',
  Success = 'Success'
}

interface IDeployment extends Document {
  projectId: Types.ObjectId
  status: Status
  createdAt: Date
}

export { IDeployment }
