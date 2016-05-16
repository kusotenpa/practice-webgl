precision mediump float;

uniform vec2 resolution;
uniform float time;
const int ITERATION = 300;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec2 z = vec2(0, 0);
  vec2 zNext = vec2(0, 0);
  vec2 c = p.xy;
  bool isDiverge = false;
  int elapsed = 0;

  for (int i = 0; i < ITERATION; i++) {
    zNext.x = pow(z.x, 2.0) - pow(z.y, 2.0);
    zNext.y = 2.0 * z.x * z.y;
    z = zNext + c;

    if (length(z) > 2.0) {
      isDiverge = true;
      break;
    }

    elapsed = i;
  }

  if (isDiverge) {
    gl_FragColor = vec4(vec3(0.0), 1.0);

  } else {
    gl_FragColor = vec4(1.0);

  }

}
