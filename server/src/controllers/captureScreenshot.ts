import { Response, Request } from 'express'
import puppeteer from 'puppeteer'
import { errorImg } from '../assets/error-img'

const timeout = 10 // Time in Seconds
const captureScreenshot = async (req: Request, res: Response) => {
  let browser,
    errorImgAddress = errorImg
  try {
    let { url } = req.query
    browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1
    })

    if (typeof url !== 'string') {
      return res.status(200).json({
        success: false,
        message: 'Url is not String type !!'
      })
    }
    const pagePromise = page.goto(url, { waitUntil: 'networkidle2' })

    const result = await Promise.race([
      pagePromise.then(() => 'pagePromise resolved'),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Function timed out')), timeout * 1000)
      })
    ])

    if (typeof result === 'string' && result === 'pagePromise resolved') {
      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 35,
        fullPage: false
      })

      const base64String = screenshotBuffer.toString('base64')
      const pic_url = `data:image/jpeg;base64,${base64String}`
      if (browser) await browser.close()
      return res.status(200).json({
        success: true,
        data: pic_url
      })
    } else {
      if (browser) await browser.close()
      return res.status(200).json({
        success: false,
        data: errorImgAddress,
        message: 'Something went wrong !!'
      })
    }
  } catch (error) {
    if (browser) await browser.close()
    return res.status(200).json({
      success: false,
      data: errorImgAddress,
      message: 'Timed Out !!'
    })
  }
}

export { captureScreenshot }
