import { initGL2, CustomSpriteDrawer, Transform, Vec2 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color } from "./utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;

let example_texture_1 = await new Promise<WebGLTexture>((resolve, reject) => {
  twgl.createTexture(gl, {
    src: new URL(`../images/example.png`, import.meta.url).href,
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

let example_texture_2 = await new Promise<WebGLTexture>((resolve, reject) => {
  twgl.createTexture(gl, {
    src: new URL(`../images/statue.png`, import.meta.url).href,
    minMag: gl.NEAREST,
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

const wobblySprites = new CustomSpriteDrawer(gl, `#version 300 es
  precision highp float;
  in vec2 v_uv;
  in vec4 v_color;

  uniform sampler2D u_texture;
  uniform float u_time;

  out vec4 out_color;
  void main() {
    // Assume texture is premultiplied
    vec4 texture = texture(u_texture, v_uv);
    vec4 color = vec4(${Color.fromHex("#FF9500").toArray().join(',')});
    out_color = mix(
      texture,
      color,
      smoothstep(.75, .8, v_uv.y + .05 * sin(v_uv.x * 10. + 5. * u_time))
    );
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

  wobblySprites.add({transform: new Transform(new Vec2(50, 50), new Vec2(100, 100), Vec2.zero, 0), uvs: Transform.identity});
  wobblySprites.end({resolution: [canvas.clientWidth, canvas.clientHeight], texture: example_texture_1, time: cur_timestamp * .001});

  wobblySprites.add({transform: new Transform(new Vec2(250, 50), new Vec2(100, 100), Vec2.zero, 0), uvs: Transform.identity});
  wobblySprites.end({resolution: [canvas.clientWidth, canvas.clientHeight], texture: example_texture_2, time: cur_timestamp * .001});

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
