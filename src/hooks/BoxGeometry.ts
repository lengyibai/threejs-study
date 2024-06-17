import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeType {
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
  material: THREE.MeshBasicMaterial;
  axesHelper: THREE.AxesHelper;
}

export class BoxGeometry {
  renderer!: ThreeType["renderer"];
  private cube!: ThreeType["cube"];
  private scene!: ThreeType["scene"];
  private camera!: ThreeType["camera"];
  private controls!: ThreeType["controls"];
  private material!: ThreeType["material"];
  private axesHelper!: THREE.AxesHelper;
  constructor() {
    this.setLayout();
    this.createCube();
    this.renderListener();
    this.createToolbar();
  }

  /** @description 布置场景 */
  private setLayout() {
    //创建场景
    this.scene = new THREE.Scene();
    //创建相机
    this.camera = new THREE.PerspectiveCamera(
      75, //视角
      window.innerWidth / window.innerHeight, //宽高比
      0.1, //近裁剪面
      1000, //远裁剪面
    );
    //创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    //添加轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //添加世界坐标辅助器
    this.axesHelper = new THREE.AxesHelper(100);

    //设置画布大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //设置相机位置
    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = 5;
    //相机看向哪里
    this.camera.lookAt(0, 0, 0);

    //设置阻尼效果
    this.controls.enableDamping = true;
    //设置阻尼系数
    this.controls.dampingFactor = 0.05;

    //添加到场景
    this.scene.add(this.axesHelper);

    //渲染场景和相机
    this.renderer.render(this.scene, this.camera);
  }

  /** @description 创建立方体 */
  private createCube() {
    //创建一个立方体
    const parent_geometry = new THREE.BoxGeometry(1, 1, 1);
    const children_geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //创建材质
    const children_material = new THREE.MeshBasicMaterial();
    children_material.opacity = 0.5;
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.material.wireframe = true;

    //创建网格
    const children = new THREE.Mesh(children_geometry, children_material);
    this.cube = new THREE.Mesh(parent_geometry, this.material);

    this.cube.add(children);
    //将网格添加进场景中
    this.scene.add(this.cube);
  }

  /** @description 开始渲染并监听 */
  private renderListener() {
    const rendering = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(rendering);
    };
    rendering();

    //自适应窗口大小
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight); //更新渲染器宽高
      this.camera.aspect = window.innerWidth / window.innerHeight; //更新相机宽高比
      this.camera.updateProjectionMatrix(); //更新相机矩阵
    });
  }

  /** @description 生成工具栏 */
  private createToolbar() {
    const event_obj = {
      hello() {
        console.warn("你好");
      },
      world() {
        console.warn("世界");
      },
    };
    const colors = {
      cubeColor: "#00ff00",
    };

    //创建GUI
    const gui = new GUI();
    gui.add(event_obj, "hello").name("你好");
    gui.add(event_obj, "world").name("世界");

    //创建文件夹
    const folder = gui.addFolder("立方体坐标");
    folder.add(this.cube.position, "x").min(-5).max(5).name("调整X").step(0.1);
    folder.add(this.cube.position, "y").min(-5).max(5).name("调整Y").step(0.1);
    folder.add(this.cube.position, "z").min(-5).max(5).name("调整Z").step(0.1);
    folder.add(this.cube.scale, "x").min(-5).max(5).name("大小X").step(0.1);
    folder.add(this.cube.scale, "y").min(-5).max(5).name("大小Y").step(0.1);
    folder.add(this.cube.scale, "z").min(-5).max(5).name("大小Z").step(0.1);

    gui.add(this.material, "wireframe").name("父元素边框模式");
    gui.addColor(colors, "cubeColor").onChange((value) => {
      this.material.color.set(value);
    });
  }
}
