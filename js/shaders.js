/**
 * shaders.js – GLSL ที่ใช้ในฉาก (ใส่เป็นสตริงตรง ๆ เพื่อให้รันได้โดยไม่ต้อง build)
 *  - theme*  : shader ของห้อง (ผสมกลางวัน/กลางคืน + ปรับโทนสี)
 *  - smoke*  : ควันกาแฟ
 */

export const themeVertexShader = `varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vUv = uv;
}`;

export const themeFragmentShader = `uniform sampler2D uDayTexture1;
uniform sampler2D uNightTexture1;
uniform sampler2D uDayTexture2;
uniform sampler2D uNightTexture2;
uniform sampler2D uDayTexture3;
uniform sampler2D uNightTexture3;
uniform sampler2D uDayTexture4;
uniform sampler2D uNightTexture4;
uniform float uMixRatio;
uniform int uTextureSet;

// ---- Room colour-tone remap (see "room" in src/config.js) ----
uniform float uToneEnabled;
uniform float uSourceHue;   // 0..1  hue that gets replaced (purple / pink)
uniform float uSourceRange; // 0..1  half width of the replaced hue band
uniform float uTargetHue;   // 0..1  new hue
uniform float uSpread;      // 0..1  how much of the original hue variety to keep
uniform float uSaturation;
uniform float uBrightness;

varying vec2 vUv;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 remapTone(vec3 rgb) {
    vec3 hsv = rgb2hsv(rgb);

    // signed shortest distance on the hue circle, -0.5 .. 0.5
    float d = hsv.x - uSourceHue;
    d = d - floor(d + 0.5);

    // 1 inside the band, fades to 0 towards the edges
    float w = 1.0 - smoothstep(uSourceRange * 0.55, uSourceRange, abs(d));
    // near-grey pixels have no meaningful hue -> leave them alone
    w *= smoothstep(0.015, 0.09, hsv.y);

    float newHue = uTargetHue + d * uSpread;
    hsv.x = fract(mix(hsv.x, newHue, w));
    hsv.y = clamp(hsv.y * mix(1.0, uSaturation, w), 0.0, 1.0);
    hsv.z = clamp(hsv.z * mix(1.0, uBrightness, w), 0.0, 1.0);

    return hsv2rgb(hsv);
}

void main() {
    vec3 dayColor;
    vec3 nightColor;
    
    if(uTextureSet == 1) {
        dayColor = texture2D(uDayTexture1, vUv).rgb;
        nightColor = texture2D(uNightTexture1, vUv).rgb;
    } else if(uTextureSet == 2) {
        dayColor = texture2D(uDayTexture2, vUv).rgb;
        nightColor = texture2D(uNightTexture2, vUv).rgb;
    } else if(uTextureSet == 3) {
        dayColor = texture2D(uDayTexture3, vUv).rgb;
        nightColor = texture2D(uNightTexture3, vUv).rgb;
    } else {
        dayColor = texture2D(uDayTexture4, vUv).rgb;
        nightColor = texture2D(uNightTexture4, vUv).rgb;
    }
    
    vec3 finalColor = mix(dayColor, nightColor, uMixRatio);

    // Remove and add the other #includes if you want your glass to be unaffected
    finalColor = pow(finalColor, vec3(1.0/2.2));

    if(uToneEnabled > 0.5) {
        finalColor = remapTone(finalColor);
    }

    gl_FragColor = vec4(finalColor, 1.0);

    // Use this instead of the pow() calculation to avoid issues with the glass
    // I actually just like the white looking glass better.
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}
`;

export const smokeVertexShader = `uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

void main()
{
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(
        uPerlinTexture,
        vec2(0.5, uv.y * 0.2 - uTime * 0.01)
    ).r;
    float angle = twistPerlin * 3.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5,
        texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5
    );
    windOffset *= pow(uv.y, 2.0) * 1.5;
    newPosition.xz += windOffset;

    // Final position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Varyings
    vUv = uv;
}`;

export const smokeFragmentShader = `uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main()
{
    // Scale and animate
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.04;

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r;

    // Remap
    smoke = smoothstep(0.4, 1.0, smoke);

    // Edges
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.4, vUv.y);

    // Final color
    gl_FragColor = vec4(1, 1, 1, smoke);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`;
