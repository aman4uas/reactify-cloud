import express from 'express'
import httpProxy from 'http-proxy'
import dotenv from 'dotenv'
import cors from 'cors'
import { Project } from './models'
import NodeCache from 'node-cache'
import connectDB from './db/dbConnect'
dotenv.config()

const app = express()
const proxy = httpProxy.createProxy()
const cache = new NodeCache({ stdTTL: 300, checkperiod: 350 })

const BUCKET_BASE_URL = process.env.BUCKET_BASE_URL

app.use(
  cors({
    origin: '*'
  })
)

app.use(async (req, res) => {
  const hostname = req.hostname
  const customDomain = hostname.split('.')[0]
  let subdomain = cache.get(customDomain)
  if (subdomain == undefined) {
    const project = await Project.findOne({ customDomain })
    if (!project) {
      return res.send(
        `<html>
            <head>
              <title>404 Page Not Found</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  text-align: center;
                  margin: 0;
                  padding: 0;
                  background-color: #333;
                  color: #ff4d4d; /* Red text color */
                }
                h1 {
                  font-size: 60px;
                  margin-top: 100px;
                }
                h3 {
                  font-size: 24px;
                }
              </style>
            </head>
            <body>
              <h1>404</h1>
              <h3>Oops! The page you are looking for does not exist.</h3>
            </body>
          </html>`
      )
    }

    subdomain = project.subDomain
    cache.set(customDomain, subdomain)
  }

  let resolvesTo = `${BUCKET_BASE_URL}/${subdomain}`
  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true })
})

proxy.on('proxyReq', (proxyReq, req, res) => {
  const url = req.url
  if (url === '/') proxyReq.path += 'index.html'
})

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
      console.log(`Reverse Proxy is running on port: ${PORT}`)
    })
  })
  .catch((error) => {
    console.log('MongoDB connection failed !! ', error)
    process.exit(1)
  })
