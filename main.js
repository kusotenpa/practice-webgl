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
      var vbo = [];
      var attrLocation = [];
      var attrStride = [];




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




      /*
        torus
      */
      var torusData = this.torus(32, 32, 1.0, 2.0);
      var position = torusData[0];
      var normal = torusData[1];
      var color = torusData[2];
      this.index = torusData[3];
      vbo[0] = this.createVBO(position);
      vbo[1] = this.createVBO(normal);
      vbo[2] = this.createVBO(color);
      attrLocation[0] = gl.getAttribLocation(this.prg, 'position');
      attrLocation[1] = gl.getAttribLocation(this.prg, 'normal');
      attrLocation[2] = gl.getAttribLocation(this.prg, 'color');
      attrStride[0] = 3;
      attrStride[1] = 3;
      attrStride[2] = 4;
      this.setAttribute(vbo, attrLocation, attrStride);
      var ibo = this.createIBO(this.index);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);




      var vMat = mat4.create();
      var pMat = mat4.create();
      this.tmpMat = mat4.create();
      // projection座標変換
      mat4.perspective(pMat, 45, c.width / c.height, 0.1, 100);
      // view座標変換
      mat4.lookAt(vMat, [0.0, 0.0, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      // pv座標
      mat4.mul(this.tmpMat, pMat, vMat);

      // this.main();
    },

    main: function() {
      var count = 0
      var uniLocation = {
        mvpMatrix: gl.getUniformLocation(this.prg, 'mvpMatrix'),
        invMatrix: gl.getUniformLocation(this.prg, 'invMatrix'),
        lightDirection: gl.getUniformLocation(this.prg, 'lightDirection'),
        ambientColor: gl.getUniformLocation(this.prg, 'ambientColor'),
        eyeDirection: gl.getUniformLocation(this.prg, 'eyeDirection')
      };
      // 平行光源の向き
      var lightDirection = [-0.5, 0.5, 0.5];
      // 環境光の色
      var ambientColor = [0.1, 0.1, 0.1, 1.0];
      // 視点ベクトル
      var eyeDirection = [0.0, 0.0, 20.0];
      var mvpMat = mat4.create();
      var invMat = mat4.create();
      var tmpMat = this.tmpMat;
      var index = this.index;

      function loop() {
        var mMat = mat4.create();

        gl.clearColor(0, 0, 0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        count++;
        var rad = (count % 360) * Math.PI / 180;
        var x = Math.cos(rad);
        var y = Math.sin(rad);

        // torus
        mat4.rotate(mMat, mMat, rad, [0, 1, 1]);
        mat4.mul(mvpMat, tmpMat, mMat);
        mat4.invert(invMat, mMat);
        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMat);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMat);
        gl.uniform3fv(uniLocation.lightDirection, lightDirection);
        gl.uniform3fv(uniLocation.eyeDirection, eyeDirection);
        gl.uniform4fv(uniLocation.ambientColor, ambientColor);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

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
    }
  };

  this.sketch.init();

})();