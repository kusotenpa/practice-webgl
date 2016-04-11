(function(){
  _.cloneDeep([]);
  var c = document.getElementById('canvas');
  c.width = 512;
  c.height = 512;
  var gl = c.getContext('webgl2');

  this.sketch = {

    init: function() {
      var self = this;
      gl.clearColor(0, 0, 0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 深度テスト有効化
      gl.enable(gl.DEPTH_TEST);

      // 深度テスト評価手法設定
      gl.depthFunc(gl.LEQUAL);

      // // カリング有効化
      // gl.enable(gl.CULL_FACE);

      var vs = this.createShader('vs');
      var fs = this.createShader('fs');
      this.prg = this.createProgram(vs, fs);

      this.uniLocation = {
        mvpMatrix: gl.getUniformLocation(this.prg, 'mvpMatrix'),
        texture: gl.getUniformLocation(this.prg, 'texture'),
        isUseTexture: gl.getUniformLocation(this.prg, 'isUseTexture'),
        vertexAlpha: gl.getUniformLocation(this.prg, 'vertexAlpha')
      };

      this.attrLocation = {
        position: gl.getAttribLocation(this.prg, 'position'),
        color: gl.getAttribLocation(this.prg, 'color'),
        textureCoord: gl.getAttribLocation(this.prg, 'textureCoord')
      };


      this.square = this.createSquare();


      this.board = this.createBoard();


      this.postEffect = this.createPostEffect();


      this.fBuffer = this.createFrameBuffer(512, 512);


      this.vMatrix = mat4.create();
      this.pMatrix = mat4.create();
      this.tmpMatrix = mat4.create();


      this.main();
    },


    main: function() {
      var self = this;
      var count = 0

      var mvpMatrix = mat4.create();
      var invMatrix = mat4.create();



      function loop() {
        count++;

        var rad = (count % 360) * Math.PI / 180;
        var x = Math.cos(rad) * 1.5;
        var y = Math.sin(rad) * 1.5;
        var z = Math.sin(rad) * 1.5;
        var mMatrix = mat4.create();


        gl.bindFramebuffer(gl.FRAMEBUFFER, self.fBuffer.f);

        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        gl.useProgram(self.prg);


        // projection座標変換
        mat4.perspective(self.pMatrix, 45, c.width / c.height, 0.1, 100);
        // view座標変換
        mat4.lookAt(self.vMatrix, [0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        // pv座標
        mat4.mul(self.tmpMatrix, self.pMatrix, self.vMatrix);


        // texture
        gl.disable(gl.BLEND)
        mat4.identity(mMatrix);
        mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 0]);
        mat4.mul(mvpMatrix, self.tmpMatrix, mMatrix);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(self.uniLocation.texture, 0);
        gl.uniform1i(self.uniLocation.isUseTexture, true);
        gl.uniformMatrix4fv(self.uniLocation.mvpMatrix, false, mvpMatrix);
        gl.uniform1f(self.uniLocation.vertexAlpha, 1.0);
        gl.bindVertexArray(self.board.vao);
        gl.drawElements(gl.TRIANGLES, self.board.index.length, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);



        // square
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, [0, 0, 2.3]);
        mat4.mul(mvpMatrix, self.tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(self.uniLocation.mvpMatrix, false, mvpMatrix);
        gl.uniform1i(self.uniLocation.isUseTexture, false);
        gl.uniform1f(self.uniLocation.vertexAlpha, 0.9);
        gl.bindVertexArray(self.square.vao);
        gl.drawElements(gl.TRIANGLES, self.square.index.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);



        // post effect
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(self.postEffect.prg);

        gl.bindTexture(gl.TEXTURE_2D, self.fBuffer.t);

        mat4.lookAt(self.vMatrix, [0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.ortho(self.pMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 1.0);
        mat4.mul(self.tmpMatrix, self.pMatrix, self.vMatrix);


        var useBlur = document.getElementById('blur').checked;
        mat4.identity(mMatrix);
        mat4.mul(mvpMatrix, self.tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(self.uniLocation2.mvpMatrix, false, mvpMatrix);
        gl.uniform1i(self.uniLocation2.texture, 0);
        gl.uniform1i(self.uniLocation2.useBlur, useBlur);
        gl.bindVertexArray(self.postEffect.vao);
        gl.drawElements(gl.TRIANGLES, self.postEffect.index.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);




        /**
         * sphere
         */
        // var sphereData = self.sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
        // var sVBO = [
        //   self.createVBO(sphereData.p),
        //   self.createVBO(sphereData.n),
        //   self.createVBO(sphereData.c)
        // ];
        // self.setAttribute(sVBO, self.attrLocation, self.attrStride);
        // var sd = self.created(sphereData.i);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sd);
        // self.sphereIndex = sphereData.i;




        // // sphere
        // mat4.identity(mMat);
        // mat4.translate(mMat, mMat, [-x, y, z]);
        // mat4.mul(mvpMat, tmpMat, mMat);
        // mat4.invert(invMat, mMat);
        // gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMat);
        // gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMat);
        // gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMat);
        // gl.drawElements(gl.TRIANGLES, self.sphereIndex.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();
        requestAnimationFrame(loop);
      }

      loop();
    },




    createPostEffect: function() {
      var vs = this.createShader('vs2');
      var fs = this.createShader('fs2');
      var prg = this.createProgram(vs, fs);

      this.attrLocation2 = {
        position: gl.getAttribLocation(prg, 'position'),
        color: gl.getAttribLocation(prg, 'color'),
      };

      this.uniLocation2 = {
        mvpMatrix: gl.getUniformLocation(prg, 'mvpMatrix'),
        texture: gl.getUniformLocation(prg, 'texture'),
        useBlur: gl.getUniformLocation(prg, 'useBlur')
      };

      var index = [
        0, 1, 2,
        3, 2, 1
      ];

      var attribute = {
        position: {
          location: this.attrLocation2.position,
          stride: 3,
          data: [
            -1.0,  1.0,  0.0,
             1.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
          ]
        },
        color: {
          location: this.attrLocation2.color,
          stride: 4,
          data: [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
          ]
        }
      };

      var interleaveArray = this.createInterleaveArray({
        position: attribute.position.data,
        color: attribute.color.data
      });

      var vao = gl.createVertexArray();
      var vbo = this.createVBO(interleaveArray);
      var ibo = this.createIBO2(index, vao);

      var byteLength = this.getByteLength(attribute);

      var postEffect = {

        index: index,

        attribute: attribute,

        vao: vao,

        vbo: vbo,

        ibo: ibo,

        byteLength: byteLength,

        prg: prg

      };

      this.setAttribute2(attribute, vao, vbo, byteLength);

      return postEffect;

    },



    createSquare: function() {
      var index = [
        0, 1, 2,
        1, 2, 3
      ];

      var attribute = {
        position: {
          location: this.attrLocation.position,
          stride: 3,
          data: [
             0.0, 1.0, 0.0,
             1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
             0.0, -1.0, 0.0
          ]
        },
        color: {
          location: this.attrLocation.color,
          stride: 4,
          data: [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
          ]
        }
      };

      var interleaveArray = this.createInterleaveArray({
        position: attribute.position.data,
        color: attribute.color.data
      });

      var vao = gl.createVertexArray();
      var vbo = this.createVBO(interleaveArray);
      var ibo = this.createIBO2(index, vao);

      var byteLength = this.getByteLength(attribute);

      var square = {

        index: index,

        attribute: attribute,

        vao: vao,

        vbo: vbo,

        ibo: ibo,

        byteLength: byteLength,

      };

      this.setAttribute2(attribute, vao, vbo, byteLength);

      return square;
    },




    /*
      @param Number row 円の頂点数
      @param Number column torusを形成する円の数
      @param Number ird 円の半径
      @param Number orad 原点からパイプの中心までの距離
    */
    torus: function(row, column, irad, orad) {
      var position = [];
      var normal = [];
      var color = [];
      var index = [];
      for(var i = 0; i<= row; i++) {
        var r = Math.PI * 2 / row * i;
        var rr = Math.cos(r);
        var ry = Math.sin(r);
        for(var ii = 0; ii <= column; ii++) {
          var tr = Math.PI * 2 / column * ii;
          var tx = (rr * irad + orad) * Math.cos(tr);
          var ty = ry * irad;
          var tz = (rr * irad + orad) * Math.sin(tr);
          var rx = rr * Math.cos(tr);
          var rz = rr * Math.sin(tr);
          position.push(tx, ty, tz);
          normal.push(rx, ry, rz);
          var tc = this.hsva(360 / column * ii, 1, 1, 1);
          color.push(tc[0], tc[1], tc[2], tc[3]);
        }
      }
      for(var i = 0; i < row; i++) {
        for(var ii = 0; ii < column; ii++) {
          r = (column + 1) * i + ii;
          index.push(r, r + column + 1, r + 1);
          index.push(r + column + 1, r + column + 2, r + 1);
        }
      }
      return [position, normal, color, index];
    },


    // 球体
    sphere: function(row, column, rad, color) {
      var pos = [];
      var nor = [];
      var col = [];
      var idx = [];

      for(var i = 0; i <= row; i++) {
        var r = Math.PI / row * i;
        var ry = Math.cos(r);
        var rr = Math.sin(r);
        for(var ii = 0; ii <= column; ii++){
          var tr = Math.PI * 2 / column * ii;
          var tx = rr * rad * Math.cos(tr);
          var ty = ry * rad;
          var tz = rr * rad * Math.sin(tr);
          var rx = rr * Math.cos(tr);
          var rz = rr * Math.sin(tr);

          if(color) {
            var tc = color;

          } else {
            tc = hsva(360 / row * i, 1, 1, 1);
          }
          pos.push(tx, ty, tz);
          nor.push(rx, ry, rz);
          col.push(tc[0], tc[1], tc[2], tc[3]);
        }
      }

      r = 0;

      for(i = 0; i < row; i++) {
        for(ii = 0; ii < column; ii++) {
          r = (column + 1) * i + ii;
          idx.push(r, r + 1, r + column + 2);
          idx.push(r, r + column + 2, r + column + 1);
        }
      }
      return {p : pos, n : nor, c : col, i : idx};
    },



    createShader: function(id) {
      var shader;
      var scriptElement = document.getElementById(id);

      switch(scriptElement.type) {
        case 'x-shader/x-vertex':
          shader = gl.createShader(gl.VERTEX_SHADER);
          break;

        case 'x-shader/x-fragment':
          shader = gl.createShader(gl.FRAGMENT_SHADER);
          break;

        default:
          return;
      }

      gl.shaderSource(shader, scriptElement.text);
      gl.compileShader(shader)

      if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;

      } else {
        console.error(gl.getShaderInfoLog(shader));

      }
    },



    createProgram: function(vs, fs) {
      var program = gl.createProgram();

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        return program;

      } else {
        console.error(gl.getProgramInfoLog(program));
      }
    },



    createVBO: function(data) {
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return vbo;
    },



    createIBO2: function(index, vao) {
      var ibo = gl.createBuffer();

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return ibo;
    },



    createIBO: function(data) {
      var ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return ibo;
    },



    setAttribute2: function(attribute, vao, vbo, byteLength) {
      // float32bit == 4byte
      var BYTE = 4;
      var offset = 0;

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

    },


    setAttribute: function(vbo, attrLocation, attrStrid) {
      vbo.forEach(function(el, i) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        // attrLocationの有効化
        // 一度呼ぶだけで良い
        gl.enableVertexAttribArray(attrLocation[i]);
        // attrLoacationの登録
        gl.vertexAttribPointer(attrLocation[i], attrStrid[i], gl.FLOAT, false, 0, 0);
      });
    },


    createInterleaveArray: function(data) {
      var interleaveArray = [];
      var _data = _.cloneDeep(data);
      // 頂点単位で情報を纏めるためx,y,zの3で割る
      var vertexNum = data.position.length / 3;
      for(var i = 0; i < vertexNum; i++){
        Object.keys(data).forEach(function(key) {
          // 1回のforEachで1頂点座標に格納する頂点情報単位の数(e.g. colorなら4個単位)
          var stride = data[key].length / vertexNum;
          for(var j = 0; j < stride; j++) {
            interleaveArray.push(_data[key].shift());
          }
        });
      }
      return interleaveArray;
    },


    createFrameBuffer: function(width, height) {
      var frameBuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

      // framebuffer用の深度バッファの生成
      var depthRenderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
      // renderbufferを深度バッファとして設定
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      // framebufferにrenderbufferを設定
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

      // framebuffer用textureの生成
      var fTexture = gl.createTexture();
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

    },


    getByteLength: function(attribute) {
      var byteLength = 0;

      _.each(attribute, function(value, key) {
        byteLength += value.stride;
      });
      // gl.FLOAT == 32bit == 4byteなので1データ4byteとして扱う
      return byteLength * 4;
    },


    hsva: function(h, s, v, a) {
      if(s > 1 || v > 1 || a > 1) return;

      var th = h % 360;
      var i = Math.floor(th / 60);
      var f = th / 60 - i;
      var m = v * (1 - s);
      var n = v * (1 - s * f);
      var k = v * (1 - s * (1 -f));
      var color = [];

      if(!s > 0 && !s < 0) {
        color.push(v, v, v, a);

      } else {
        var r = [v, n, m, m, k, v];
        var g = [k, v, v, n, m, m];
        var b = [m, m, k, v, v, n];
        color.push(r[i], g[i], b[i], a);
      }

      return color;
    },


    createTexture: function(src) {
      var img = new Image();
      gl.activeTexture(gl.TEXTURE0);
      img.onload = function() {
        var tex = gl.createTexture();

        // texをバインド
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // imgのバインド
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);

        // textureのバインドをリセット
        gl.bindTexture(gl.TEXTURE_2D, null);

        texture = tex;
      };

      img.src = src;

    },

    createBoard: function() {
      var attribute = {
        position: {
          location: this.attrLocation.position,
          stride: 3,
          data: [
             -1.0,  1.0,  0.0,
              1.0,  1.0,  0.0,
             -1.0, -1.0,  0.0,
              1.0, -1.0,  0.0
          ]
        },
        color: {
          location: this.attrLocation.color,
          stride: 4,
          data: [
             1.0, 1.0, 1.0, 1.0,
             1.0, 1.0, 1.0, 1.0,
             1.0, 1.0, 1.0, 1.0,
             1.0, 1.0, 1.0, 1.0
          ]
        },
        textureCoord: {
          location: this.attrLocation.textureCoord,
          stride: 2,
          data: [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
          ]
        }
      };

      var index = [
        0, 1, 2,
        3, 2, 1
      ];

      var interleaveArray = this.createInterleaveArray({
        position: attribute.position.data,
        color: attribute.color.data,
        textureCoord: attribute.textureCoord.data,
      });

      var vao = gl.createVertexArray();
      var vbo = this.createVBO(interleaveArray);
      var ibo = this.createIBO2(index, vao);
      var byteLength = this.getByteLength(attribute);

      var board = {

        index: index,

        attribute: attribute,

        vao: vao,

        vbo: vbo,

        ibo: ibo,

        byteLength: byteLength

      };

      this.setAttribute2(attribute, vao, vbo, byteLength);

      return board;

    }




  };

  this.sketch.createTexture('texture.png');
  setTimeout(function() {
    this.sketch.init();
  }, 500);

})();