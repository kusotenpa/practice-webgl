(function(){
  var c = document.getElementById('canvas');
  c.width = 500;
  c.height = 300;
  var gl = c.getContext('webgl');


  this.sketch = {

    init: function() {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 深度テスト有効化
      gl.enable(gl.DEPTH_TEST);
      // 深度テスト評価手法設定
      gl.depthFunc(gl.LEQUAL);
      // カリング有効化
      gl.enable(gl.CULL_FACE);

      var vs = this.createShader('vs');
      var fs = this.createShader('fs');
      this.prg = this.createProgram(vs, fs);

      // attributeの設定
      this. vbo = [];
      this.attrLocation = [];
      this.attrStride = [];




      /*
        ----- 三角形 ------
      */
      // 頂点の設定
      // attrLocation[0] = gl.getAttribLocation(this.prg, 'position');
      // // xyz === 3
      // attrStride[0] = 3;
      // var vPosition = [
      //   0.0, 1.0, 0.0,
      //   1.0, 0.0, 0.0,
      //   -1.0, 0.0, 0.0,
      //   0.0, -1.0, 0.0
      // ];
      // vbo[0] = this.createVBO(vPosition);

      // // colorの設定
      // attrLocation[1] = gl.getAttribLocation(this.prg, 'color');
      // // rgba === 4
      // attrStride[1] = 4;
      // var vColor = [
      //   1.0, 0.0, 0.0, 1.0,
      //   0.0, 1.0, 0.0, 1.0,
      //   0.0, 0,0, 1.0, 1.0,
      //   1.0, 1.0, 1.0, 1.0
      // ];
      // vbo[1] = this.createVBO(vColor);

      // // attributeの登録
      // this.setAttribute(vbo, attrLocation, attrStride);

      // // ibo
      // this.index = [
      //   0, 1, 2,
      //   1, 2, 3
      // ];
      // var ibo = this.createIBO(this.index);
      // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      /*
        ------ 三角形ここまで -------
      */









      var vMat = mat4.create();
      var pMat = mat4.create();
      this.tmpMat = mat4.create();
      // projection座標変換
      mat4.perspective(pMat, 45, c.width / c.height, 0.1, 100);
      // view座標変換
      mat4.lookAt(vMat, [0.0, 0.0, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      // pv座標
      mat4.mul(this.tmpMat, pMat, vMat);

      this.main();
    },

    main: function() {
      var self = this;
      var count = 0
      var uniLocation = {
        mvpMatrix: gl.getUniformLocation(this.prg, 'mvpMatrix'),
        mMatrix: gl.getUniformLocation(this.prg, 'mMatrix'),
        invMatrix: gl.getUniformLocation(this.prg, 'invMatrix'),
        lightPosition: gl.getUniformLocation(this.prg, 'lightPosition'),
        ambientColor: gl.getUniformLocation(this.prg, 'ambientColor'),
        eyeDirection: gl.getUniformLocation(this.prg, 'eyeDirection')
      };
      // 点光源の位置
      var lightPosition = [0.0, 0.0, 0.0];
      // 環境光の色
      var ambientColor = [0.1, 0.1, 0.1, 1.0];
      // 視点ベクトル
      var eyeDirection = [0.0, 0.0, 20.0];
      var mvpMat = mat4.create();
      var invMat = mat4.create();
      var tmpMat = this.tmpMat;
      var index = this.index;
      var sphereIndex = this.sphereIndex;

      function loop() {
        var mMat = mat4.create();

        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        count++;
        var rad = (count % 360) * Math.PI / 180;
        var x = Math.cos(rad) * 3.5;
        var y = Math.sin(rad) * 3.5;
        var z = Math.sin(rad) * 3.5;


        gl.uniform3fv(uniLocation.lightPosition, lightPosition);
        gl.uniform3fv(uniLocation.eyeDirection, eyeDirection);
        gl.uniform4fv(uniLocation.ambientColor, ambientColor);

        self.attrLocation[0] = gl.getAttribLocation(self.prg, 'position');
        self.attrLocation[1] = gl.getAttribLocation(self.prg, 'textureCoord');
        self.attrLocation[2] = gl.getAttribLocation(self.prg, 'color');
        self.attrStride[0] = 3;
        self.attrStride[1] = 2;
        self.attrStride[2] = 4;


        /**
         * texture
         */
        var position = [
          -1.0,  1.0,  0.0,
           1.0,  1.0,  0.0,
          -1.0, -1.0,  0.0,
           1.0, -1.0,  0.0
        ];






        /**
         * torus
         */
        var torusData = self.torus(64, 64, 0.5, 1.5);
        var position = torusData[0];
        var normal = torusData[1];
        var color = torusData[2];
        self.index = torusData[3];
        self.vbo[0] = self.createVBO(position);
        self.vbo[1] = self.createVBO(normal);
        self.vbo[2] = self.createVBO(color);
        self.setAttribute(self.vbo, self.attrLocation, self.attrStride);
        var ibo = self.createIBO(self.index);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);



        // torus
        mat4.translate(mMat, mMat, [x, -y, -z]);
        mat4.rotate(mMat, mMat, -rad, [0, 1, 1]);
        mat4.mul(mvpMat, tmpMat, mMat);
        mat4.invert(invMat, mMat);
        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMat);
        gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMat);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMat);

        gl.drawElements(gl.TRIANGLES, self.index.length, gl.UNSIGNED_SHORT, 0);



        /**
         * sphere
         */
        var sphereData = self.sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
        var sVBO = [
          self.createVBO(sphereData.p),
          self.createVBO(sphereData.n),
          self.createVBO(sphereData.c)
        ];
        self.setAttribute(sVBO, self.attrLocation, self.attrStride);
        var sIBO = self.createIBO(sphereData.i);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIBO);
        self.sphereIndex = sphereData.i;




        // sphere
        mat4.identity(mMat);
        mat4.translate(mMat, mMat, [-x, y, z]);
        mat4.mul(mvpMat, tmpMat, mMat);
        mat4.invert(invMat, mMat);
        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMat);
        gl.uniformMatrix4fv(uniLocation.mMatrix, false, mMat);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMat);
        gl.drawElements(gl.TRIANGLES, self.sphereIndex.length, gl.UNSIGNED_SHORT, 0);

        // model1
        // mat4.translate(mMat, mMat, [x, y + 1.0, 0.0]);
        // mat4.mul(mvpMat, tmpMat, mMat);
        // gl.uniformMatrix4fv(uniLocation, false, mvpMat);
        // gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        // model2
        // mat4.identity(mMat);
        // mat4.translate(mMat, mMat, [1.0, -1.0, 0.0]);
        // mat4.rotate(mMat, mMat, rad, [0, 1, 0]);
        // mat4.mul(mvpMat, tmpMat, mMat);
        // gl.uniformMatrix4fv(uniLocation, false, mvpMat);
        // gl.drawArrays(gl.TRIANGLES, 0, 3);

        // // // model3
        // var s = Math.sin(rad) + 1.0;
        // mat4.identity(mMat);
        // mat4.translate(mMat, mMat, [-1.0, -1.0, 0.0]);
        // mat4.scale(mMat, mMat, [s, s, 0.0]);
        // mat4.mul(mvpMat, tmpMat, mMat);
        // gl.uniformMatrix4fv(uniLocation, false, mvpMat);
        // gl.drawArrays(gl.TRIANGLES, 0, 3);



        gl.flush();
        requestAnimationFrame(loop);
      }

      loop();
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



    createIBO: function(data) {
      var ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return ibo;
    },



    setAttribute: function(vbo, attrLocation, attrStride) {
      vbo.forEach(function(el, i) {
        // bufferのbind
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        // attrLocationの有効化
        gl.enableVertexAttribArray(attrLocation[i]);
        // attrLocationの登録
        gl.vertexAttribPointer(attrLocation[i], attrStride[i], gl.FLOAT, false, 0, 0);
      });
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


    createTexture(src): function() {
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