import {mat4} from '../lib/gl-matrix-min';
import Webgl from '../webgl';
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
  }


  render(tmpMatrix, resolution) {
    mat4.identity(this.mMatrix);
    // mat4.translate(this.mMatrix, this.mMatrix, [1.0, 0, 2.3]);
    mat4.mul(this.mvpMatrix, tmpMatrix, this.mMatrix);

    gl.uniformMatrix4fv(this.triangle.uniLocation.mvpMatrix, false, this.mvpMatrix);
    gl.uniform2fv(this.triangle.uniLocation.resolution, resolution);
    gl.bindVertexArray(this.triangle.vao);
    gl.drawElements(gl.TRIANGLES, this.triangle.index.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
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
           1.0, 1.0, 1.0, 1.0,
           1.0, 1.0, 1.0, 1.0,
           1.0, 1.0, 1.0, 1.0,
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

      index: index,

      attribute: attribute,

      uniLocation: uniLocation,

      vao: vao,

      vbo: vbo,

      ibo: ibo,

      byteLength: byteLength

    };

    ww._setAttribute(attribute, vao, vbo, byteLength);

    return triangle;

  }


};