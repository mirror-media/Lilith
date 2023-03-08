// @ts-nocheck
import axios from 'axios'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

/**
 * Load model
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.149.0/examples/jsm/libs/draco/')
const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

export function loadGltfModel(modelUrl) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      // resource URL
      modelUrl,
      // called when the resource is loaded
      function (gltf) {
        return resolve(gltf)
      },
      // called while loading is progressing
      function (xhr) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function (err) {
        console.error('Error to load 3D model', err)
        reject(err)
      }
    )
  })
}

export async function loadThreeStoryPointItem(id) {
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

