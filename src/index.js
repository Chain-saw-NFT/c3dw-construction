import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import { Vector3 } from 'three'
//const gui = new dat.GUI()


const canvas = document.querySelector('canvas.webgl')


const scene = new THREE.Scene()
scene.background = null;
const geometry = new THREE.IcosahedronGeometry(20, 1)
const material = new THREE.MeshNormalMaterial()


material.wireframe = false
// Create Mesh & Add To Scene
const mesh = new THREE.Mesh(geometry, material)
//scene.add(mesh)



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  5000
)
camera.position.x = 0
camera.position.y = 25 
camera.position.z = 20
scene.add(camera)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.2;
controls.enableZoom = false
controls.enablePan = false
controls.dampingFactor = 0.05
controls.maxDistance = 1000
controls.minDistance = 30
controls.target = new THREE.Vector3(0,25,0);
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
}
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  logarithmicDepthBuffer: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  var loader = new GLTFLoader();
  const loadModel = new Promise((resolve) => {
      loader.load("c3dw.glb", (gltf) => {
          const tempModel = gltf.scene;
          gltf.scene.traverse( function ( obj ) {
            if(obj.isMesh || obj.isSkinnedMesh){
              obj.material.roughness = 0.4;
              if(obj.name === 'Mesh_0') obj.material.side = 0; obj.material.transparent = true;
            }
          });
          const whitePlane = new THREE.Mesh( new THREE.PlaneGeometry( 2, 1 ), new THREE.MeshBasicMaterial( {color: 0x000000} ) );
          whitePlane.rotateY(Math.PI*0.5);
          whitePlane.position.set(0.5,25.1,0.2);
          tempModel.add(whitePlane);
          tempModel.rotateY(Math.PI*-0.5);
          tempModel.scale.set(1.3,1.3,1.3);
          scene.add(tempModel);
          resolve(tempModel);
      });
  });
  loadModel;

  const light = new THREE.AmbientLight( 0x404040 );
  light.intensity = 2.9;
  scene.add( light );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
  directionalLight.position.set(-10,30,-3);
  directionalLight.target.position.set( -10,0,3 );
  scene.add( directionalLight );
/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  //mesh.rotation.y += 0.01 * Math.sin(1)
  //mesh.rotation.y += 0.01 * Math.sin(1)
  //mesh.rotation.z += 0.01 * Math.sin(1)

  // Update controls
  controls.update()
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
