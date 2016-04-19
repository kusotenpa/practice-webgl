attribute vec3 position;
attribute vec2 textureCoord;

uniform mat4 mvpMatrix;

varying vec2 vTextureCoord;

void main() {
  vTextureCoord = textureCoord;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
