precision mediump float;

uniform vec2 resolution;   // フレームバッファの解像度
uniform sampler2D texture; // 前フレームの座標が格納されたテクスチャ
uniform vec2 mouse;        // マウスカーソル座標（正規化済み）
uniform bool mouseFlag;    // マウスボタンが押されているかのフラグ
uniform float velocity;    // 加速度係数（初期値は 0.0）
const float SPEED = 0.05;  // パーティクルの速度係数
void main(){
  vec2 p = gl_FragCoord.xy / resolution;  // テクスチャ座標を計算
  vec4 t = texture2D(texture, p);         // 前フレームの座標読み出し
  vec2 v = normalize(mouse - t.xy) * 0.2; // カーソル位置へのベクトル
  vec2 w = normalize(v + t.zw);           // ハーフベクトルで向きを補正

  // テクスチャから読みだした値（vec4）は……
  // XY が頂点の座標を、ZW で頂点の進行方向ベクトルを表している
  vec4 destColor = vec4(t.xy + w * SPEED * velocity, w);

  // ドラッグされてない場合は前回の進行方向を維持する
  if(!mouseFlag){destColor.zw = t.zw;}
  gl_FragColor = destColor;
}