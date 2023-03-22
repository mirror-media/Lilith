// @ts-nocheck

import * as THREE from 'three'
import { CameraRig, FreeMovementControls, CameraHelper } from 'three-story-controls'
import { loadGltfModel, loadThreeStoryPointItem } from 'utils'

// Parent Node
const canvasParent = document.querySelector('.canvas-parent')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const queryString = window.location.search
const params = new URLSearchParams(queryString)
const itemId = decodeURIComponent(params.get('three-story-point-id'))

loadThreeStoryPointItem(itemId)
  .then((item) => {
    return loadGltfModel(item?.model?.url)
  })
  .then(model => {
    scene.add(model.scene)
  })
  .catch(err => {
    console.error(err)
  })

/**
 * Lights
 */
const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
scene.add(light)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Grid
 */
const grid = new THREE.GridHelper(100, 50)
grid.position.set(0, -5, 0)
scene.add(grid)

/**
 *  Camera helper
 */
const rig = new CameraRig(camera, scene)
const controls = new FreeMovementControls(rig, {
  domElement: canvasParent,
  keyboardScaleFactor: 0.05,
  wheelScaleFactor: 0.01,
})
controls.enable()

const cameraHelper = new CameraHelper(rig, controls, renderer.domElement)

/**
 *  Event listeners
 */
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const tick = (time) =>
{
  // Update controls
  controls.update(time)

  // Render
  renderer.render(scene, camera)

  // Camera helper
  cameraHelper.update(time)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
