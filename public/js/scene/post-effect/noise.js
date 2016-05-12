import PostEffect from '~/post-effect';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class Noise extends PostEffect {
  constructor(data) {
    super(data);
  }

  setUniform() {
    gl.uniform1f(this.data.uniLocation.time, Math.random());
    gl.uniform1f(this.data.uniLocation.noiseValue, this.knob1Value);
  }
}
