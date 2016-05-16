import Plane from '~/plane';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class Scene3 extends Plane {
  constructor(data) {
    super(data);
  }

  setUniform(option) {
    gl.uniform2fv(this.data.uniforms.resolution, option.uniforms.resolution);
    gl.uniform1f(this.data.uniforms.time, option.uniforms.time);
  }
}
