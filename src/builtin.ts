import { m3 } from ".";
import { GenericDrawer } from "./core";
import { Color, IColor, IVec2, Vec2 } from "./geometry";

export class CircleDrawer extends GenericDrawer<{
    center: IVec2,
    radius: number,
    color?: IColor,
}, {
    resolution: IVec2,
}> {
    constructor(
        gl: WebGL2RenderingContext,
        MAX_SPRITES: number = 2048,
    ) {
        super(gl, {
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
        }`, `#version 300 es
        precision highp float;
        in vec2 v_uv;
        in vec4 v_color;

        out vec4 out_color;
        void main() {
            float dist = length(v_uv - .5);
            float wd = fwidth(dist) * 1.25;
            float circle = smoothstep(.5 + wd, .5 - wd, dist);
            out_color = v_color * circle;
            // out_color.rgb *= out_color.a;
        }
        `, {
            N_TRIANGLES_PER_SPRITE: 2,
            N_VERTICES_PER_SPRITE: 4,
            triangles: [[0, 1, 2], [3, 2, 1]],
        }, ({ center, radius, color }) => {
            return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => ({
                a_position: v.sub(Vec2.both(.5)).scale(radius * 2).add(Vec2.fromIVec2(center)),
                a_uv: v,
                a_color: (color === undefined) ? [1, 1, 1, 1] : Color.fromIColor(color),
            }));
        }, ({ resolution }) => {
            let resolution_vec = Vec2.fromIVec2(resolution);
            return {
                u_basis: m3.projection(resolution_vec.x, resolution_vec.y),
            };
        }, MAX_SPRITES);
    }
}