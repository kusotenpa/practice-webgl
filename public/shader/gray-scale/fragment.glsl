precision mediump float;

uniform sampler2D texture;

varying vec2 vTextureCoord;

const float redScale = 0.298912;
const float greenScale = 0.586611;
const float blueScale = 0.114478;
const vec3 monochromeScale = vec3(redScale, greenScale, blueScale);

void main() {
  vec4 smpColor = texture2D(texture, vTextureCoord);
  float grayColor = dot(smpColor.rgb, monochromeScale);
  gl_FragColor = vec4(vec3(smpColor), 1.0);
}


