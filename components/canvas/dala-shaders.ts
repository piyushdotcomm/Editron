import * as THREE from "three";

export const snoiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const rotationMatrixGLSL = `
mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));
  return mat3(uu, vv, ww);
}
`;

export const brainVertexHeader = `
  uniform sampler2D t_scale;
  uniform float u_time;
  uniform float u_scale;
  uniform float u_amplitude;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform vec3 u_rotation;
  uniform vec3 u_offset;
  uniform vec2 u_delta;
  uniform float u_explode;
  uniform float u_progress;
  uniform float u_mobileRotation;

  attribute vec3 a_pos1;
  attribute vec3 a_pos2;
  attribute vec3 a_pos3;
  attribute vec3 a_pos4;

  attribute vec2 a_id;
  attribute vec4 a_random;
  attribute vec4 a_angle;
  attribute float a_index;

  varying vec2 v_id;
  varying vec3 v_pos;
  varying float v_hover;

  ${rotationMatrixGLSL}
  ${snoiseGLSL}
`;

export const brainVertexTransform = `
  vec4 mvPosition = vec4( transformed, 1.0 );

  float pr = clamp(u_progress, 0.0, 3.0);
  vec3 pos = a_pos1;
  pos = mix(pos, a_pos2, clamp(pr, 0.0, 1.0));
  pos = mix(pos, a_pos3, clamp(pr - 1.0, 0.0, 1.0));
  pos = mix(pos, a_pos4, clamp(pr - 2.0, 0.0, 1.0));

  pos = mix(pos, pos * (1.0 + a_random.y * 2.5), u_explode);

  vec2 m = u_mouse * vec2(1.0, 1.0);
  float dist = smoothstep(1.25 + abs(max(u_delta.x, u_delta.y)), 0.0, distance(pos.xy + u_offset.xy, m * u_resolution * 0.5));

  pos.x += dist * sin(u_time * a_random.y) * (a_random.z * 0.35 + u_delta.x) * abs(u_explode - 1.0);
  pos.y += dist * cos(u_time * a_random.y) * (a_random.z * 0.35 + u_delta.y) * abs(u_explode - 1.0);

  float n = snoise(pos * u_amplitude);
  mat4 rotMat2 = rotationMatrix(vec3(0.0, 1.0, 1.0), mod(n + u_time * 0.6, 6.28318));

  float s1 = texture2D(t_scale, a_id).x * u_scale;
  float s2 = texture2D(t_scale, vec2(a_id.x + 0.5, a_id.y)).x * u_scale;
  float s3 = texture2D(t_scale, vec2(a_id.x, a_id.y + 0.5)).x * u_scale;
  float s4 = texture2D(t_scale, vec2(a_id.x + 0.5, a_id.y + 0.5)).x * u_scale;

  float scale = mix(s1, s2, clamp(pr, 0.0, 1.0));
  scale = mix(scale, s3, clamp(pr - 1.0, 0.0, 1.0));
  scale = mix(scale, s4, clamp(pr - 2.0, 0.0, 1.0));
  scale += dist * 0.75 * abs(u_explode - 1.0);

  #ifdef USE_INSTANCING
    mat4 instanceMat = instanceMatrix;
    instanceMat[3][0] += pos.x;
    instanceMat[3][1] += pos.y;
    instanceMat[3][2] += pos.z;

    mat4 rotMat3 = mat4(calcLookAtMatrix(vec3(instanceMat[3][0] + u_offset.x, instanceMat[3][1] + u_offset.y, instanceMat[3][2]), cameraPosition, 0.0));

    instanceMat[0][0] *= scale;
    instanceMat[1][1] *= scale;
    instanceMat[2][2] *= scale;

    if (u_mobileRotation > 0.0) {
      instanceMat *= rotMat3;
    } else {
      instanceMat *= rotMat2;
    }

    mvPosition = instanceMat * mvPosition;
  #endif

  mat4 modViewMatrix = modelViewMatrix;
  modViewMatrix[3][0] += u_offset.x;
  modViewMatrix[3][1] += u_offset.y;
  modViewMatrix *= rotationMatrix(vec3(1.0, 0.0, 0.0), u_rotation.x);
  modViewMatrix *= rotationMatrix(vec3(0.0, 1.0, 0.0), u_rotation.y);
  modViewMatrix *= rotationMatrix(vec3(0.0, 0.0, 1.0), u_rotation.z);

  mvPosition = modViewMatrix * mvPosition;
  v_pos = mvPosition.xyz;
  v_pos.z += 10.0;

  gl_Position = projectionMatrix * mvPosition;

  v_id = a_id;
  v_hover = dist;
`;

export const brainFragmentColor = `
  float pr = clamp(u_progress, 0.0, 3.0);
  vec3 col1 = texture2D(t_color, v_id).xyz;
  vec3 col2 = texture2D(t_color, vec2(v_id.x + 0.5, v_id.y)).xyz;
  vec3 col3 = texture2D(t_color, vec2(v_id.x, v_id.y + 0.5)).xyz;
  vec3 col4 = texture2D(t_color, vec2(v_id.x + 0.5, v_id.y + 0.5)).xyz;

  vec3 col = mix(col1, col2, clamp(pr, 0.0, 1.0));
  col = mix(col, col3, clamp(pr - 1.0, 0.0, 1.0));
  col = mix(col, col4, clamp(pr - 2.0, 0.0, 1.0));

  col = mix(col, vec3(0.45), max(0.0, v_hover - u_explode) * abs(u_explode - 1.0));

  outgoingLight = col * u_colorFactor;
  float alpha = diffuseColor.a * smoothstep(-4.5, 4.0, v_pos.z);
  gl_FragColor = vec4(outgoingLight, alpha);
`;

export const frontFragmentHeader = `
  varying vec4 v_color;
`;

export const frontVertexShader = `
  uniform float u_time;
  uniform float u_scale;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  attribute vec4 a_param;
  attribute vec4 a_angle;
  attribute vec4 a_color;
  varying vec4 v_color;
  ${rotationMatrixGLSL}
`;

export const frontVertexTransform = `
  mat4 rotMat = rotationMatrix(vec3(a_angle.x, a_angle.y, a_angle.z), mod(a_angle.w * u_time * 0.15, 6.28318));
  vec4 mvPosition = vec4( transformed, 1.0 );
  v_color = a_color;

  #ifdef USE_INSTANCING
    mat4 instanceMat = instanceMatrix;
    float zFactor = ((instanceMat[3][2] - 0.0) / 9.0) * (0.2 - 0.5) + 0.5;
    instanceMat[3][0] = instanceMat[3][0] * u_resolution.x * zFactor - u_mouse.x * a_param.x + sin(u_time * a_param.w * 0.5) * a_param.y * 0.15;
    instanceMat[3][1] = instanceMat[3][1] * u_resolution.y * zFactor - u_mouse.y * a_param.x + cos(u_time * a_param.w * 0.5) * a_param.z * 0.15;

    instanceMat[0][0] *= u_scale;
    instanceMat[1][1] *= u_scale;
    instanceMat[2][2] *= u_scale;

    instanceMat *= rotMat;
    mvPosition = instanceMat * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;
`;

export function mapRange(val: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export function calcFrustumSize(camera: THREE.PerspectiveCamera, distance: number) {
  const fovRad = (camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(fovRad / 2) * Math.abs(distance);
  return { width: height * camera.aspect, height };
}
