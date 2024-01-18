import * as twgl from "twgl.js"
import { GenericDrawer } from "./core";
import { IRect, IVec2, Vec2, Transform } from "./geometry";
import * as m3 from "./m3"
import { CustomSpriteDrawer } from "./quad";
import { StatefulDrawer } from "./stateful";
import { CircleDrawer } from "./builtin";

export { GenericDrawer, StatefulDrawer, initGL2, m3, IRect, IVec2, Vec2, Transform, CustomSpriteDrawer, CircleDrawer };

function initGL2(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
    // Assumption 1: transparent canvas is actually faster
    // Assumption 2: shader outputs are alpha-premultiplied
    // Assumption 3: canvas inner size is the same as display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
    if (gl === null) return null;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 1);
    return gl;
}
