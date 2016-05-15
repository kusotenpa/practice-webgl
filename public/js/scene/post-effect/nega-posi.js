import PostEffect from '~/post-effect';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class NegaPosi extends PostEffect {
  constructor(data) {
    super(data);
  }

}
