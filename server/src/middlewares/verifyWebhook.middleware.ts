import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'

const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET!)
      .update(JSON.stringify(req.body))
      .digest('hex')
  
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii')
    const signatureHeader = req.headers['x-hub-signature-256'] as string | undefined
  
    if (!signatureHeader) {
      return res.status(404).json({
        suceess: false,
        message: 'x-hub-signature-256 header is missing'
      })
    }
    let untrusted = Buffer.from(signatureHeader, 'ascii')
    const result = crypto.timingSafeEqual(trusted, untrusted)
    if (result === false) {
      return res.status(401).json({
        success: false,
        message: 'Signature of the webhook does not match'
      })
    }
  
    const payload = req.body
    const ref = payload.ref
  
    const branch = ref.replace('refs/heads/', '')
    const repo = payload.repository.name
    const username = payload.repository.owner.name
    const eventType = req.headers['x-github-event']
  
    const webhook = {
      branch,
      repo,
      username,
      event: eventType
    }
  
    req.webhook = webhook
    next()
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      success: false,
      message: "Something went wrong (in Verifying webhook)!!",
      error: error
    })
  }
}

export { verifyWebhook }
