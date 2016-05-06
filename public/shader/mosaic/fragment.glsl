precision mediump float;

uniform sampler2D texture;
varying vec2 vUv;
const float mosaicSize = 100.0;

void main() {
  vec2 uv = floor(vUv * mosaicSize) / mosaicSize;
  vec3 color = texture2D(texture, uv).rgb;
  gl_FragColor = vec4(color, 1.0);
}