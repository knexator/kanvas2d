import { initGL2, customSpriteDrawer, Transform, Vec2 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color, Rectangle } from "./utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;

let example_texture_nearest = await new Promise<WebGLTexture>((resolve, reject) => {
  twgl.createTexture(gl, {
    src: new URL(`../images/pumpkin.png`, import.meta.url).href,
    minMag: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE,
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

let example_texture_linear = await new Promise<WebGLTexture>((resolve, reject) => {
  twgl.createTexture(gl, {
    src: new URL(`../images/pumpkin.png`, import.meta.url).href,
    minMag: gl.LINEAR,
    wrap: gl.CLAMP_TO_EDGE,
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

const standardPixelArt = customSpriteDrawer(gl, `#version 300 es
  precision highp float;
  in vec2 v_uv;

  uniform sampler2D u_texture;
  uniform float u_time;

  out vec4 out_color;
  void main() {
    // Assume texture is premultiplied
    vec4 texture = texture(u_texture, v_uv);
    out_color = texture;
  }`);


const aaPixelArt = customSpriteDrawer(gl, `#version 300 es
  precision highp float;
  in vec2 v_uv;

  uniform sampler2D u_texture;
  uniform float u_time;

  vec4 texture2DAA(sampler2D tex, vec2 uv) {
    vec2 texsize = vec2(textureSize(tex,0));
    vec2 uv_texspace = uv*texsize;
    vec2 seam = floor(uv_texspace+.5);
    uv_texspace = (uv_texspace-seam)/fwidth(uv_texspace)+seam;
    uv_texspace = clamp(uv_texspace, seam-.5, seam+.5);
    return texture(tex, uv_texspace/texsize);
  }

  out vec4 out_color;
  void main() {
    out_color = texture2DAA(u_texture, v_uv);

    // vec2 pix = v_uv;

    // // apply aa algorithm
    // pix = floor(pix) + min(fract(pix) / fwidth(pix), 1.0) - 0.5;

    // // for slightly sharper aa, change the above line to
    // // pix = floor(pix) + smoothstep(0.0, 1.0, fract(pix) / fwidth(pix)) - 0.5;

    // out_color = texture(u_texture, pix);
  }`);

let last_timestamp = 0;
function every_frame(cur_timestamp: number) {
  // input.startFrame();

  // in seconds
  // let delta_time = (cur_timestamp - last_timestamp) / 1000;
  // last_timestamp = cur_timestamp;

  // handle resize
  if (twgl.resizeCanvasToDisplaySize(canvas)) {
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  standardPixelArt.add({
    transform: new Transform(new Vec2(150, 150), Vec2.both(100 + 20 * Math.sin(cur_timestamp * .001)), Vec2.half, cur_timestamp * .001),
  });
  standardPixelArt.end({resolution: [canvas.clientWidth, canvas.clientHeight], texture: example_texture_nearest, time: cur_timestamp * .001});

  aaPixelArt.add({
    transform: new Transform(new Vec2(350, 150), Vec2.both(100 + 20 * Math.sin(cur_timestamp * .001)), Vec2.half, cur_timestamp * .001),
  });
  aaPixelArt.end({resolution: [canvas.clientWidth, canvas.clientHeight], texture: example_texture_linear, time: cur_timestamp * .001});

  requestAnimationFrame(every_frame);
}

requestAnimationFrame(every_frame);
