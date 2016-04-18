precision mediump float;

uniform vec2 resolution;
varying vec4 vColor;

void main() {
  vec2 position = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  gl_FragColor = vColor;
}
