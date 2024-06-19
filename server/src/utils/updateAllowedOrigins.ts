import axios from 'axios'

const updateAllowedOrigins = async (allowedOrigins: string[]) => {
  try {
    const response = await axios.get('https://api.github.com/meta')
    const githubDomains = [...response.data.hooks, ...response.data.web]
    allowedOrigins.push(...githubDomains)
  } catch (error) {
    console.log("Error updating GitHub IPs", error)
  }
}

export { updateAllowedOrigins }
