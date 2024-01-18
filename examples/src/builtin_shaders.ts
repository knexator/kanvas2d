import { initGL2, customSpriteDrawer, Transform, Vec2, CircleDrawer } from "kanvas2d"
import * as twgl from "twgl.js"
import { Color } from "./utils";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const gl = initGL2(canvas)!;
gl.clearColor(.5,.5,.5,1);

const circle_drawer = new CircleDrawer(gl);

let last_timestamp = 0;
function every_frame(cur_timestamp: number) {
  // input.startFrame();

  // in seconds
  // let delta_time = (cur_timestamp - last_timestamp) / 1000;
  // last_timestamp = cur_timestamp;

  gl.clear(gl.COLOR_BUFFER_BIT);

  // handle resize
  if (twgl.resizeCanvasToDisplaySize(canvas)) {
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  circle_drawer.add({center: new Vec2(100, 100), radius: 40, color: new Color(1,0,0,1)});
  circle_drawer.add({center: new Vec2(200, 100), radius: 40, color: new Color(0,1,0,1)});
  circle_drawer.add({center: new Vec2(150, 100 + 100 * Math.sqrt(3) / 2), radius: 40, color: new Color(0,0,1,1)});

  circle_drawer.end({resolution: [canvas.clientWidth, canvas.clientHeight]});

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
