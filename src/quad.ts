import { m3 } from ".";
import { GenericDrawer } from "./core";
import { IRect, IVec2, IColor, Transform, Vec2, Color } from "./geometry";

// TODO: update doc
/**
 * Draw sprites using a custom fragment shader.
 * You get varyings for uv, color, & an extrac vec4 property. 
 * Default uniforms are the time, a texture, and a texture_extra.
 * Using all properties, your shader would look like this:
 * ```glsl
 * #version 300 es
 * precision highp float;
 * in vec2 v_uv;
 * in vec4 v_color;
 * in vec4 v_extra;
 * sampler2D u_texture;
 * sampler2D u_texture_extra;
 * float u_time;
 * 
 * out vec4 out_color;
 * void main() {...}
 * ```
 * @param gl WebGL2 context.
 * @param fragment_shader your fragment shader.
 * @param MAX_SPRITES the max number of sprites you expect to draw.
 * @returns An object for drawing sprites with your custom fragment shader.
 */
export class CustomSpriteDrawer extends GenericDrawer<{
    transform: Transform | IRect,
    uvs?: IRect | Transform,
    color?: IColor,
    extra?: IColor,
}, {
    resolution: IVec2,
    texture?: WebGLTexture,
    texture_extra?: WebGLTexture,
    time?: number,
}> {
    constructor(gl: WebGL2RenderingContext, fragment_shader: string, MAX_SPRITES?: number) {
        super(gl, {
            a_position: { dimension: 2 },
            a_uv: { dimension: 2 },
            a_color: { dimension: 4 },
            a_extra: { dimension: 4 },
        }, `#version 300 es
        uniform mat3 u_basis;
        
        in vec2 a_position;
        in vec2 a_uv;
        in vec4 a_color;
        in vec4 a_extra;

        out vec2 v_uv;
        out vec4 v_color;
        out vec4 v_extra;

        void main() {
            gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
            v_uv = a_uv;
            v_color = a_color;
            v_extra = a_extra;
        }`, fragment_shader, {
            N_TRIANGLES_PER_SPRITE: 2,
            N_VERTICES_PER_SPRITE: 4,
            triangles: [[0, 1, 2], [3, 2, 1]],
        }, ({ transform, uvs, color, extra }) => {
            return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => ({
                a_position: Transform.fromIRect(transform).globalFromLocal(v),
                a_uv: (uvs === undefined) ? v : Transform.fromIRect(uvs).globalFromLocal(v),
                a_color: (color === undefined) ? [1, 1, 1, 1] : Color.fromIColor(color),
                a_extra: (extra === undefined) ? [0, 0, 0, 0] : Color.fromIColor(extra),
            }));
        }, ({ resolution, texture, texture_extra, time }) => {
            let resolution_vec = Vec2.fromIVec2(resolution);
            return {
                u_basis: m3.projection(resolution_vec.x, resolution_vec.y),
                u_texture: texture,
                u_texture_extra: texture_extra,
                u_time: time,
            };
        }, MAX_SPRITES);
    }
}
