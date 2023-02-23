// @ts-nocheck
import * as THREE from 'three'
import { CameraRig, StoryPointsControls } from 'three-story-controls'

export default function renderStoryPoints(model, cameraRig, captions) {
  // Parent Node
  const canvasParent = document.querySelector('.canvas-parent')

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Create POIs with data exported from the CameraHelper tool
  // (see here for more: https://nytimes.github.io/three-story-controls/#camera-helper)
  // Note: Any method of listing camera position and quaternion will work for StoryPointControls
  const pois = cameraRig?.pois?.map((poi, i) => {
    return {
      position: new THREE.Vector3(...poi.position),
      quaternion: new THREE.Quaternion(...poi.quaternion),
      duration: poi.duration,
      ease: 'power1.in',
    }
  })

  // Scene
  const scene = new THREE.Scene()

  // Add model
  scene.add(model)

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
   * Lights
   */
  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  /**
   *  Controls
   */
  // Initialize StoryPointControls with poi data
  const rig = new CameraRig(camera, scene)
  const controls = new StoryPointsControls(rig, pois)
  const captionElement = document.querySelector('.caption')
  document.querySelector('.next').addEventListener('click', () => {
    controls.nextPOI()
  })
  document.querySelector('.prev').addEventListener('click', () => controls.prevPOI())
  // Update captions when the POI changes
  controls.addEventListener('update', (e) => {
    if (e.progress === 0) {
      captionElement.classList.remove('visible')
    } else if (e.progress === 1 && typeof captions[e.upcomingIndex] === 'string') {
      captionElement.classList.add('visible')
      captionElement.innerHTML = `
      <p><span> ${e.upcomingIndex + 1}/${captions.length} </span> ${captions[e.upcomingIndex]}</p>
      `
    }
  })
  captionElement.addEventListener('click', () => captionElement.classList.toggle('hidden'))
  controls.enable()
  controls.goToPOI(0)

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

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()
}
