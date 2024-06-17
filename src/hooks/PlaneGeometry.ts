import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { RGBELoader, OrbitControls } from "three/examples/jsm/Addons.js";

interface ThreeType {
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
  material: THREE.MeshBasicMaterial;
  axesHelper: THREE.AxesHelper;
}

export class PlaneGeometry {
  renderer!: ThreeType["renderer"];
  private plane!: ThreeType["plane"];
  private scene!: ThreeType["scene"];
  private camera!: ThreeType["camera"];
  private controls!: ThreeType["controls"];
  private material!: ThreeType["material"];
  private axesHelper!: THREE.AxesHelper;
  private gui!: GUI;
  constructor() {
    this.setLayout();
    this.createPlane();
    this.renderListener();
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
    //创建GUI
    this.gui = new GUI();

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

    const event_obj = {
      hello() {
        console.warn("你好");
      },
      world() {
        console.warn("世界");
      },
    };

    this.gui.add(event_obj, "hello").name("你好");
    this.gui.add(event_obj, "world").name("世界");
  }

  /** @description 创建平面 */
  private createPlane() {
    const geometry = new THREE.PlaneGeometry(1, 1);

    //创建纹理加载器
    const textureLoader = new THREE.TextureLoader();
    //加载纹理
    const texture = textureLoader.load("/textures/Bricks066_1K-JPG_Color.jpg");
    //加载环境遮挡贴图
    const ao_map = textureLoader.load("/textures/Bricks066_1K-JPG_AmbientOcclusion.jpg");
    //加载高光贴图
    const hight_map = textureLoader.load("/textures/Bricks066_1K-JPG_Roughness.jpg");
    //导入HDR加载器
    const hdrLoader = new RGBELoader();
    hdrLoader.load("/textures/buikslotermeerplein_4k.hdr", (envMap) => {
      //设置球形映射
      envMap.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = envMap;
      this.material.envMap = envMap;
    });

    texture.colorSpace = THREE.SRGBColorSpace;

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      aoMap: ao_map,
      aoMapIntensity: 1, //环境贴图强度
      // lightMap: hight_map,
      /** 反射强度 */
      // reflectivity: 0.5,
    });
    this.plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.plane);

    this.gui.add(this.material, "aoMapIntensity").min(0).max(1).name("ao贴图强度");
    this.gui
      .add(texture, "colorSpace", {
        sRGB: THREE.SRGBColorSpace,
        Linear: THREE.LinearSRGBColorSpace,
      })
      .onChange(() => {
        texture.needsUpdate = true;
      })
      .name("颜色空间");
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
}
