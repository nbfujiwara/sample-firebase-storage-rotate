import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { spawn } from 'child-process-promise'
admin.initializeApp()

exports.convertImage = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket
  const filePath = object.name
  const contentType = object.contentType

  if (!contentType || !filePath) {
    return console.error('Args is wrong.')
  }
  if (!contentType.startsWith('image/')) {
    return console.error('This is not an image.')
  }

  const fileName = path.basename(filePath)
  if (fileName.startsWith('cv_')) {
    return console.log('Already exists converted file.')
  }
  const convertedFileName = `cv_${fileName}`

  const bucket = admin.storage().bucket(fileBucket)
  const tempDownloadFilePath = path.join(os.tmpdir(), fileName)
  const tempConvertedFilePath = path.join(os.tmpdir(), convertedFileName)
  const metadata = {
    contentType
  }
  await bucket.file(filePath).download({ destination: tempDownloadFilePath })
  console.log('Image downloaded locally to', tempDownloadFilePath)
  // Generate a thumbnail using ImageMagick.
  await spawn('convert', [
    tempDownloadFilePath,
    '-auto-orient',
    '-thumbnail',
    '600x600>',
    tempConvertedFilePath
  ])
  console.log('Image converted', tempConvertedFilePath)

  const convertedFilePath = path.join(path.dirname(filePath), convertedFileName)
  await bucket.upload(tempConvertedFilePath, {
    destination: convertedFilePath,
    metadata
  })
  console.log('uploaded converted file ', convertedFilePath)

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  fs.unlinkSync(tempDownloadFilePath)
  fs.unlinkSync(tempConvertedFilePath)
})
