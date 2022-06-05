import './style/main.css'
import * as THREE from 'three'
//import * as dat from 'dat.gui'
import gsap from "gsap"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
//const gui = new dat.GUI()
var controls;
var camera, bg_camera, scene, renderer, mixer, clock;
var gimbal = new THREE.Group();

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
  renderer.setPixelRatio(window.devicePixelRatio)
})

init();
animate();


function init() {
  const canvas = document.querySelector('canvas.webgl')
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 2000);
  camera.position.set(0, 40, 100);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  bg_camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 2000);
  bg_camera.position.set(0, 40, 100);

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('https://threejs.org/examples/textures/equirectangular/')
    .load('venice_sunset_1k.hdr', function (texture) {

      var envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.background = null;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose();

      var loader = new GLTFLoader();
      loader.load("c3dw.glb", function (gltf) {
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        gltf.scene.rotateY(Math.PI * -0.5);
        gltf.scene.position.set(3.2, -4, -144);
        gimbal.add(gltf.scene);
        gimbal.rotation.set(0, -6.29, 0);
        scene.add(gimbal);
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
        /*var cam = gui.addFolder('Camera');
        cam.add(gimbal.rotation, 'x', 0, 2*Math.PI).listen()
        cam.add(gimbal.rotation, 'y', -2*Math.PI, 2*Math.PI).listen()
        cam.add(gimbal.rotation, 'z', 0, 2*Math.PI).listen()
        cam.open();*/
      });
      ///Load Floating Images
      const texloader = new THREE.TextureLoader();
      for (let i = 1; i < 25; i++) {
        texloader.load(
          `textures/${i}.png`,
          function (texture) {
            texture.encoding = THREE.sRGBEncoding
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              sizeAttenuation: false,
            });
            const sprite = new THREE.Sprite(material)
            sprite.scale.set(0.2, 0.2, 1)
            sprite.position.set((Math.random() * 800) - 400, (Math.random() * 380) - 190, -470 - (Math.random() * 100))
            sprite.rotateZ(Math.PI * Math.random())
            scene.add(sprite)
          },
          function (err) {
            console.error('Image load error: '+err);
          }
        );
      }

    });

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.outputEncoding = THREE.sRGBEncoding;
  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  controls = new OrbitControls(camera, canvas);
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  //controls.autoRotate = true
  //controls.autoRotateSpeed = 1//0.15;
  controls.minDistance = 2;
  controls.maxDistance = 28;
  controls.target.set(0, 32, 0);
  controls.update();

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-10, 30, -3);
  directionalLight.target.position.set(0, 0, 0);
  scene.add(directionalLight);
}

function animate() {

  requestAnimationFrame(animate);
  var delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  gsap.to(gimbal.rotation, { y: 0 });

  controls.update()
  renderer.render(scene, camera);
}
