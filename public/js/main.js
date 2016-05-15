import Webgl from '~/webgl';
import {mat4} from '~/lib/gl-matrix-min';
const glslify = require('glslify');
import Midi from '~/midi';
import Sound from '~/sound';
import GrayScale from '~/scene/post-effect/gray-scale';
import Mosaic from '~/scene/post-effect/mosaic';
import Noise from '~/scene/post-effect/noise';
import NegaPosi from '~/scene/post-effect/nega-posi';
import Scene1 from '~/scene/1';
// import Scene2 from './scene/2/1';



const ww = new Webgl();
const gl = ww.gl;
const sound = new Sound();

const grayScale = new GrayScale(ww.createPlane({
  vs: glslify('../shader/gray-scale/vertex.glsl'),
  fs: glslify('../shader/gray-scale/fragment.glsl')
}));

const mosaic = new Mosaic(ww.createPlane({
  vs: glslify('../shader/mosaic/vertex.glsl'),
  fs: glslify('../shader/mosaic/fragment.glsl')
}, {uniforms: ['mosaicSize']}));

const noise = new Noise(ww.createPlane({
  vs: glslify('../shader/noise/vertex.glsl'),
  fs: glslify('../shader/noise/fragment.glsl')
}, {uniforms: ['time', 'noiseValue']}));

const negaPosi = new NegaPosi(ww.createPlane({
  vs: glslify('../shader/nega-posi/vertex.glsl'),
  fs: glslify('../shader/nega-posi/fragment.glsl'),
}));


const scene1 = new Scene1();

// const scene2 = new Scene2(ww.createPlane({
//   vs: glslify('../shader/2/1/vertex.glsl'),
//   fs: glslify('../shader/2/1/fragment.glsl'),
// }, {textureOption: gl.FLOAT}));


class Sketch {
  constructor() {
    const midi = new Midi(this.onMidiOut.bind(this));

    this.setCanvas();
    this.resize();
    this.midiBinding = {
      1: scene1,
      5: grayScale,
      6: mosaic,
      7: noise,
      8: negaPosi
    };
    this.renderArray = [null];

    // 深度テスト有効化
    gl.enable(gl.DEPTH_TEST);

    // 深度テスト評価手法設定
    gl.depthFunc(gl.LEQUAL);

    // カリング有効化
    // gl.enable(gl.CULL_FACE);

    sound.play();
    this.render();
  }

  render() {
    let vMatrix = mat4.create();
    let pMatrix = mat4.create();
    let tmpMatrix = mat4.create();

    const render = (time) => {
      const soundValue = this.getSoundValue();

      ww.clear();
      mat4.perspective(pMatrix, 45, this.aspect, 0.1, 1000);
      mat4.lookAt(vMatrix, [0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      mat4.mul(tmpMatrix, pMatrix, vMatrix);

      this.renderArray.forEach((el, i) => {

        if (this.renderArray.length - 1 === i) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, el.data.frameBuffer);

        }

        if (i === 0) {
          this.renderScene(tmpMatrix, time, soundValue);

        } else {
          this.renderArray[i - 1].render();

        }
      });

      gl.flush();
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

  }

  renderScene(tmpMatrix, time, soundValue) {
    scene1.render(tmpMatrix, this.resolution, time, soundValue);
    // scene2.render(tmpMatrix, this.resolution, time);
  }

  getSoundValue() {
    const soundData = sound.getSoundData();
    let sum = 0;
    soundData.forEach(function(el) {
      sum += el;
    });
    return sum;
  }

  onMidiOut(data) {
    if(data.isKnob1) {
      this.midiBinding[data.note].knob1Value = data.velocity;

    } else if(data.isKnob2) {
      console.log('isKnob2');
            console.log(data);

      uniforms.knob2.value = data.velocity;

    } else {
      console.log('pad')
      console.log(data);
      if (data.note > 4) {
        this.setRenderSequence(data);
      }
    }
  }

  setRenderSequence(data) {
    const target = this.midiBinding[data.note];

    if (data.velocity && this.renderArray.indexOf(target) === -1) {
      this.renderArray.unshift(target);

    } else {
      this.renderArray = this.renderArray.filter((el) => el !== target);

    }
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
