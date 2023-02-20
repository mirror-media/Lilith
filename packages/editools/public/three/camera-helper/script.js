// @ts-nocheck

import * as THREE from 'three'
import { CameraRig, FreeMovementControls, CameraHelper } from 'three-story-controls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'


// Parent Node
const canvasParent = document.querySelector('.canvas-parent')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Load model
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.149.0/examples/js/libs/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const queryString = window.location.search
const params = new URLSearchParams(queryString)
const modelUrl = decodeURIComponent(params.get('model_url'))

gltfLoader.load(
  // resource URL
  modelUrl,
  // called when the resource is loaded
  function (gltf) {
  //  gltf.scene.scale.set(0.025, 0.025,0.025)
    scene.add(gltf.scene)
  },
  // called while loading is progressing
  function (xhr) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function (err) {
    console.error('Error to load 3D model', err)
  }
)

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
camera.position.set(2, 2, 2)
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
