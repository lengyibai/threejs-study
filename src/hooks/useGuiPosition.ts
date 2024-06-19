import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export const generateTool = (camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
  const gui = new GUI();

  const cameraFolder = gui.addFolder("Camera Position");
  cameraFolder.add(camera.position, "x", -20, 20);
  cameraFolder.add(camera.position, "y", -20, 20);
  cameraFolder.add(camera.position, "z", -20, 20);
  cameraFolder.add(camera, "fov", 10, 100).onChange(() => {
    camera.updateProjectionMatrix();
  });
  cameraFolder.open();

  const controlsFolder = gui.addFolder("Controls Target");
  controlsFolder.add(controls.target, "x", -20, 20).onChange(() => {
    controls.update();
  });
  controlsFolder.add(controls.target, "y", -20, 20).onChange(() => {
    controls.update();
  });
  controlsFolder.add(controls.target, "z", -20, 20).onChange(() => {
    controls.update();
  });
  controlsFolder.open();
};
