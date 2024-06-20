import axios from 'axios'

const updateAllowedOrigins = async (allowedOrigins: string[]) => {
  try {
    const response = await axios.get('https://api.github.com/meta')
    const githubIPs = [...response.data.hooks, ...response.data.web]
    const githubDomains = []
    const length = githubIPs.length
    for (let i = 0; i < length; i++) {
      const httpDomain = `http://${githubIPs[i]}`
      const httpsDomain = `https://${githubIPs[i]}`
      githubDomains.push(httpDomain)
      githubDomains.push(httpsDomain)
    }
    allowedOrigins.push(...githubDomains)
  } catch (error) {
    console.log('Error updating GitHub IPs', error)
  }
}

export { updateAllowedOrigins }
