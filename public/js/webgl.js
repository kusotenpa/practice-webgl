import _ from './lib/lodash';

export default class Webgl {
  constructor(){
    const canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl2');
  }




  createPostEffect(shader, option) {
    const gl = this.gl;
    const s = this._createShader(shader);
    const prg = this._createProgram(s);

    let uniLocation = {
      mvpMatrix: gl.getUniformLocation(prg, 'mvpMatrix'),
      texture: gl.getUniformLocation(prg, 'texture')
    };

    if(Array.isArray(option.uniLocation) && option.uniLocation.length) {
      let _uniLocation = {};
      option.uniLocation.forEach(function(el, i) {
        _uniLocation[el] = gl.getUniformLocation(prg, el);
      });
      _.merge(uniLocation, _uniLocation);
    }

    const attrLocation = {
      position: gl.getAttribLocation(prg, 'position'),
      textureCoord: gl.getAttribLocation(prg, 'textureCoord')
    };

    const attribute = {
      position: {
        location: attrLocation.position,
        stride: 3,
        data: [
          -1.0,  1.0,  0.0,
           1.0,  1.0,  0.0,
          -1.0, -1.0,  0.0,
           1.0, -1.0,  0.0
        ]
      },
      textureCoord: {
        location: attrLocation.textureCoord,
        stride: 2,
        data: [
          0.0, 0.0,
          1.0, 0.0,
          0.0, 1.0,
          1.0, 1.0
        ]
      }
    };

    const index = [
      0, 1, 2,
      3, 2, 1
    ];

    const interleaveArray = this.createInterleaveArray({
      position: attribute.position.data,
      color: attribute.color.data,
      textureCoord: attribute.textureCoord.data
    });

    const vao = gl.createVertexArray();
    const vbo = this.createVBO(interleaveArray);
    const ibo = this.createIBO2(index, vao);

    const byteLength = this.getByteLength(attribute);

    const postEffect = {

      index: index,

      attribute: attribute,

      vao: vao,

      vbo: vbo,

      ibo: ibo,

      byteLength: byteLength,

      prg: prg,

      uniLocation: uniLocation

    };

    this._setAttribute(attribute, vao, vbo, byteLength);

    return postEffect;

  }




  _createShader(shader) {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, shader.vs);
    gl.compileShader(vs)

    gl.shaderSource(fs, shader.fs);
    gl.compileShader(fs)

    if(gl.getShaderParameter(vs, gl.COMPILE_STATUS) && gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      return {vs: vs, fs: fs};

    } else {
      console.error(gl.getShaderInfoLog(vs));
      console.error(gl.getShaderInfoLog(fs));

    }
  }


  createFrameBuffer(width, height) {
    const gl = this.gl;
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // framebuffer用の深度バッファの生成
    const depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    // renderbufferを深度バッファとして設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    // framebufferにrenderbufferを設定
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

    // framebuffer用textureの生成
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    // fTextureにカラーのメモリ領域を確保
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // テクスチャパラメタ
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // framebufferにtextureを設定
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

    // 各bindを解除
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
      f: frameBuffer,
      d: depthRenderBuffer,
      t: fTexture
    };

  }


  _getByteLength(attribute) {
    let byteLength = 0;

    _.each(attribute, function(value, key) {
      byteLength += value.stride;
    });
    // gl.FLOAT == 32bit == 4byteなので1データ4byteとして扱う
    return byteLength * 4;
  }


  _createInterleaveArray(data) {
    let interleaveArray = [];
    const _data = _.cloneDeep(data);
    // 頂点単位で情報を纏めるためx,y,zの3で割る
    const vertexNum = data.position.length / 3;
    for(let i = 0; i < vertexNum; i++){
      Object.keys(data).forEach(function(key) {
        // 1回のforEachで1頂点座標に格納する頂点情報単位の数(e.g. colorなら4個単位)
        const stride = data[key].length / vertexNum;
        for(let j = 0; j < stride; j++) {
          interleaveArray.push(_data[key].shift());
        }
      });
    }
    return interleaveArray;
  }


  _setAttribute(attribute, vao, vbo, byteLength) {
    const gl = this.gl;
    // float32bit === 4byte
    const BYTE = 4;
    let offset = 0;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    _.each(attribute, function(attr, key) {
      // 有効化
      gl.enableVertexAttribArray(attr.location);
      // locationにbind中のvboを紐付ける
      gl.vertexAttribPointer(attr.location, attr.stride, gl.FLOAT, false, byteLength, offset * BYTE);
      offset += attr.stride;
    });
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }



  _createVBO(data) {
    const gl = this.gl;
    const vbo = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }



  _createIBO(index, vao) {
    const gl = this.gl;
    const ibo = gl.createBuffer();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }


  _createProgram(shader) {
    const gl = this.gl;

    const program = gl.createProgram();

    gl.attachShader(program, shader.vs);
    gl.attachShader(program, shader.fs);
    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;

    } else {
      console.error(gl.getProgramInfoLog(program));

    }
  }




  clear() {
    const gl = this.gl;
    this.gl.clearColor(0, 0, 0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}