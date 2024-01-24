import * as twgl from "twgl.js"

export class FullscreenShader {
    private program_info: twgl.ProgramInfo;
    private buffer_info: twgl.BufferInfo;
    private vao_info: twgl.VertexArrayInfo;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        fragment_shader: string,
    ) {
        this.program_info = twgl.createProgramInfo(gl, [
            `#version 300 es
            in vec2 a_clip;
            in vec2 a_uv;

            out vec2 v_uv;

            void main() {
                gl_Position = vec4(a_clip, 0, 1);
                v_uv = a_uv;
            }`,
            fragment_shader
        ]);

        this.buffer_info = twgl.createBufferInfoFromArrays(gl, {
            a_clip: {
                numComponents: 2,
                data: [
                    -1, -1,
                    3, -1,
                    -1, 3,
                ],
            },
            a_uv: {
                numComponents: 2,
                data: [
                    0, 0,
                    2, 0,
                    0, 2,
                ],
            }
        });

        this.vao_info = twgl.createVertexArrayInfo(gl, this.program_info, this.buffer_info);
    }

    draw(uniforms: Record<string, any>): void {
        const gl = this.gl;
        gl.useProgram(this.program_info.program);
        gl.bindVertexArray(this.vao_info.vertexArrayObject!);
        twgl.setUniformsAndBindTextures(this.program_info, uniforms);
        twgl.drawBufferInfo(gl, this.vao_info, gl.TRIANGLES, 3);
    }
}