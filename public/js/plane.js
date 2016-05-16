import {mat4} from '~/lib/gl-matrix-min';
import Webgl from '~/webgl';
const glslify = require('glslify');
const ww = new Webgl();
const gl = ww.gl;

export default class Plane {
  constructor(data) {
    this.data = data;
    this.mMatrix = mat4.create();
    this.mvpMatrix = mat4.create();
    this.knob1Value = 0.5;
    this.knob2Value = 0.5;
  }

  render(option) {
    gl.useProgram(this.data.prg);

    ww.clear();

    gl.bindTexture(gl.TEXTURE_2D, this.data.frameBufferTexture);

    this.mvpMatrix = ww.createOrtho();

    gl.uniformMatrix4fv(this.data.uniforms.mvpMatrix, false, this.mvpMatrix);
    gl.uniform1i(this.data.uniforms.texture, 0);
    this.setUniform(option);

    gl.bindVertexArray(this.data.vao);
    gl.drawElements(gl.TRIANGLES, this.data.index.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setUniform() {}
}
