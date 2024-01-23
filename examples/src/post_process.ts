import { GenericDrawer, initGL2, m3, Vec2 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color, Rectangle } from "./utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;

// twgl.createFramebufferInfo(gl, )

// pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);

// xBuffer = WebGLRenderTarget


// // create to render to
// const targetTextureWidth = 256;
// const targetTextureHeight = 256;
// const targetTexture = gl.createTexture()!;
// gl.bindTexture(gl.TEXTURE_2D, targetTexture);

// {
//   // define size and format of level 0
//   const level = 0;
//   const internalFormat = gl.RGBA;
//   const border = 0;
//   const format = gl.RGBA;
//   const type = gl.UNSIGNED_BYTE;
//   const data = null;
//   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
//     targetTextureWidth, targetTextureHeight, border,
//     format, type, data);

//   // set the filtering so we don't need mips
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// }

// // Create and bind the framebuffer
// const fb = gl.createFramebuffer();
// gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

// // attach the texture as the first color attachment
// const attachmentPoint = gl.COLOR_ATTACHMENT0;
// gl.framebufferTexture2D(
//   gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, 0);

let pp_texture = twgl.createTexture(gl, { width: 256, height: 256, minMag: gl.LINEAR });
let pp_bufferinfo = twgl.createFramebufferInfo(gl, [{ attachment: pp_texture }], 256, 256);


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
  }`, { N_TRIANGLES_PER_SPRITE: 2, N_VERTICES_PER_SPRITE: 4, triangles: [[0, 1, 2], [3, 2, 1]] },
  ({ top_left, size, uvs, color }) => {
    return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => {
      return {
        a_position: top_left.add(v.mul(size)),
        // uv: uvs.at(v),
        a_uv: uvs.top_left.add(v.mul(uvs.size)),
        a_color: color.toArray(),
      }
    });
  },
  ({ time, texture }) => {
    return {
      u_time: time,
      u_texture: texture,
      u_basis: m3.translate(m3.projection(canvas.clientWidth, canvas.clientHeight), 100, 100),
    };
  }, 16);

let last_timestamp = 0;
function every_frame(cur_timestamp: number) {
  // input.startFrame();

  // in seconds
  // let delta_time = (cur_timestamp - last_timestamp) / 1000;
  // last_timestamp = cur_timestamp;

  // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  // gl.viewport(0, 0, 256, 256);
  twgl.bindFramebufferInfo(gl, pp_bufferinfo);

  // handle resize
  // if (twgl.resizeCanvasToDisplaySize(canvas)) {
  //   gl.viewport(0, 0, canvas.width, canvas.height);
  // }

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

  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  // gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  twgl.bindFramebufferInfo(gl, null);

  my_sprite_drawer.add({
    top_left: new Vec2(0, 0),
    size: new Vec2(500, 500),
    uvs: Rectangle.unit,
    color: Color.white,
  });
  // my_sprite_drawer.end({ time: cur_timestamp * .001, texture: pp_texture });
  my_sprite_drawer.end({ time: cur_timestamp * .001, texture: pp_bufferinfo.attachments[0] });

  requestAnimationFrame(every_frame);
}

requestAnimationFrame(every_frame);
