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

function removeImage(imageObj) {
  Object.keys(imageObj).forEach(file => {
    const filePath = path.resolve(file)
    if (fs.existsSync(filePath)) {
      fse.removeSync(filePath)
    }
  })
}



async function replaceMarkdown(imageObj) {
  const keys = Object.keys(imageObj)
  for (const file of keys) {
    const match = file.match(/^docs\/pages\/([^\/]+)\/images\/.+$/)
    if (match && match.length > 1) {
      const dir = match[1]
      await replaceSingleMarkdown({
        file,
        dir,
        url: imageObj[file],
      })
    }
  }
}

async function replaceSingleMarkdown(params) {
  return new Promise((resolve, reject) => {
    glob(`docs/pages/${params.dir}/*.md`, {
      nodir: true,
    }, function(err, files) {
      if (err) {
        reject(err)
      } else {
        for (const file of files) {
          const dir = path.resolve(file)
          const image = path.basename(params.file)
          const url = params.url
          let content = fs.readFileSync(dir).toString()
          const reg = new RegExp('!\\[.*\\]\\([^)]*' + image + '\\)', 'g')
          const result = reg.exec(content)
          if (result && result.length > 0) {
            content = content.replace(reg, '![](' + url + ')')
            fs.writeFileSync(dir, content)
          }
        }
        resolve(files)
      }
    });
  });
}