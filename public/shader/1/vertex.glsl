attribute vec3 position;
attribute vec4 color;
attribute vec2 textureCoord;

uniform mat4 mvpMatrix;

varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
  vColor = vec4(color.rgb, 1.0);
  vTextureCoord = textureCoord;
  gl_PointSize = 1.0;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
