import mongoose from 'mongoose'
const DB_NAME = process.env.DB_NAME || 'vercelClone'

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log('Connected to MongoDB successfully !!')
  } catch (error) {
    console.log('MONGODB connection FAILED ', error)
    process.exit(1)
  }
}

export default connectDB
