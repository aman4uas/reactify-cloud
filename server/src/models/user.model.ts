import { Schema, model } from 'mongoose'
import { IUser } from './interfaces'

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gitHubToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = model<IUser>('User', UserSchema)

export default User
