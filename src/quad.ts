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

export type DefaultSpriteData = {
    transform: Transform | IRect,
    uvs?: IRect | Transform,
    color?: IColor,
};

export type DefaultGlobalData = {
    resolution: IVec2,
}

export class CustomSpriteDrawer<
SpriteData extends Record<string, any>,
GlobalData extends Record<string, any>,
> extends GenericDrawer<SpriteData, GlobalData> {
    constructor(
        gl: WebGL2RenderingContext,
        fragment_shader: string,
        my_global?: (data: GlobalData) => Record<string, any> & {
            resolution: IVec2,
        },
        extra_sprite_data: Record<string, { dimension: number }> = {},
        my_add?: (data: SpriteData) => {
            transform: Transform | IRect,
            uvs?: IRect | Transform,
            color?: IColor,
            custom_data: { [key in keyof typeof extra_sprite_data]: number | number[] | IVec2 },
        },
    ) {
        let default_attrs = {
            a_position: { dimension: 2 },
            a_uv: { dimension: 2 },
            a_color: { dimension: 4 },
        };
        let vertex_shader = `#version 300 es
        uniform mat3 u_basis;
        
        in vec2 a_position;
        in vec2 a_uv;
        in vec4 a_color;

        ${Object.entries(extra_sprite_data).map(([name, data]) => {
            return `in ${['float', 'vec2', 'vec3', 'vec4'][data.dimension - 1]} ${name};`
        }).join('\n')}

        out vec2 v_uv;
        out vec4 v_color;
        ${Object.entries(extra_sprite_data).map(([name, data]) => {
            return `out ${['float', 'vec2', 'vec3', 'vec4'][data.dimension - 1]} v_${name};`
        }).join('\n')}

        void main() {
            gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
            v_uv = a_uv;
            v_color = a_color;
            ${Object.entries(extra_sprite_data).map(([name, data]) => {
            return `v_${name} = ${name};`
        }).join('\n')}
        }`;
        super(gl, { ...extra_sprite_data, ...default_attrs },
            vertex_shader, fragment_shader, {
            N_TRIANGLES_PER_SPRITE: 2,
            N_VERTICES_PER_SPRITE: 4,
            triangles: [[0, 1, 2], [3, 2, 1]],
        }, (sprite_data) => {
            const { transform, uvs, color, custom_data } = my_add === undefined ? sprite_data : my_add(sprite_data);
            return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => ({
                a_position: Transform.fromIRect(transform).globalFromLocal(v),
                a_uv: (uvs === undefined) ? v : Transform.fromIRect(uvs).globalFromLocal(v),
                a_color: (color === undefined) ? [1, 1, 1, 1] : Color.fromIColor(color),
                ...custom_data
            }));
        }, (global_data) => {
            const { resolution, ...extra_data } = my_global === undefined ? global_data : my_global(global_data);
            const resolution_vec = Vec2.fromIVec2(resolution);
            return {
                u_basis: m3.projection(resolution_vec.x, resolution_vec.y),
                ...extra_data
            }
        });
    }
}
