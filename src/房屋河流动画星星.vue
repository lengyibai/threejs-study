<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as THREE from "three";
import {
  DRACOLoader,
  GLTFLoader,
  OrbitControls,
  RGBELoader,
  Water2,
} from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { gsap } from "gsap";

//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-3.23, 2.98, 4.06); //设置相机位置
camera.updateProjectionMatrix(); //更新相机矩阵

//初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // antialias: true, //开启抗锯齿
});
renderer.setSize(window.innerWidth, window.innerHeight); //更新渲染器宽高
renderer.toneMapping = THREE.ACESFilmicToneMapping; //色调映射
renderer.toneMappingExposure = 0.5; //设置曝光度
renderer.shadowMap.enabled = true;

//轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-8, 2, 0); //这是看向的位置
controls.enableDamping = true; //设置阻尼效果
controls.dampingFactor = 0.05; //设置阻尼系数

//辅助坐标系
const axes_helper = new THREE.AxesHelper(100);
scene.add(axes_helper);

//添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 5);
scene.add(light);

//模型加载
const gltf_loader = new GLTFLoader();
const draco_loader = new DRACOLoader();
draco_loader.setDecoderPath("/node_modules/three/examples/jsm/libs/draco/");
gltf_loader.setDRACOLoader(draco_loader);
gltf_loader.load("/public/model/scene.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.traverse((child) => {
    if (child.name === "Plane") {
      child.visible = false;
    }

    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
});

//加载HDR环境纹理
const rgb_loader = new RGBELoader();
rgb_loader.load("/public/textures/sky.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping; //设置球形映射
  scene.background = texture;
  scene.environment = texture;
});

//创建水面
const water_geometry = new THREE.CircleGeometry(300, 32);
const water = new Water2(water_geometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 100,
}).rotateX(-Math.PI / 2);
water.position.y = -0.5;
scene.add(water);

//创建房间内光源
const point_light = new THREE.PointLight(0xffffff, 50);
point_light.position.set(0.1, 2.4, 0);
point_light.castShadow = true;
scene.add(point_light);

//创建点光源组
const point_light_group = new THREE.Group();
const point_light_arr: THREE.Mesh<
  THREE.SphereGeometry,
  THREE.MeshBasicMaterial,
  THREE.Object3DEventMap
>[] = [];
point_light_group.position.set(-8, 2.5, -1.5); //将光源组移动到圣诞树
const radius = 3; //球半径
for (let i = 0; i < 3; i++) {
  //创建球体当灯泡
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    }),
  );

  //设置球体位置
  sphere.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),
    Math.cos((i * 2 * Math.PI) / 3),
    radius * Math.sin((i * 2 * Math.PI) / 3),
  );

  point_light_arr.push(sphere);

  //创建球体的光源
  const point_light = new THREE.PointLight(0xffffff, 100);
  sphere.add(point_light);
  point_light_group.add(sphere);
}
scene.add(point_light_group);
scene.add(point_light_group);

//设置补间动画
const options = {
  angle: 0,
};

gsap.to(options, {
  angle: Math.PI * 2,
  duration: 5,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    point_light_group.rotation.y = options.angle;
    point_light_arr.forEach((item, index) => {
      item.position.set(
        radius * Math.cos((index * 2 * Math.PI) / 3),
        Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
        radius * Math.sin((index * 2 * Math.PI) / 3),
      );
    });
  },
});

//切换多个相机场景
const scenes = [
  {
    text: "圣诞快乐",
    callback: () => {
      // 执行函数切换位置
      translateCamera(new THREE.Vector3(-3.23, 3, 4.06), new THREE.Vector3(-8, 2, 0));
    },
  },
  {
    text: "感谢在这么大的世界里遇见了你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    },
  },
  {
    text: "愿与你探寻世界的每一个角落",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0));
    },
  },
  {
    text: "愿将天上的星星送给你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
      createHeartAnimate();
    },
  },
  {
    text: "愿疫情结束，大家健康快乐！",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(-20, 1.3, 6.6), new THREE.Vector3(5, 2, 0));
    },
  },
];

const appRef = ref<HTMLElement>();

const text_index = ref(0);
let isAnimate = false;

// 使用补间动画移动相机
const timeLine1 = gsap.timeline();
const timeline2 = gsap.timeline();
// 定义相机移动函数
const translateCamera = (position: THREE.Vector3, target: THREE.Vector3) => {
  //设置相机位置
  timeLine1.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: "power2.inOut",
  });

  //设置控制器聚焦位置
  timeline2.to(controls.target, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: 1,
    ease: "power2.inOut",
  });
};

//创建100个星星
const starsInstance = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10,
  }),
  100,
);

//将星星随机分布在天空中
const star_start_positions: THREE.Vector3[] = []; //星星开始位置
const star_end_positions: THREE.Vector3[] = []; //星星结束位置
for (let i = 0; i < 100; i++) {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 10 + 15;
  const z = Math.random() * 100 - 50;
  star_start_positions.push(new THREE.Vector3(x, y, z));

  //创建星星矩阵，排列星星
  const matrix = new THREE.Matrix4();
  matrix.setPosition(x, y, z);
  starsInstance.setMatrixAt(i, matrix);
}
scene.add(starsInstance);

//创建爱心路径
const heartShape = new THREE.Shape();
heartShape.moveTo(25, -25);
heartShape.bezierCurveTo(25, -25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, -35, -30, -35);
heartShape.bezierCurveTo(-30, -55, -10, -77, 25, -95);
heartShape.bezierCurveTo(60, -77, 80, -55, 80, -35);
heartShape.bezierCurveTo(80, -35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, -25, 25, -25);

// 根据爱心路径获取点
const center = new THREE.Vector3(0, 10, 10); //设置爱心中心位置
for (let i = 0; i < 100; i++) {
  const point = heartShape.getPoint(i / 100);
  star_end_positions.push(
    new THREE.Vector3(point.x * 0.1 + center.x, point.y * 0.1 + center.y, center.z),
  );
}

// 创建爱心动画
function createHeartAnimate() {
  const params = {
    time: 0,
  };

  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        const x =
          star_start_positions[i].x +
          (star_end_positions[i].x - star_start_positions[i].x) * params.time;
        const y =
          star_start_positions[i].y +
          (star_end_positions[i].y - star_start_positions[i].y) * params.time;
        const z =
          star_start_positions[i].z +
          (star_end_positions[i].z - star_start_positions[i].z) * params.time;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        starsInstance.setMatrixAt(i, matrix);
      }
      starsInstance.instanceMatrix.needsUpdate = true;
    },
  });
}

//还原位置
function restoreHeart() {
  const params = {
    time: 0,
  };

  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        const x =
          star_end_positions[i].x +
          (star_start_positions[i].x - star_end_positions[i].x) * params.time;
        const y =
          star_end_positions[i].y +
          (star_start_positions[i].y - star_end_positions[i].y) * params.time;
        const z =
          star_end_positions[i].z +
          (star_start_positions[i].z - star_end_positions[i].z) * params.time;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        starsInstance.setMatrixAt(i, matrix);
      }
      starsInstance.instanceMatrix.needsUpdate = true;
    },
  });
}

// 监听鼠标滚轮事件
window.addEventListener(
  "wheel",
  (e) => {
    if (isAnimate) return;
    isAnimate = true;
    if (e.deltaY > 0) {
      text_index.value++;
      if (text_index.value > scenes.length - 1) {
        text_index.value = 0;
        restoreHeart();
      }
    }
    scenes[text_index.value].callback();
    setTimeout(() => {
      isAnimate = false;
    }, 1000);
  },
  false,
);

onMounted(() => {
  appRef.value?.appendChild(renderer.domElement);
});

//实时渲染图形
const rendering = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(rendering);
};
rendering();

//自适应窗口大小
window.addEventListener("resize", () => {
  camera.updateProjectionMatrix(); //更新相机矩阵
  camera.aspect = window.innerWidth / window.innerHeight; //更新相机宽高比
  renderer.setSize(window.innerWidth, window.innerHeight); //更新渲染器宽高
});
</script>

<template>
  <div ref="appRef" class="App"></div>
</template>

<style scoped lang="less">
canvas {
  width: 100%;
  height: 100%;
}
</style>
