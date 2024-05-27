import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'
import { DB_NAME } from '../constants'

const ecsClient = new ECSClient({
  region: process.env.CLUSTER_REGION,
  credentials: {
    accessKeyId: process.env.CLUSTER_ACCESS_KEY!,
    secretAccessKey: process.env.CLUSTER_SECRET_ACCESS_KEY!
  }
})

async function runECSTask(arrEnv: Array<Object>) {
  const arrConfig = [
    { name: 'BUCKET_NAME', value: process.env.BUCKET_NAME },
    { name: 'BUCKET_REGION', value: process.env.BUCKET_REGION },
    { name: 'ACCESS_KEY', value: process.env.BUCKET_ACCESS_KEY },
    { name: 'SECRET_ACCESS_KEY', value: process.env.BUCKET_SECRET_ACCESS_KEY },
    { name: 'MONGO_URI', value: process.env.MONGO_URI },
    { name: 'DB_NAME', value: DB_NAME }
  ]

  const arr = [...arrConfig, ...arrEnv]

  const command = new RunTaskCommand({
    cluster: process.env.CLUSTER_ID,
    taskDefinition: process.env.CLUSTER_TASK_ID,
    launchType: 'FARGATE',
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: 'ENABLED',
        subnets: [
          process.env.CLUSTER_SUBNET_1!,
          process.env.CLUSTER_SUBNET_2!,
          process.env.CLUSTER_SUBNET_3!
        ],
        securityGroups: [process.env.CLUSTER_SECURITY_GROUP!]
      }
    },
    overrides: {
      containerOverrides: [
        {
          name: process.env.CLUSTER_IMAGE_NAME,
          environment: arr
        }
      ]
    }
  })

  await ecsClient.send(command)
}

export { runECSTask }
