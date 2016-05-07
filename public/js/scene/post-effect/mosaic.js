import PostEffect from '../../post-effect';
import Webgl from '../../webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class Mosaic extends PostEffect {
  constructor(data) {
    super(data);
  }

  setUniform() {
    if (!this.knob1Value) this.knob1Value = 0.01;
    gl.uniform1f(this.data.uniLocation.mosaicSize, 1 / this.knob1Value * 50);
  }
}