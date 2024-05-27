import { Document } from 'mongoose'

interface IUser extends Document {
  name: string
  username: string
  gitHubToken: string
  createdAt: Date
}

export { IUser }
