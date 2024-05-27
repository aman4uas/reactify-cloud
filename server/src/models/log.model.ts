import { ILog } from './interfaces'
import { Schema, model } from 'mongoose'

const LogSchema = new Schema<ILog>({
  deploymentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  output1: {
    type: String
  },
  output2: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Log = model<ILog>('Log', LogSchema)

export default Log
