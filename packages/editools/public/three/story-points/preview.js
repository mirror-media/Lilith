// @ts-nocheck
import renderStoryPoints from 'story-points-renderer'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { loadGltfModel, loadThreeStoryPointItem } from 'utils'

const queryString = window.location.search
const params = new URLSearchParams(queryString)
const itemId = decodeURIComponent(params.get('id'))

loadThreeStoryPointItem(itemId)
  .then((item) => {
    return Promise.all([
      loadGltfModel(item?.model?.url),
      item?.cameraRig,
      item?.captions || [],
    ])
  })
  .then(result => {
    const [ model, cameraRig, captions ] = result
    renderStoryPoints(model.scene, cameraRig, captions)
  })
  .catch(err => {
    console.error(err)
  })

