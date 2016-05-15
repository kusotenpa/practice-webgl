precision mediump float;

uniform sampler2D texture;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(texture, vUv);
  gl_FragColor = vec4(1.0 - color.x, 1.0 - color.y, 1.0 - color.z, 1.0);
}
