import Webgl from '~/webgl';
const glslify = require('glslify');
import PostEffect from '~/post-effect';
import Scene2_2 from './2';
import Scene2_3 from './3';

let backBuffer = new Scene2_2(ww.createPlane({
    vs: glslify('../../../shader/2/2/vertex.glsl'),
    fs: glslify('../../../shader/2/2/fragment.glsl')
  },
  {
    uniforms: [
      'resolution',
      'velocity',
      'mouse',
      'mouseFlag'
    ]
  }
));

let frontBuffer = new Scene2_3(ww.createPlane({
    vs: glslify('../../../shader/2/3/vertex.glsl'),
    fs: glslify('../../../shader/2/3/fragment.glsl')
  },
  {
    uniforms: [
      'resolution',
      'pointScale',
      'ambient'
    ]
  }
));

export default class Scene2_1 extends PostEffect{
  constructor(data) {
    super(data);
  }

  preRender() {

  }

  flip() {
    const _frameBuffer = backBuffer;
    backBuffer = frontBuffer;
    frontBuffer = _frameBuffer;
  }

  render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frontBuffer.data.frameBuffer);

    backBuffer.render();

    gl.bindFramebuffer(gl.FRAMEBUFFER, backBuffer.data.frameBuffer);

    frontBuffer.render();

    flip();
  }
};
