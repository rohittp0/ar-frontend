const vertShaderSource = `
attribute vec2 position;
varying vec2 texCoords;

void main() {
  texCoords = (position + 1.0) / 2.0;
  texCoords.y = 1.0 - texCoords.y;
  gl_Position = vec4(position, 0, 1.0);
}
`;

export const fragShaderDiff = `
precision highp float;
varying vec2 texCoords;

uniform sampler2D textureCurrent;
uniform sampler2D texturePrevious;

float toGrey(vec3 color)
{
    return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
}

float unclamp(float color1, float color2)
{
    if (color1<color2){
        if (color2 - color1 > 0.0){
            return 1.0 - color2 + color1;
        } else {
            return 0.0;
        }
    } else {
        if (color1 - color2 > 0.0){
            return color1 -  color2;
        }
        else {
            return 0.0;
        }
    }
}

void main()
{
    vec4 colorPrev = texture2D(texturePrevious, texCoords);
    vec4 colorCurrent = texture2D(textureCurrent, texCoords);

    if(abs(toGrey(colorPrev.rgb) - toGrey(colorCurrent.rgb)) > 0.1)
    {    
        float red = unclamp(colorCurrent.r, colorPrev.r);
        float green = unclamp(colorCurrent.g, colorPrev.g);
        float blue = unclamp(colorCurrent.b, colorPrev.b);
        gl_FragColor = vec4(red,green,blue,1.0);
    }
    else 
        gl_FragColor = vec4(0,0,0,1.0);
}
`;

export const fragShaderAdd = `
precision highp float;
varying vec2 texCoords;


uniform sampler2D textureCurrent;
uniform sampler2D texturePrevious;

float unclamp(float color1, float color2)
{
    if (color1+color2>1.0){
        return (color2 + color1)-1.0;
    } else {
        return color1 + color2;
    }
}
void main(){
    vec4 colorPrev = texture2D(texturePrevious, texCoords);
    vec4 colorCurrent = texture2D(textureCurrent, texCoords);
    float red = unclamp(colorCurrent.r, colorPrev.r);
    float green = unclamp(colorCurrent.g, colorPrev.g);
    float blue = unclamp(colorCurrent.b, colorPrev.b);

    colorCurrent.rgb = vec3(red, green, blue);
    gl_FragColor = colorCurrent;
}
`;

/**
 * Sets up webgl context for given canvas using provided shader.
 */
function setUpWebGl(canvas: HTMLCanvasElement, fragShaderSource: string): WebGLRenderingContext
{
    const gl = canvas.getContext("webgl2", {preserveDrawingBuffer: true});

    if (!gl) throw "Unable to get WebGL context";

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertShader || !fragShader) throw "Unable to create shaders";

    gl.shaderSource(vertShader, vertShaderSource);
    gl.shaderSource(fragShader, fragShaderSource);

    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    const program = gl.createProgram();

    if (!program) throw "Unable to create program";

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    gl.linkProgram(program);

    gl.useProgram(program);

    const vertices = new Float32Array([
        -1, -1,
        -1, 1,
        1, 1,

        -1, -1,
        1, 1,
        1, -1,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    gl.uniform1i(gl.getUniformLocation(program, "textureCurrent"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "texturePrevious"), 0);

    return gl;
}

/**
* Updates texture at given index using source and draws it.
*/
function updateTexture(gl: WebGLRenderingContext, source: TexImageSource, index: number)
{
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export { setUpWebGl, updateTexture };
