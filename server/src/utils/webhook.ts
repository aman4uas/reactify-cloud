import axios from 'axios'

const createWebhook = async (username: string, repo: string, token: string, active: boolean) => {
  const webhookUrl = process.env.WEBHOOK_URL
  const response = await axios({
    method: 'post',
    url: `https://api.github.com/repos/${username}/${repo}/hooks`,
    auth: {
      username: username,
      password: token
    },
    headers: {
      Accept: 'application/vnd.github.v3+json'
    },
    data: {
      name: 'web',
      active: active,
      events: ['push'],
      config: {
        url: webhookUrl,
        content_type: 'json',
        insecure_ssl: 0, /* 0 means secure, 1 means insecure */
        secret: process.env.WEBHOOK_SECRET
      }
    }
  })

  return response
}

const updateWebhookActiveStatus = async (token: string, username: string, repo: string, webhook_id: string, active: boolean) => {
  const response = await axios.patch(
    `https://api.github.com/repos/${username}/${repo}/hooks/${webhook_id}`,
    {
      active: active
    },
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  )
  return response
}


export { createWebhook, updateWebhookActiveStatus }