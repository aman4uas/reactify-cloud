import { Router } from 'express'
import {
  callback,
  githubAuth,
  logout,
  repoData,
  userData,
  branchData,
  deployApp,
  getAllUserSites,
  getSiteDeployments,
  getDeploymentLogs,
  getSiteDetail,
  getDeploymentDetail,
  updateWebhookStatus,
  autoDeploySite,
  updateCustomDomain,
  updateSiteConfiguration,
  captureScreenshot
} from '../controllers'

import { auth, verifyWebhook } from '../middlewares'

const router = Router()

router.get('/github/auth', githubAuth)
router.get('/github/auth/callback', callback)

router.get('/user/logout', auth, logout)
router.get('/github/repos', auth, repoData)
router.get('/github/user', auth, userData)
router.get('/github/branches/:id', auth, branchData)
router.post('/deploy/app', auth, deployApp)
router.get('/deploy/sites', auth, getAllUserSites)
router.get('/deploy/site/:id', auth, getSiteDetail)
router.post('/deploy/site/deployments', auth, getSiteDeployments)
router.get('/deploy/site/deployment/:id', auth, getDeploymentDetail)
router.post('/deploy/site/deployment/logs', auth, getDeploymentLogs)
router.post('/site/update/customDomain', auth, updateCustomDomain)
router.post('/site/update/configuration', auth, updateSiteConfiguration)
router.post('/github/update/webhook', auth, updateWebhookStatus) // This is unused !!
router.post('/github/webhook/autodeploy', verifyWebhook, autoDeploySite)
router.get('/capture-screenshot', captureScreenshot)

export default router