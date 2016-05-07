precision mediump float;

uniform sampler2D texture;
uniform float mosaicSize;
varying vec2 vUv;

void main() {
  vec2 uv = floor(vUv * mosaicSize) / mosaicSize;
  vec3 color = texture2D(texture, uv).rgb;
  gl_FragColor = vec4(color, 1.0);
}