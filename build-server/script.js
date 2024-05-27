require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const mongoose = require('mongoose')
const { Deployment, Log, Project } = require('./model')

const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY

const GIT_URL = process.env.GIT_URL
const MONGO_URI = process.env.MONGO_URI
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID
const DB_NAME = process.env.DB_NAME
const PROJECT_ID = process.env.PROJECT_ID
const SUB_DOMAIN = process.env.SUB_DOMAIN

let OUTDIR_PATH = path.join(__dirname, 'output')
let project = null

/****** Helper Functions ******/

const dbInsertLog = async (output1, output2) => {
  if (output1) console.log(output1)
  if (output2) console.log(output2)
  const deploymentId = new mongoose.Types.ObjectId(DEPLOYMENT_ID)
  const logEntry = new Log({ deploymentId, output1, output2 })
  await logEntry.save()
}

const updateDeploymentStatus = async (status) => {
  console.log(`Updating Deployment Status to ${status} !!`)
  const deploymentId = new mongoose.Types.ObjectId(DEPLOYMENT_ID)
  const updatedDeploy = await Deployment.findOneAndUpdate({ _id: deploymentId }, { status }, { new: true })
  console.log('*******Updated Deployment Status:********\n', updatedDeploy)
}

const executeCommand = async (command, message) => {
  try {
    if (message) await dbInsertLog(message)
    const { stdout, stderr } = await execPromise(command)
    await dbInsertLog(stdout, stderr)
  } catch (error) {
    console.error(`Execution failed: ${error}`)
    throw error
  }
}

/***** Main Functions ******/

/* Step 0: Connect to MongoDB */
const dbConnect = async () => {
  const CONNECTION_URL = `${MONGO_URI}/${DB_NAME}`
  console.log(CONNECTION_URL)
  await mongoose.connect(CONNECTION_URL)
  console.log('Successfully connected to MongoDB !!')
}

/* Step 1.1: Fetch meta Data from DB */
const getMetaDataFromDB = async () => {
  const projectId = new mongoose.Types.ObjectId(PROJECT_ID)
  project = await Project.findOne({ _id: projectId })
}

/* Step 1.2: Start Process Message */
const startProcessMessage = async () => {
  await updateDeploymentStatus('Processing')
  const output1 = 'Process Started...'
  const output2 = 'Cloning repository...'
  await dbInsertLog(output1, output2)
}

/* Step 2: Clone the GIT Repository */
const cloneRepo = async () => {
  const command = `cd ${__dirname} && git clone -b ${project.branchName} ${GIT_URL} "${OUTDIR_PATH}"`
  await executeCommand(command)
}

/* Step 3.1: Move to Source Directory */
const addSourceDirectory = () => {
  OUTDIR_PATH = path.join(OUTDIR_PATH, project.sourceDirectory)
}

/* Step 3.2: Create .env file */
const createEnvFile = async () => {
  let jsonObj = JSON.parse(project.env)
  let envContent = ''
  for (let key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      envContent += `${key}=${jsonObj[key]}\n`
    }
  }
  const envFilePath = path.join(OUTDIR_PATH, '.env')
  await fs.promises.writeFile(envFilePath, envContent)
  await dbInsertLog('Successfully configured .env file', 'Installing packages...')
}

/* Step 4: Install Packages */
const installPackages = async () => {
  const command = `cd ${OUTDIR_PATH} && npm install`
  await executeCommand(command)
}

/* Step 5: Build the Project */
const buildRepo = async () => {
  const command = `cd ${OUTDIR_PATH} && ${project.buildCommand}`
  const message = 'Building project...'
  await executeCommand(command, message)
}

/* Step 6: Upload the Git Repository to S3 */
const uploadFiles = async () => {
  const s3Client = new S3Client({
    region: BUCKET_REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY
    }
  })

  await dbInsertLog('Uploading files...')
  const distFolderPath = path.join(OUTDIR_PATH, project.publishDirectory)
  const distFolderContents = fs.readdirSync(distFolderPath, {
    recursive: true
  })

  for (const file of distFolderContents) {
    const filePath = path.join(distFolderPath, file)
    if (fs.lstatSync(filePath).isDirectory()) continue

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `github/${SUB_DOMAIN}/${file}`,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath)
    })
    await s3Client.send(command)
  }
}

/* Step 7.1: Deploy Success Message */
const successMessage = async () => {
  await dbInsertLog('Successfully deployed the app !!')
  await updateDeploymentStatus('Success')
}

/* Step 7.2: Deploy Error Message */
const errorDeployMessage = async (error) => {
  await dbInsertLog(error, 'Ooops...Error deploying the app !!')
  await updateDeploymentStatus('Failed')
}

async function init() {
  try {
    await dbConnect()
  } catch (error) {
    console.log('Error connecting to MongoDB !!', error)
    return
  }
  try {
    await startProcessMessage()
    await getMetaDataFromDB()
    await cloneRepo()
    addSourceDirectory()
    await createEnvFile()
    await installPackages()
    await buildRepo()
    await uploadFiles()
    await successMessage()
  } catch (error) {
    await errorDeployMessage(error)
  } finally {
    mongoose.connection.close()
    process.exit(0)
  }
}

init()
