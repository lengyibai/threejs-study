<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as THREE from "three";
import {
  GLTFLoader,
  OrbitControls,
  RectAreaLightHelper,
  Reflector,
} from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, -8); //设置相机位置
camera.updateProjectionMatrix(); //更新相机矩阵

//初始化渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, //开启抗锯齿
});
renderer.setSize(window.innerWidth, window.innerHeight); //更新渲染器宽高
renderer.toneMapping = THREE.ACESFilmicToneMapping; //色调映射
renderer.toneMappingExposure = 0.5; //设置曝光度
renderer.shadowMap.enabled = true;

//轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0); //这是看向的位置
controls.enableDamping = true; //设置阻尼效果
controls.dampingFactor = 0.075; //设置阻尼系数

//辅助坐标系
const axes_helper = new THREE.AxesHelper(100);
scene.add(axes_helper);

//添加平行光
const light1 = new THREE.DirectionalLight(0xffffff, 1);
const light2 = new THREE.DirectionalLight(0xffffff, 1);
const light3 = new THREE.DirectionalLight(0xffffff, 1);
const light4 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(0, 5, -10);
light2.position.set(0, 5, 10);
light3.position.set(-5, 5, -10);
light4.position.set(5, 5, 10);
scene.add(light1);
scene.add(light2);
scene.add(light3);
scene.add(light4);

//创建物理材质
const a_material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("red"),
  metalness: 1, //金属度
  roughness: 0.5, //粗糙度
  clearcoat: 1, //清漆
  clearcoatRoughness: 0, //清漆粗糙度
});

const b_material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("rgb(30, 30, 30)"),
});
const c_material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("rgb(0, 0, 0)"),
  transparent: true,
  opacity: 0.5,
  metalness: 0.5,
  roughness: 0.5,
});

/** 车身材质组 */
const car_bodys: THREE.Material[] = [];

//模型加载
const gltf_loader = new GLTFLoader();
gltf_loader.load("/public/model/su7.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      if (["Object_34", "Object_47"].includes(child.name)) {
        mesh.material = b_material;
      }

      if (["Object_21", "Object_36", "Object_40", "Object_49", "Object_53"].includes(child.name)) {
        mesh.material = c_material;
      }

      if (
        ["Object_10", "Object_4", "Object_35", "Object_41", "Object_48", "Object_54"].includes(
          child.name,
        )
      ) {
        mesh.material = b_material;
      }

      if (["Object_18", "Object_32", "Object_39", "Object_45", "Object_52"].includes(child.name)) {
        mesh.material = a_material;
        car_bodys.push(mesh.material);
      }
    }
  });
});

// 创建顶部灯
const plane_mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 1.5),
  new THREE.MeshStandardMaterial({
    color: new THREE.Color("#fff"),
    emissive: new THREE.Color("#fff"),
    emissiveIntensity: 10,
    side: THREE.DoubleSide,
  }),
);
plane_mesh.rotation.x = -Math.PI / 2; // 使平面躺着
plane_mesh.position.y = 2.64;
scene.add(plane_mesh);

// 创建一个光源
const plane_light = new THREE.RectAreaLight(0xffffff, 10, 3, 1);
plane_mesh.add(plane_light);

// 创建一个灰色地面
console.log();

const planeGeometry = new THREE.PlaneGeometry(20, 20);

const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080, // 灰色
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // 使平面躺着
plane.position.y = -0.1;
scene.add(plane);

/** 车身颜色 */
const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
/** 贴膜材质 */
const materials = [
  {
    label: "磨砂",
    value: 1,
  },
  {
    label: "冰晶",
    value: 0,
  },
];

/** @description 改变车身颜色 */
const changeColor = (color: string) => {
  car_bodys.forEach((car_body) => {
    car_body.color.set(color);
  });
};

/** @description 改变车身材质 */
const changeMaterial = (v: number) => {
  car_bodys.forEach((car_body) => {
    car_body.clearcoatRoughness = v;
  });
};

const appRef = ref<HTMLElement>();

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
  <div ref="appRef" class="App">
    <!-- 车身颜色 -->
    <div class="car-colors">
      <div
        v-for="(item, index) in colors"
        :key="index"
        class="color-item"
        :style="{
          backgroundColor: item,
        }"
        @click="changeColor(item)"
      ></div>

      <!-- 车身材质 -->
      <div class="car-materials">
        <div
          v-for="(item, index) in materials"
          :key="index"
          class="material-item"
          @click="changeMaterial(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
canvas {
  width: 100%;
  height: 100%;
}

.car-colors {
  position: absolute;
  top: 50%;
  right: 16px;
  z-index: 1;
  transform: translateY(-50%);

  .color-item {
    width: 25px;
    height: 25px;
    border-radius: 5px;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}
</style>
