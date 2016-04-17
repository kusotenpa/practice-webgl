import Webgl from './webgl'
import Scene1 from './scene/1';

class Sketch {
  constructor() {
    const canvas = document.getElementById('canvas');
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ww = new Webgl(canvas);
    const gl = ww.gl;

    // 深度テスト有効化
    gl.enable(gl.DEPTH_TEST);

    // 深度テスト評価手法設定
    gl.depthFunc(gl.LEQUAL);

    // // カリング有効化
    // gl.enable(gl.CULL_FACE);


  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Sketch();
});
