attribute vec3 position;
attribute vec4 color;
uniform mat4 mvpMatrix;

void main() {
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
