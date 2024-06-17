const mongoose = require('mongoose')

// Project Model
const ProjectSchema = new mongoose.Schema({
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

const Project = mongoose.model('Project', ProjectSchema)

// Deployment Model
const Status = {
  Processing: 'Processing',
  Queued: 'Queued',
  Failed: 'Failed',
  Success: 'Success'
}

const DeploymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Queued
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const Deployment = mongoose.model('Deployment', DeploymentSchema)

// Log Model
const LogSchema = new mongoose.Schema({
  deploymentId: {
    type: mongoose.Schema.Types.ObjectId,
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

const Log = mongoose.model('Log', LogSchema)

module.exports = {
  Deployment,
  Log,
  Project
}
