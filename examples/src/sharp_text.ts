import { initGL2, customSpriteDrawer, Transform, Vec2 } from "kanvas2d"
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

const textDrawer = customSpriteDrawer(gl, `#version 300 es
  precision highp float;
  in vec2 v_uv;
  in vec4 v_color;
  uniform sampler2D u_texture;

  out vec4 out_color;

  float median(vec3 v) {
    return max(min(v.x, v.y), min(max(v.x, v.y), v.z));
  }

  // TODO: replace this by a constant, as in https://github.com/Chlumsky/msdfgen's README
  float screenPxRange() {
    float pxRange = ${font.distance_range.toFixed(10)};
    vec2 unitRange = vec2(pxRange)/vec2(textureSize(u_texture, 0));
    vec2 screenTexSize = vec2(1.0)/fwidth(v_uv);
    return max(0.5*dot(unitRange, screenTexSize), 1.0);
  }

  void main() {
    vec3 raw = texture(u_texture, v_uv).rgb;
    float signed_distance = median(raw) - 0.5;
    // that .7 is a total hack, TODO: revise
    // float alpha = clamp(.7 + signed_distance / fwidth(signed_distance), 0.0, 1.0);
    float alpha = smoothstep(-.1, .1, signed_distance);
    out_color = vec4(vec3(0.), v_color.a * alpha);
    // out_color = vec4(v_color.rgb, v_color.a * alpha);
    out_color.rgb *= out_color.a;
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
  textLine(font, "Hello World!", 54).forEach(({ quad, uvs }) => {
    textDrawer.add({
      transform: transform.actOn(quad),
      // transform: new Transform(new Vec2(50, 50), new Vec2(100, 100), Vec2.zero, 0),
      uvs: uvs,
      color: Color.black,
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
