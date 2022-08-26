import { app } from './configs/config.js'
import { Lists } from '.keystone/types'

let listDefinition = {}
import { listDefinition as mirrorTvListDefinition } from './lists/mirror-tv'
import { listDefinition as mirrormediaListDefinition } from './lists/mirrormedia'
import { listDefinition as visionListDefinition } from './lists/vision'
import { listDefinition as meshListDefinition } from './lists/mesh'
import { listDefinition as editoolsListDefinition } from './lists/editools'
import { listDefinition as readrListDefinition } from './lists/readr'
import { listDefinition as seinsightsListDefinition } from './lists/seinsights'

switch (app.applicationName) {
  case 'seinsights':
    listDefinition = seinsightsListDefinition
    break
    
  case 'mirror-tv':
    listDefinition = mirrorTvListDefinition
    break

  case 'mirrormedia':
    listDefinition = mirrormediaListDefinition
    break

  case 'vision':
    listDefinition = visionListDefinition
    break

  case 'mesh':
    listDefinition = meshListDefinition
    break

  case 'editools':
    listDefinition = editoolsListDefinition
    break

  default:
  case 'readr':
    listDefinition = readrListDefinition
    break
}

export const lists: Lists = listDefinition
