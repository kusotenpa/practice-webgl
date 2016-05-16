import Plane from '~/plane';
import Webgl from '~/webgl';

const ww = new Webgl();
const gl = ww.gl;

export default class NegaPosi extends Plane {
  constructor(data) {
    super(data);
  }

}
