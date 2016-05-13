precision mediump float;

uniform vec2 resolution;

void main() {
  vec2 position = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  gl_FragColor = vec4(p, 0.0, 0.0);
}
