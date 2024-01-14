import { GenericDrawer, initGL2, m3 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color, Rectangle, Vec2 } from "./utils";

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
  }, (err, texture) => (err === null) ? resolve(texture) : reject(err));
});

let my_sprite_drawer = new GenericDrawer<{
  top_left: Vec2,
  size: Vec2,
  uvs: Rectangle,
  color: Color,
}, {
  time: number,
  texture: WebGLTexture,
}>(gl, {
  a_position: { dimension: 2 },
  a_uv: { dimension: 2 },
  a_color: { dimension: 4 },
}, `#version 300 es
  uniform mat3 u_basis;

  in vec2 a_position;
  in vec2 a_uv;
  in vec4 a_color;

  out vec2 v_uv;
  out vec4 v_color;

  void main() {
    gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
    v_uv = a_uv;
    v_color = a_color;
  }`,
  `#version 300 es
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

    // texture.rgb = mix(
    //   texture.rgb,
    //   vec3(${Color.fromHex("#FF9500").toArray().slice(0, 3).join(',')}),
    //   smoothstep(.75, .8, v_uv.y + .05 * sin(v_uv.x * 10. + 5. * u_time))
    // );
    // out_color = texture;

    // // Assume colors are not premultiplied
    // vec4 color = vec4((texture.rgb * v_color.rgb) * v_color.a, v_color.a * texture.a);
    // color.rgb = mix(
    //   color.rgb,
    //   vec3(${Color.fromHex("#FF9500").toArray().slice(0, 3).join(',')}) * v_color.a * texture.a,
    //   smoothstep(.75, .8, v_uv.y + .05 * sin(v_uv.x * 10. + 5. * u_time))
    // );
    
    // out_color = vec4(v_uv, 0.0, 1.0);
    // out_color = color;
  }`, { N_TRIANGLES_PER_SPRITE: 2, N_VERTICES_PER_SPRITE: 4, triangles: [[0, 1, 2], [3, 2, 1]] },
  ({ top_left, size, uvs, color }) => {
    return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => {
      return {
        a_position: top_left.add(v.mul(size)),
        // uv: uvs.at(v),
        a_uv: uvs.topLeft.add(v.mul(uvs.size)),
        a_color: color.toArray(),
      }
    });
  },
  ({ time, texture }) => {
    return {
      u_time: time,
      u_texture: texture,
      u_basis: m3.projection(canvas.clientWidth, canvas.clientHeight),
    };
  }, 16);

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

  my_sprite_drawer.add({
    top_left: new Vec2(50, 50),
    size: new Vec2(100, 100),
    uvs: Rectangle.unit,
    color: Color.white,
  });
  my_sprite_drawer.end({ time: cur_timestamp * .001, texture: example_texture_1 });

  my_sprite_drawer.add({
    top_left: new Vec2(250, 50),
    size: new Vec2(100, 100),
    uvs: Rectangle.unit,
    color: Color.white,
  });
  my_sprite_drawer.end({ time: cur_timestamp * .001, texture: example_texture_2 });

  requestAnimationFrame(every_frame);
}

requestAnimationFrame(every_frame);
