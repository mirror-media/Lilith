import { liveblogQuery } from './queries/liveblogQuery'
import appConfig from '../config'


import fs from 'fs'

const filePath = appConfig.liveblogFiles.storagePath

export const saveLiveblogJSON = async (liveblogId, context) => {
  const liveblog = await context.query.Liveblog.findOne({
    where: { id: liveblogId },
    query: liveblogQuery,
  })

  if (liveblog) {
    if (!liveblog.active) {
      // do nothing to inactive liveblog
      return
    }
    const liveblogString = JSON.stringify(liveblog)
    const fileName = `${liveblog.slug}.json`

    console.log(
      JSON.stringify({
        severity: 'DEBUG',
        message: `About to write liveblog: ${fileName} in path: ${filePath} with content: ${liveblogString}} `,
      })
    )

    try {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath)
        console.log(
          JSON.stringify({
            severity: 'DEBUG',
            message: `FilePath: ${filePath} not exist, mkdir it`,
          })
        )
      }
    } catch (error) {
      console.log(JSON.stringify({ severity: 'ERROR', message: error.stack }))
    }

    const fullFillPath = filePath + fileName
    fs.writeFile(fullFillPath, liveblogString, (error) => {
      if (error) {
        console.log(JSON.stringify({ severity: 'ERROR', message: error.stack }))
      } else {
        console.log(
          JSON.stringify({
            severity: 'DEBUG',
            message: `Successfully write liveblog: ${fileName} in the path: ${fullFillPath}`,
          })
        )
      }
    })
  } else {
    console.log(
      JSON.stringify({
        severity: 'ERROR',
        message: new Error(
          `Liveblog not found with id ${liveblogId}, something went wrong`
        ),
      })
    )
  }
}

export const deleteLiveblogJSON = async (liveblogSlug) => {
  const fullFilePath = filePath + `${liveblogSlug}.json`
  console.log(
    JSON.stringify({
      severity: 'DEBUG',
      message: `About to delete liveblog ${liveblogSlug}.json in path: ${fullFilePath}`,
    })
  )

  fs.unlink(fullFilePath, (error) => {
    if (error) {
      console.log(JSON.stringify({ severity: 'ERROR', message: error.stack }))
    } else {
      console.log(
        JSON.stringify({
          severity: 'DEBUG',
          message: `Successfully delete ${liveblogSlug}.json in path ${fullFilePath}`,
        })
      )
    }
  })
}
