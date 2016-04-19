import {mat4} from '../../lib/gl-matrix-min';
import Webgl from '../../webgl';
const glslify = require('glslify');
const ww = new Webgl();
const gl = ww.gl;

export default class GrayScale {
  constructor() {
    this.grayScale = ww.createPlane({
      vs: glslify('../../../shader/gray-scale/vertex.glsl'),
      fs: glslify('../../../shader/gray-scale/fragment.glsl')
    });

    this.mMatrix = mat4.create();
    this.mvpMatrix = mat4.create();
  }


  render() {
    gl.useProgram(this.grayScale.prg);

    ww.clear();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.grayScale.frameBufferTexture);

    this.mvpMatrix = ww.createOrtho();

    gl.uniformMatrix4fv(this.grayScale.uniLocation.mvpMatrix, false, this.mvpMatrix);
    gl.uniform1i(this.grayScale.uniLocation.texture, 0);
    gl.bindVertexArray(this.grayScale.vao);
    gl.drawElements(gl.TRIANGLES, this.grayScale.index.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

};