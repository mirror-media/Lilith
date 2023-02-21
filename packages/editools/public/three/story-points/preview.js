// @ts-nocheck
import axios from 'axios'
import renderStoryPoints from 'story-points-renderer'
import { loadModel } from 'gltf-loader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'


const queryString = window.location.search
const params = new URLSearchParams(queryString)
const itemId = decodeURIComponent(params.get('id'))

loadItem(itemId)
  .then((item) => {
    return Promise.all([
      loadModel(item?.model?.url),
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

async function loadItem(id) {
  const query = `
query {
  threeStoryPoint(where: {id: ${id}}) {
    id
    model {
      filename
      url
    }
    cameraRig
    captions
  }
}
`
  const axiosRes = await axios.post('/api/graphql', {
    query,
  })
  return axiosRes?.data?.data?.threeStoryPoint
}

