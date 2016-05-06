import Webgl from './webgl';
const glslify = require('glslify');
import GrayScale from './scene/post-effect/gray-scale';
import Mosaic from './scene/post-effect/mosaic';
import Noise from './scene/post-effect/noise';
import Scene1 from './scene/1';


const ww = new Webgl();
const gl = ww.gl;
const grayScale = new GrayScale(ww.createPlane({
  vs: glslify('../shader/gray-scale/vertex.glsl'),
  fs: glslify('../shader/gray-scale/fragment.glsl')
}));
const mosaic = new Mosaic(ww.createPlane({
  vs: glslify('../shader/mosaic/vertex.glsl'),
  fs: glslify('../shader/mosaic/fragment.glsl')
}));
const noise = new Noise(ww.createPlane(
{
  vs: glslify('../shader/noise/vertex.glsl'),
  fs: glslify('../shader/noise/fragment.glsl')
},{uniLocation: ['time']}));

const scene1 = new Scene1();


class Sketch {
  constructor() {

    this.setCanvas();
    this.resize();


    // 深度テスト有効化
    gl.enable(gl.DEPTH_TEST);

    // 深度テスト評価手法設定
    gl.depthFunc(gl.LEQUAL);

    // カリング有効化
    // gl.enable(gl.CULL_FACE);

    this.render();
  }

  render() {
    let vMatrix = mat4.create();
    let pMatrix = mat4.create();
    let tmpMatrix = mat4.create();

    const render = () => {
      ww.clear();
      mat4.perspective(pMatrix, 45, this.aspect, 0.1, 1000);
      mat4.lookAt(vMatrix, [0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      mat4.mul(tmpMatrix, pMatrix, vMatrix);





      gl.bindFramebuffer(gl.FRAMEBUFFER, noise.data.frameBuffer);

      scene1.render(tmpMatrix, this.resolution);

      // gl.bindFramebuffer(gl.FRAMEBUFFER, mosaic.data.frameBuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      noise.render();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // mosaic.render();












      gl.flush();
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

  }

  setCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.aspect = width / height;
    this.resolution = [width, height];
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  resize() {
    window.addEventListener('resize', () => {
      this.setCanvas();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Sketch();
});
