import {mat4} from '~/lib/gl-matrix-min';
import Webgl from '~/webgl';
const glslify = require('glslify');
const ww = new Webgl();
const gl = ww.gl;

export default class Scene1 {
  constructor() {
    this.triangle = this.createTriangle({
      vs: glslify('../../shader/1/vertex.glsl'),
      fs: glslify('../../shader/1/fragment.glsl')
    });

    this.mMatrix = mat4.create();
    this.mvpMatrix = mat4.create();
    this.renderType = [gl.TRIANGLES, gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP];
  }


  render(tmpMatrix, resolution, time) {
    gl.useProgram(this.triangle.prg);

    ww.clear();

    gl.bindVertexArray(this.triangle.vao);

    for (let i = 0; i < 10; i++) {
      mat4.identity(this.mMatrix);
      mat4.translate(this.mMatrix, this.mMatrix, [(Math.random() * 3 - 1.5) / 2, 0, 0]);
      mat4.rotate(this.mMatrix, this.mMatrix, Math.random() * 360 * Math.PI / 180, [1, 1, 1]);
      mat4.scale(this.mMatrix, this.mMatrix, [Math.random() * 4, Math.random() * 4, Math.random() * 4]);
      mat4.mul(this.mvpMatrix, tmpMatrix, this.mMatrix);
      gl.uniformMatrix4fv(this.triangle.uniLocation.mvpMatrix, false, this.mvpMatrix);
      gl.uniform2fv(this.triangle.uniLocation.resolution, resolution);
      gl.drawElements(this.renderType[4], this.triangle.index.length, gl.UNSIGNED_SHORT, 0);
    }


    for (let i = 0; i < 15000; i+= 2) {
      mat4.identity(this.mMatrix);
      mat4.translate(this.mMatrix, this.mMatrix, [Math.cos(i + time) * Math.cos(time / 4000) * 4, Math.sin(i + time) * Math.sin(time / 4000) * 4, 0]);
      mat4.rotate(this.mMatrix, this.mMatrix, Math.random() * 360 * Math.PI / 180, [1, 1, 1]);
      mat4.scale(this.mMatrix, this.mMatrix, [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5]);
      mat4.mul(this.mvpMatrix, tmpMatrix, this.mMatrix);
      gl.uniformMatrix4fv(this.triangle.uniLocation.mvpMatrix, false, this.mvpMatrix);
      gl.uniform2fv(this.triangle.uniLocation.resolution, resolution);
      gl.drawElements(this.renderType[1], this.triangle.index.length, gl.UNSIGNED_SHORT, 0);
    }






    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }



  createTriangle(shader, option) {
    const s = ww._createShader(shader);
    const prg = ww._createProgram(s);

    let uniLocation = {
      mvpMatrix: gl.getUniformLocation(prg, 'mvpMatrix'),
      resolution: gl.getUniformLocation(prg, 'resolution')
    };

    const attrLocation = {
      posiiton: gl.getAttribLocation(prg, 'position'),
      color: gl.getAttribLocation(prg, 'color')
    };

    const attribute = {
      position: {
        location: attrLocation.position,
        stride: 3,
        data: [
           0.0, 1.0, 0.0,
           1.0, 0.0, 0.0,
          -1.0, 0.0, 0.0
        ]
      },
      color: {
        location: attrLocation.color,
        stride: 4,
        data: [
           0.3, 0.8, 1.0, 1.0,
           0.3, 0.1, 1.0, 1.0,
           0.0, 0.3, 1.0, 1.0,
        ]
      }
    };

    const index = [
      0, 1, 2,
    ];

    const interleaveArray = ww._createInterleaveArray({
      position: attribute.position.data,
      color: attribute.color.data,
    });

    const vao = gl.createVertexArray();
    const vbo = ww._createVBO(interleaveArray);
    const ibo = ww._createIBO(index, vao);
    const byteLength = ww._getByteLength(attribute);

    const triangle = {

      index,

      attribute,

      uniLocation,

      vao,

      vbo,

      ibo,

      byteLength,

      prg

    };

    ww._setAttribute(attribute, vao, vbo, byteLength);

    return triangle;

  }


};
