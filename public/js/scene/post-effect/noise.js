import Plane from '~/plane';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class Noise extends Plane {
  constructor(data) {
    super(data);
  }

  setUniform() {
    gl.uniform1f(this.data.uniforms.time, Math.random());
    gl.uniform1f(this.data.uniforms.noiseValue, this.knob1Value);
  }
}
