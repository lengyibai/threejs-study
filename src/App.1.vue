<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { onMounted, ref } from "vue";

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera(
  75, //视角
  window.innerWidth / window.innerHeight, //宽高比
  0.1, //近裁剪面
  1000, //远裁剪面
);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

//创建一个立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
//创建材质
const parent_material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const children_material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//创建网格
const parent = new THREE.Mesh(geometry, parent_material);
parent_material.wireframe = true;

//创建网格
const children = new THREE.Mesh(geometry, children_material);
parent.add(children);
//将网格添加进场景中
scene.add(parent);

//设置相机位置
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 5;
//相机看向哪里
camera.lookAt(0, 0, 0);

//添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(100);
//添加到场景
scene.add(axesHelper);

//添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
//设置阻尼效果
controls.enableDamping = true;
//设置阻尼系数
controls.dampingFactor = 0.05;

//渲染场景和相机
renderer.render(scene, camera);

//自适应窗口大小
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight); //更新渲染器宽高
  camera.aspect = window.innerWidth / window.innerHeight; //更新相机宽高比
  camera.updateProjectionMatrix(); //更新相机矩阵
});

const event_obj = {
  hello() {
    alert("6");
  },
  world() {
    alert("7");
  },
};

//创建GUI
const gui = new GUI();
gui.add(event_obj, "hello").name("你好");
gui.add(event_obj, "world").name("世界");
const folder = gui.addFolder("立方体坐标");
folder.add(children.position, "x").min(-5).max(5).name("调整X").step(0.1);
folder.add(children.position, "y").min(-5).max(5).name("调整Y").step(0.1);
folder.add(children.position, "z").min(-5).max(5).name("调整Z").step(0.1);
folder.add(children.scale, "x").min(-5).max(5).name("大小X").step(0.1);
folder.add(children.scale, "y").min(-5).max(5).name("大小Y").step(0.1);
folder.add(children.scale, "z").min(-5).max(5).name("大小Z").step(0.1);
gui.add(parent_material, "wireframe").name("父元素边框模式");

const colors = {
  cubeColor: "#00ff00",
};
gui.addColor(colors, "cubeColor").onChange((value) => {
  children_material.color.set(value);
});

//调用渲染函数
function animate() {
  controls.update();
  children.rotation.x += 0.01;
  children.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const appRef = ref<HTMLElement>();

onMounted(() => {
  appRef.value!.appendChild(renderer.domElement);
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
