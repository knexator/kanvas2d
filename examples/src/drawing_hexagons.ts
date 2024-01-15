import { GenericDrawer, initGL2, m3, Vec2 } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color, fromCount } from "./utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;

let hex_drawer_simple = new GenericDrawer<{
  center: Vec2,
  radius: number,
  color: Color,
}, {
  }>(
    gl, {
    a_position: { dimension: 2 },
    a_color: { dimension: 4 },
  }, `#version 300 es
  uniform mat3 u_basis;
  
  in vec2 a_position;
  in vec4 a_color;

  out vec4 v_color;
  
  void main() {
    gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
    v_color = a_color;
  }`,
    `#version 300 es
  precision highp float;
  in vec4 v_color;

  out vec4 out_color;
  void main() {
    // Assume colors are not premultiplied
    vec4 color = vec4(v_color.rgb * v_color.a, v_color.a);
    out_color = color;
  }`, {
    N_VERTICES_PER_SPRITE: 7,
    N_TRIANGLES_PER_SPRITE: 6,
    triangles: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 5],
      [0, 5, 6],
      [0, 6, 1],
    ]
  }, ({ center, radius, color }) => {
    const hex_vertices = [Vec2.zero, ...fromCount(6, k => Vec2.fromTurns((k + .5) / 6))]
    return hex_vertices.map(v => {
      return {
        a_position: center.add(v.scale(radius)),
        a_color: color,
      }
    })
  }, () => {
    return {
      u_basis: m3.translate(m3.projection(canvas.clientWidth, canvas.clientHeight), 100, 100),
    };
  }
  );

const hex_drawer_antialiased = new GenericDrawer<{
  center: Vec2,
  radius: number,
  color: Color,
}, {}>(gl, {
  a_position: { dimension: 2 },
  a_uv: { dimension: 2 },
  a_color: { dimension: 4 },
},
  `#version 300 es
  uniform mat3 u_basis;
  
  in vec2 a_position;
  in vec2 a_uv;
  in vec4 a_color;

  out vec2 v_uv;
  out vec4 v_color;
  
  void main() {
    gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
    v_color = a_color;
    v_uv = a_uv;
  }`,
  `#version 300 es
  precision highp float;
  in vec2 v_uv;
  in vec4 v_color;

  out vec4 out_color;
  void main() {
    float is_border = smoothstep(1., 1. - v_uv.y, v_uv.x);
    // Assume colors are not premultiplied
    vec4 color = vec4(v_color.rgb * v_color.a, v_color.a);
    out_color = color * is_border;
  }`, {
  N_VERTICES_PER_SPRITE: 7,
  N_TRIANGLES_PER_SPRITE: 6,
  triangles: [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 5],
    [0, 5, 6],
    [0, 6, 1],
  ]
}, ({ center, radius, color }) => {
  const hex_vertices = [Vec2.zero, ...fromCount(6, k => Vec2.fromTurns((k + .5) / 6))]
  return hex_vertices.map((v, k) => {
    return {
      a_position: center.add(v.scale(radius + 1)),
      a_uv: k === 0 ? Vec2.zero : new Vec2(1.0, 1 / radius),
      a_color: color,
    }
  })
}, () => {
  return {
    u_basis: m3.translate(m3.projection(canvas.clientWidth, canvas.clientHeight), 100, 100),
  };
});


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

  hex_drawer_simple.add({ center: new Vec2(100, 100), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_simple.add({ center: new Vec2(200, 100), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_simple.add({ center: new Vec2(300, 100), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_simple.add({ center: new Vec2(100, 100).add(Vec2.fromTurns(1 / 6).scale(100)), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_simple.add({ center: new Vec2(200, 100).add(Vec2.fromTurns(1 / 6).scale(100)), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_simple.end({});

  hex_drawer_antialiased.add({ center: new Vec2(100, 300), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_antialiased.add({ center: new Vec2(200, 300), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_antialiased.add({ center: new Vec2(300, 300), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_antialiased.add({ center: new Vec2(100, 300).add(Vec2.fromTurns(1 / 6).scale(100)), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_antialiased.add({ center: new Vec2(200, 300).add(Vec2.fromTurns(1 / 6).scale(100)), radius: 50, color: Color.fromInt(0xBB33DD) });
  hex_drawer_antialiased.end({});

  requestAnimationFrame(every_frame);
}

requestAnimationFrame(every_frame);
