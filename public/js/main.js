import Webgl from './webgl';
import GrayScale from './scene/post-effect/gray-scale';
import Scene1 from './scene/1';

const ww = new Webgl();
const gl = ww.gl;
const grayScale = new GrayScale();
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



      gl.bindFramebuffer(gl.FRAMEBUFFER, grayScale.grayScale.frameBuffer);

      scene1.render(tmpMatrix, this.resolution);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      grayScale.render();


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
