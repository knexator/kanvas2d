import { initGL2, CustomSpriteDrawer, Transform, Vec2 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color } from "./utils";
import font_metadata from "../fonts/consolas.json"
import { createFont, textLine } from "./font_utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;

let font_atlas = await new Promise<WebGLTexture>((resolve, reject) => {
  twgl.createTexture(gl, {
    src: new URL(`../fonts/consolas.png`, import.meta.url).href,
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

let font = createFont(font_metadata, font_atlas, '?');

const textDrawer = new CustomSpriteDrawer(gl, `#version 300 es
  precision highp float;
  in vec2 v_uv;
  in vec4 v_color;
  in vec4 v_extra; // x component used to store the scale
  uniform sampler2D u_texture;

  out vec4 out_color;

  float median(vec3 v) {
    return max(min(v.x, v.y), min(max(v.x, v.y), v.z));
  }

  // for an explanation of antialiasing, see https://github.com/Chlumsky/msdfgen's README
  void main() {
    vec3 raw = texture(u_texture, v_uv).rgb;
    float signed_distance = median(raw) - 0.5;
    float screenPxDistance = v_extra.x * signed_distance;
    float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);
    out_color = v_color * alpha;
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

  let transform = Transform.traslation(new Vec2(100, 100));
  textLine(font, "Hello World!", 54).forEach(({ quad, uvs, scaling_factor }) => {
    textDrawer.add({
      transform: transform.actOn(quad),
      // transform: new Transform(new Vec2(50, 50), new Vec2(100, 100), Vec2.zero, 0),
      uvs: uvs,
      color: Color.black,
      extra: [scaling_factor * transform.size.x, 0, 0, 0],
    });
  });
  textDrawer.end({
    resolution: [canvas.clientWidth, canvas.clientHeight],
    texture: font_atlas,
    time: cur_timestamp * .001,
  });

  // my_sprite_drawer.add({
  //   top_left: new Vec2(50, 50),
  //   size: new Vec2(100, 100),
  //   uvs: Rectangle.unit,
  //   color: Color.white,
  // });
  // my_sprite_drawer.end({ time: cur_timestamp * .001, texture: example_texture_1 });

  // my_sprite_drawer.add({
  //   top_left: new Vec2(250, 50),
  //   size: new Vec2(100, 100),
  //   uvs: Rectangle.unit,
  //   color: Color.white,
  // });
  // my_sprite_drawer.end({ time: cur_timestamp * .001, texture: example_texture_2 });

  requestAnimationFrame(every_frame);
}

requestAnimationFrame(every_frame);
