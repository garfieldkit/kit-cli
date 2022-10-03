'use strict'
const fs = require('fs')

async function replace(params) {
  try {
    const imageDirs = await lookAtImages()
    const imageObj = await uploadAllImagesToOSS(imageDirs, params)
    await replaceMarkdown(imageObj)
    await removeImage(imageObj)
  } catch (e) {
    if (process.env.LOG_LEVEL === 'verbose') {
      console.error(e)
    } else {
      log.error(e.message)
    }
  }
}
