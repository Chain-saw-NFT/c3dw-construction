import './style/main.css'
import * as THREE from 'three'
//import * as dat from 'dat.gui'
import { gsap }from "gsap"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { ObjectControls } from './vendor/ObjectControls';
//const gui = new dat.GUI()
var controls;
var camera, bg_camera, scene, renderer, mixer, clock, sound, objectControls;
var gimbal = new THREE.Group();
var sprites = [];
var firstPlay = false;
var rotateTip = new THREE.SpriteMaterial({ transparent: true, color: 'white', sizeAttenuation: false, depthTest: false, depthTest: false, opacity: 0 })

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

var element = document.getElementById("three");
var playButton = document.getElementById("playButton");
playButton.src = 'icons/play.svg'

element.onclick = function (event) {
  if (!firstPlay) {
    sound.play();
    playButton.src = 'icons/pause.svg'
    firstPlay = true;
  }
}

playButton.onclick = function (event) {
  if (!firstPlay) {
    sound.play();
    playButton.src = 'icons/pause.svg'
    firstPlay = true;
  }
  else {
    if (sound.isPlaying) {
      sound.pause();
      playButton.src = 'icons/play.svg'
    } else {
      sound.play();
      playButton.src = 'icons/pause.svg'
    }
  }
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(window.devicePixelRatio)
})

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
        gimbal.rotation.set(0, -6.29 * 2, 0);
        scene.add(gimbal);
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

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
            sprite.up = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
            sprite.frustumCulled = false;
            sprites.push(sprite)
            scene.add(sprite)
          },
          function (err) {
            console.error('Image load error: ' + err);
          }
        );
      }
      texloader.load(
        `icons/rotate.png`,
        function (texture) {
          texture.encoding = THREE.sRGBEncoding
          rotateTip.map = texture;
          const tempSprite = new THREE.Sprite(rotateTip)
          tempSprite.scale.set(0.2, 0.2, 1)
          tempSprite.position.z = -400
          scene.add(tempSprite)
          /*var cam = gui.addFolder('Camera');
          cam.add(rotateTip.position, 'z', -1000, 900).listen()
          cam.open();*/
        })
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
  controls.minDistance = 2;
  controls.maxDistance = isMobile()? 50:28 //28 for desktop
  controls.target.set(0, 32, 0);
  controls.update();

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-10, 30, -3);
  directionalLight.target.position.set(0, 0, 0);
  scene.add(directionalLight);
  objectControls = new ObjectControls(camera, renderer.domElement, gimbal);
  objectControls.disableZoom();
  objectControls.enableHorizontalRotation();
  objectControls.setRotationSpeed(0.04);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('audio/portraits.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    //sound.play();
  });
}


function animate() {
  requestAnimationFrame(animate);
  var delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (clock.elapsedTime < 1) {
    gsap.to(rotateTip, {delay: 1.5,duration: 2, opacity: 1 , ease:"power.in"});
    gsap.to(gimbal.rotation, { y: 0 });
  }else if(clock.elapsedTime > 3){
    gsap.to(rotateTip, {duration: 1, opacity: 0 , ease:"power2.out"});
  }
  if(!objectControls.isUserInteractionActive() && clock.elapsedTime > 1){
   gimbal.rotation.y += 0.001;
  }

  sprites.forEach((sprite) => {
    sprite.translateOnAxis(sprite.up, 0.2)
    if (sprite.position.x > 500 || sprite.position.x < -500 || sprite.position.y > 440 || sprite.position.y < -440) {
      sprite.position.set((Math.random() * 800) - 400, (Math.random() * 380) - 190, -470 - (Math.random() * 100))
      sprite.up = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
    }
  })

  controls.update()
  renderer.render(scene, camera);
}
