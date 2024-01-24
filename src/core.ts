import * as twgl from "twgl.js"
// import * as m3 from "./m3";

type Attribute = {
    name: string;
    dimension: number;
    cpu_buffer: Float32Array;
};

export type IVec = number[] | {toArray: () => number[]};

/**
 * The base class of the library; everything else is implemented using this class.
 * @typeParam SpriteData - Per-sprite data; the parameters for the instance's `.add(..)` method.
 * @typeParam GlobalData - Per-drawcall data; the parameters for the instance's `.end(..)` method.
 */
export class GenericDrawer<SpriteData extends Record<string, any>, GlobalData extends Record<string, any>> {
    private attributes: Attribute[];
    private program_info: twgl.ProgramInfo;
    private buffer_info: twgl.BufferInfo;
    private vao_info: twgl.VertexArrayInfo;

    public _n_queued: number;
    public readonly _MAX_SPRITES: number;

    private readonly N_VERTICES_PER_SPRITE: number;
    private readonly N_TRIANGLES_PER_SPRITE: number;

    // private _scratchpad_matrix: Float32Array;

    /**
     * Create a new GenericDrawer.
     * @param gl 
     * @param vertex_spec stuff, etc
     * @param vertex_shader 
     * @param fragment_shader 
     * @param param4 
     * @param vertexDataFromSpriteData 
     * @param getGlobalData 
     * @param MAX_SPRITES 
     */
    constructor(
        private readonly gl: WebGL2RenderingContext,
        vertex_spec: Record<string, {dimension: number}>,
        vertex_shader: string,
        fragment_shader: string, 
        // vertex_spec: Record<keyof VertexData, any>,
        // vertex_spec: Record<keyof VertexData, twgl.FullArraySpec>,
        // vertex_spec: { [key: keyof VertexData]: twgl.FullArraySpec },
        {N_VERTICES_PER_SPRITE, N_TRIANGLES_PER_SPRITE, triangles}: {
            N_VERTICES_PER_SPRITE: number,
            N_TRIANGLES_PER_SPRITE: number,
            triangles: [number, number, number][],
        },
        // private vertexDataFromSpriteData: (data: SpriteData) => VertexData[],
        // private vertexDataFromSpriteData: (data: SpriteData) => (typeof vertex_spec)[],
        // private vertexDataFromSpriteData: (data: SpriteData) => ({[key: keyof (typeof vertex_spec)]: any})[],
        // private vertexDataFromSpriteData: (data: SpriteData) => ({[key: keyof typeof vertex_spec]: any})[],
        private vertexDataFromSpriteData: (data: SpriteData) => ({[key in keyof typeof vertex_spec]: number | number[] | IVec})[],
        private getGlobalData: (data: GlobalData) => Record<string, any>,
        // private vertexDataFromSpriteData: (data: SpriteData, x: typeof vertex_spec) => ({[key in (keyof typeof vertex_spec)]: any})[],
        MAX_SPRITES: number = 256,
    ) {
        // if (triangles.set() !== [0..N_VERTICES_PER_SPRITE]) throw new Error("stuff");
        if (triangles.length !== N_TRIANGLES_PER_SPRITE) throw new Error(`Expected ${N_TRIANGLES_PER_SPRITE} triangles, got ${triangles.length}`);

        this._MAX_SPRITES = MAX_SPRITES;
        this.N_TRIANGLES_PER_SPRITE = N_TRIANGLES_PER_SPRITE;
        this.N_VERTICES_PER_SPRITE = N_VERTICES_PER_SPRITE;

        this.program_info = twgl.createProgramInfo(gl, [vertex_shader, fragment_shader]);
        // this.position = new MyBuffer(gl, 2, MAX_SPRITES);
        // this.uv = new MyBuffer(gl, 2, MAX_SPRITES);
        // this.color = new MyBuffer(gl, 4, MAX_SPRITES);

        const vertex_indices = new Uint16Array(MAX_SPRITES * triangles.length * 3);
        for (let sprite_n = 0; sprite_n < MAX_SPRITES; sprite_n++) {
            for (let triangle_n = 0; triangle_n < triangles.length; triangle_n++) {
                vertex_indices[sprite_n * triangles.length * 3 + triangle_n * 3 + 0] = sprite_n * N_VERTICES_PER_SPRITE + triangles[triangle_n][0];
                vertex_indices[sprite_n * triangles.length * 3 + triangle_n * 3 + 1] = sprite_n * N_VERTICES_PER_SPRITE + triangles[triangle_n][1];
                vertex_indices[sprite_n * triangles.length * 3 + triangle_n * 3 + 2] = sprite_n * N_VERTICES_PER_SPRITE + triangles[triangle_n][2];
            }
        }

        // this.cpu_buffers = Object.fromEntries(vertex_spec)
        // 4 bytes per number
        // 2 numbers, 4 bytes per number
        // this.position_cpu = new Float32Array(2 * 4 * MAX_SPRITES);
        // this.uv_cpu = new Float32Array(2 * 4 * MAX_SPRITES);
        // this.color_cpu = new Float32Array(4 * 4 * MAX_SPRITES);

        // for (const attr_name in vertex_spec) {
        //     if (Object.prototype.hasOwnProperty.call(vertex_spec, attr_name)) {
        //         vertex_spec[attr_name].data = vertex_spec[attr_name].numComponents;
        //     }
        // }
        let arrays: twgl.Arrays = {indices: vertex_indices};
        this.attributes = Object.entries(vertex_spec).map(([name, spec]) => {
            const num_values = spec.dimension * N_VERTICES_PER_SPRITE * MAX_SPRITES;
            arrays[name] = {
                data: num_values,
                numComponents: spec.dimension,
                type: Float32Array,
                drawType: gl.DYNAMIC_DRAW,
            }
            return {
                name: name,
                dimension: spec.dimension,
                cpu_buffer: new Float32Array(num_values),
                setAt: () => {},
            };
        });

        // console.log(arrays);
        this.buffer_info = twgl.createBufferInfoFromArrays(gl, arrays);
        // this.buffer_info = twgl.createBufferInfoFromArrays(gl, {
        //     a_position: {
        //         data: 2 * N_VERTICES_PER_SPRITE * MAX_SPRITES,
        //         numComponents: 2,
        //         type: Float32Array,
        //         drawType: gl.DYNAMIC_DRAW,
        //     },
        //     a_uv: {
        //         data: 2 * N_VERTICES_PER_SPRITE * MAX_SPRITES,
        //         numComponents: 2,
        //         type: Float32Array,
        //         drawType: gl.DYNAMIC_DRAW,
        //     },
        //     a_color: {
        //         data: 4 * N_VERTICES_PER_SPRITE * MAX_SPRITES,
        //         numComponents: 4,
        //         type: Float32Array,
        //         drawType: gl.DYNAMIC_DRAW,
        //     },
        //     indices: vertex_indices,
        // });

        this.vao_info = twgl.createVertexArrayInfo(gl, this.program_info, this.buffer_info);
        this._n_queued = 0;
        // this._scratchpad_matrix = new Float32Array(9);
    }

    private static setAt(attr: Attribute, vertex_index: number, data: number | IVec): void {
        // let base_index = vertex_index * attr.dimension;
        let data_array: number[];
        if (typeof data === "number") {
            data_array = [data];
        } else if (Array.isArray(data)) {
            data_array = data;
        } else {
            data_array = data.toArray();
        }
        if (data_array.length !== attr.dimension) {
            throw new Error(`attr ${attr.name} expected ${attr.dimension} components, found ${data_array.length}`);
        }
        for (let k = 0; k<data_array.length; k++) {
            attr.cpu_buffer[vertex_index * attr.dimension + k] = data_array[k];
        }
    }

    add(sprite_params: SpriteData): void {
        if (this._n_queued >= this._MAX_SPRITES) {
            console.warn("Reached the maximum number of sprites, consider increasing MAX_SPRITES")
            throw new Error("");
            // this.end();
        }

        let vertices_data = this.vertexDataFromSpriteData(sprite_params);
        let base_vertex_index = this._n_queued * this.N_VERTICES_PER_SPRITE; 
        vertices_data.forEach((vertex_data, k) => {
            this.attributes.forEach(attr => {
                GenericDrawer.setAt(attr, base_vertex_index + k, vertex_data[attr.name]);
            });
            // this.position_cpu.set()
        });
        this._n_queued += 1;

        // vertex_data

        // for (const attr_name in vertex_data) {
        //     if (Object.prototype.hasOwnProperty.call(vertex_data, attr_name)) {
        //         const element = vertex_data[attr_name];
        //     }
        // }

        // pushVec2sToArray(this.position_cpu, this.n_queued * 2 * this.N_VERTICES,
        //     vertex_data.map(x => x.position));
        // pushVec2sToArray(this.uv_cpu, this.n_queued * 2 * this.N_VERTICES,
        //     vertex_data.map(x => x.uv));
        // pushVec4sToArray(this.color_cpu, this.n_queued * 2 * this.N_VERTICES,
        //     vertex_data.map(x => x.color));
        // this.n_queued += 1;
    }

    end(global_params: GlobalData): void {
        if (this._n_queued === 0) return;

        // console.log("ending, will draw",this.n_queued);
        const gl = this.gl;
        
        this.attributes.forEach(attr => {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_info.attribs![attr.name].buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, attr.cpu_buffer, 0, this._n_queued * this.N_VERTICES_PER_SPRITE * attr.dimension);
        });

        gl.useProgram(this.program_info.program)
        gl.bindVertexArray(this.vao_info.vertexArrayObject!);

        // let canvas = this.gl.canvas as HTMLCanvasElement;
        // m3.projection(canvas.clientWidth, canvas.clientHeight, this._scratchpad_matrix);
        // twgl.setUniformsAndBindTextures(this.program_info, {
        //     u_basis: this._scratchpad_matrix,
        //     u_time: time,
        // });
        twgl.setUniformsAndBindTextures(this.program_info, this.getGlobalData(global_params));

        twgl.drawBufferInfo(gl, this.vao_info, gl.TRIANGLES, this._n_queued * this.N_TRIANGLES_PER_SPRITE * 3);

        this._n_queued = 0;
    }
}

// function initMyDrawer(gl: WebGL2RenderingContext): GenericDrawer<{
//     top_left: Vec2,
//     size: Vec2,
//     uvs: Rectangle,
//     color: Color,
// }, {
//     a_position: Vec2,
//     a_uv: Vec2,
//     a_color: Vec4,
// }> {
//     return new GenericDrawer(gl, twgl.createProgramInfo(gl, [
//         `#version 300 es
//       uniform mat3 u_basis;

//       in vec2 a_position;
//       in vec2 a_uv;
//       in vec4 a_color;

//       out vec2 v_uv;
//       out vec4 v_color;
      
//       void main() {
//         gl_Position = vec4((u_basis * vec3(a_position, 1)).xy, 0, 1);
//         v_uv = a_uv;
//         v_color = a_color;
//       }`,

//         `#version 300 es
//       precision highp float;
//       in vec2 v_uv;
//       in vec4 v_color;

//       uniform sampler2D u_texture;

//       out vec4 out_color;
//       void main() {
//         // Assume texture is premultiplied
//         vec4 texture = texture(u_texture, v_uv);
//         // Assume colors are not premultiplied
//         vec4 color = vec4((texture.rgb * v_color.rgb) * v_color.a, v_color.a * texture.a);
//         out_color = color;
//       }`
//     ]), 4, [[0, 1, 2], [3, 2, 1]],
//     // {
//     //     a_position: {
//     //         numComponents: 2,
//     //         type: Float32Array,
//     //     },
//     //     a_uv: {
//     //         numComponents: 2,
//     //         type: Float32Array,
//     //     },
//     //     a_color: {
//     //         numComponents: 4,
//     //         type: Float32Array,
//     //     }
//     // },
//     {
//         a_position: Vec2,
//         a_uv: Vec2,
//         a_color: Vec4,
//     },
//     ({ top_left, size, uvs, color }) => {
//         return [Vec2.zero, Vec2.xpos, Vec2.ypos, Vec2.one].map(v => {
//             return {
//                 a_position: top_left.add(v.mul(size)),
//                 // uv: uvs.at(v),
//                 a_uv: uvs.topLeft.add(v.mul(uvs.size)),
//                 a_color: new Vec4(...color.toArray()),
//             }
//         });
//     });
// }

// let x = initMyDrawer();
// x.add({})

// let asdf = QuadDrawer({
    
// })
