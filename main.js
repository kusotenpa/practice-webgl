(function(){
  _.cloneDeep([]);
  var c = document.getElementById('canvas');
  c.width = 500;
  c.height = 300;
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

      this.attrLocation = {
        position: gl.getAttribLocation(this.prg, 'position'),
        color: gl.getAttribLocation(this.prg, 'color')
      };

      this.square = this.createSquare();

      var hoge = gl.getAttribLocation(this.prg, 'position');
      var fuga = gl.getAttribLocation(this.prg, 'color');
      var torusData = self.torus(64, 64, 0.5, 1.5);
      var position = torusData[0];
      var normal = torusData[1];
      var color = torusData[2];
      self.index = torusData[3];
      this.aaa = [hoge, fuga];
      self.vbo = [];
      self.vbo[0] = self.createVBO(position);
      self.vbo[1] = self.createVBO(color);
      self.attrStride = [3, 4];
      self.setAttribute(self.vbo, this.aaa, self.attrStride);
      self.ibo = self.createIBO(self.index);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.ibo);

      var vMatrix = mat4.create();
      var pMatrix = mat4.create();
      this.tmpMatrix = mat4.create();
      // projection座標変換
      mat4.perspective(pMatrix, 45, c.width / c.height, 0.1, 100);
      // view座標変換
      mat4.lookAt(vMatrix, [0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      // pv座標
      mat4.mul(this.tmpMatrix, pMatrix, vMatrix);

      this.main();
    },


    main: function() {
      var self = this;
      var count = 0
      var uniLocation = {
        mvpMatrix: gl.getUniformLocation(this.prg, 'mvpMatrix'),
      };
      var mvpMatrix = mat4.create();
      var tmpMatrix = this.tmpMatrix;
      var invMatrix = mat4.create();



      function loop() {
        var mMatrix = mat4.create();

        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        count++;
        var rad = (count % 360) * Math.PI / 180;
        var x = Math.cos(rad) * 1.5;
        var y = Math.sin(rad) * 1.5;
        var z = Math.sin(rad) * 1.5;

        mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 0]);
        mat4.mul(mvpMatrix, tmpMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
        gl.bindVertexArray(self.square.vao);
        gl.drawElements(gl.TRIANGLES, self.square.index.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        // torus
        mat4.translate(mMatrix, mMatrix, [x, -y, -z]);
        mat4.rotate(mMatrix, mMatrix, -rad, [0, 1, 1]);
        mat4.mul(mvpMatrix, tmpMatrix, mMatrix);
        mat4.invert(invMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMatrix);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
        self.setAttribute(self.vbo, self.aaa, self.attrStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.ibo);
        gl.drawElements(gl.TRIANGLES, self.index.length, gl.UNSIGNED_SHORT, 0);



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

      // // attribute有効化
      // gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      // gl.enableVertexAttribArray(attribute.position.location);
      // gl.vertexAttribPointer(attribute.position.location, attribute.position.stride, gl.FLOAT, false, byteLength, 0);
      // gl.enableVertexAttribArray(attribute.color.location);
      // gl.vertexAttribPointer(attribute.color.location, attribute.color.stride, gl.FLOAT, false, byteLength, 12);

      // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

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

    }




  };

  this.sketch.init();

})();