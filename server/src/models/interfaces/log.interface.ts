import { Document, Types } from 'mongoose'

interface ILog extends Document {
  deploymentId: Types.ObjectId
  output1: string
  output2: string
  createdAt: Date
}

export { ILog }
