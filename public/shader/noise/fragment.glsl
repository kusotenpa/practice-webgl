precision mediump float;

uniform sampler2D texture;
uniform float time;
uniform float noiseValue;
varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
  vec3 color = texture2D(texture, vUv).rgb;

  vec2 pos = vUv;
  pos *= sin(time);
  float r = rand(pos);

  vec3 noise = vec3(r);

  color = mix(color, noise, noiseValue);

  gl_FragColor = vec4(color, 1.0).rgba;
}
