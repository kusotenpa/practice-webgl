import Plane from '~/plane';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class Mosaic extends Plane {
  constructor(data) {
    super(data);
  }

  setUniform() {
    if (!this.knob1Value) this.knob1Value = 0.01;
    gl.uniform1f(this.data.uniforms.mosaicSize, 1 / this.knob1Value * 50);
  }
}
