export const fragShaderDiff = `
#define KERNEL_SIZE 3
#define KERNEL_SIZE_FLOAT 3.0
#define FRAME_SIZE_INV 0.00390625

precision highp float;
varying vec2 texCoords;

uniform sampler2D textureCurrent;
uniform sampler2D texturePrevious;

float diff(vec3 color1, vec3 color2)
{
    return abs(color1.r - color2.r) + abs(color1.g - color2.g) + abs(color1.b - color2.b);
}

float getNeighbourhoodAverage(const sampler2D texture1, const sampler2D texture2)
{
    float sum = 0.0;
    
    for (int i = -KERNEL_SIZE; i <= KERNEL_SIZE; i++)
    {
        for (int j = -KERNEL_SIZE; j <= KERNEL_SIZE; j++)
        {
            vec2 offset = vec2(i, j) * vec2(FRAME_SIZE_INV, FRAME_SIZE_INV);
            
            vec4 color1 = texture2D(texture1, texCoords + offset);
            vec4 color2 = texture2D(texture2, texCoords + offset);
            
            sum += diff(color1.rgb, color2.rgb) * 
            ((6.0 - abs( float(i) ) + abs( float(j) ) ) / KERNEL_SIZE_FLOAT );
        }
    }
    
    return sum / (KERNEL_SIZE_FLOAT * KERNEL_SIZE_FLOAT) / 3.0;
}  

void main()
{
    vec4 colorPrev = texture2D(texturePrevious, texCoords);
    vec4 colorCurrent = texture2D(textureCurrent, texCoords);

    if(getNeighbourhoodAverage(texturePrevious, textureCurrent) > 0.2)
        gl_FragColor = vec4(colorCurrent.r,colorCurrent.g,colorCurrent.b,1.0);
    else 
        gl_FragColor = vec4(0,0,0,0.0);
}
`;
