import { Vec3 } from "./Vec3"

export class Mat4 {
    public static scaleMat(x = 1, y = 1, z = 1) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1,
        ]
    }

    public static transMat(x = 0, y = 0, z = 0) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1,
        ]
    }

    public static rotMat(thetaX = 0, thetaY = 0, thetaZ = 0) {
        const rX = Mat4.rotXMat(thetaX)
        const rY = Mat4.rotYMat(thetaY)
        const rZ = Mat4.rotZMat(thetaZ)

        return Mat4.matMultiply([rX, rY, rZ])
    }

    public static rotZMat(theta = 0) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }

    public static rotYMat(theta = 0) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)

        return [
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        ]
    }

    public static rotXMat(theta = 0) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]
    }

    public static identityMat() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }

    public static zeroMat() {
        return [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]
    }

    public static matMultiply(mats: number[][]) {
        let result = Mat4.identityMat()
        for (const mat of mats) {
            result = Mat4.multiply(result, mat)
        }

        return result
    }

    private static multiply(a: number[], b: number[]) {
        const result = Mat4.zeroMat()

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j]
            }
        }

        return result
    }

    public static T(a: number[]) {
        const result = Mat4.zeroMat()
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = a[j * 4 + i]
            }
        }

        return result
    }

    public static orthoMat(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        const dst = Array<number>(16)

        dst[0] = 2 / (right - left)
        dst[1] = 0
        dst[2] = 0
        dst[3] = 0

        dst[4] = 0
        dst[5] = 2 / (top - bottom)
        dst[6] = 0
        dst[7] = 0

        dst[8] = 0
        dst[9] = 0
        dst[10] = 1 / (near - far)
        dst[11] = 0

        dst[12] = (right + left) / (left - right)
        dst[13] = (top + bottom) / (bottom - top)
        dst[14] = near / (near - far)
        dst[15] = 1

        return dst
    }

    public static perspectiveMat(fovInRad: number, aspect: number, zNear: number, zFar: number) {
        const dst = Array<number>(16)

        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovInRad);
        const rangeInv = 1 / (zNear - zFar);

        dst[0] = f / aspect;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;

        dst[4] = 0;
        dst[5] = f;
        dst[6] = 0;
        dst[7] = 0;

        dst[8] = 0;
        dst[9] = 0;
        dst[10] = zFar * rangeInv;
        dst[11] = -1;

        dst[12] = 0;
        dst[13] = 0;
        dst[14] = zNear * zFar * rangeInv;
        dst[15] = 0;

        return dst;
    }

    public static inverseMat(m: number[]) {
        const dst = Array<number>(16)

        const m00 = m[0 * 4 + 0]
        const m01 = m[0 * 4 + 1]
        const m02 = m[0 * 4 + 2]
        const m03 = m[0 * 4 + 3]
        const m10 = m[1 * 4 + 0]
        const m11 = m[1 * 4 + 1]
        const m12 = m[1 * 4 + 2]
        const m13 = m[1 * 4 + 3]
        const m20 = m[2 * 4 + 0]
        const m21 = m[2 * 4 + 1]
        const m22 = m[2 * 4 + 2]
        const m23 = m[2 * 4 + 3]
        const m30 = m[3 * 4 + 0]
        const m31 = m[3 * 4 + 1]
        const m32 = m[3 * 4 + 2]
        const m33 = m[3 * 4 + 3]

        const tmp0 = m22 * m33
        const tmp1 = m32 * m23
        const tmp2 = m12 * m33
        const tmp3 = m32 * m13
        const tmp4 = m12 * m23
        const tmp5 = m22 * m13
        const tmp6 = m02 * m33
        const tmp7 = m32 * m03
        const tmp8 = m02 * m23
        const tmp9 = m22 * m03
        const tmp10 = m02 * m13
        const tmp11 = m12 * m03
        const tmp12 = m20 * m31
        const tmp13 = m30 * m21
        const tmp14 = m10 * m31
        const tmp15 = m30 * m11
        const tmp16 = m10 * m21
        const tmp17 = m20 * m11
        const tmp18 = m00 * m31
        const tmp19 = m30 * m01
        const tmp20 = m00 * m21
        const tmp21 = m20 * m01
        const tmp22 = m00 * m11
        const tmp23 = m10 * m01

        const t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
            (tmp1 * m11 + tmp2 * m21 + tmp5 * m31)
        const t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
            (tmp0 * m01 + tmp7 * m21 + tmp8 * m31)
        const t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
            (tmp3 * m01 + tmp6 * m11 + tmp11 * m31)
        const t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
            (tmp4 * m01 + tmp9 * m11 + tmp10 * m21)

        const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)

        dst[0] = d * t0
        dst[1] = d * t1
        dst[2] = d * t2
        dst[3] = d * t3

        dst[4] = d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) -
            (tmp0 * m10 + tmp3 * m20 + tmp4 * m30))
        dst[5] = d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) -
            (tmp1 * m00 + tmp6 * m20 + tmp9 * m30))
        dst[6] = d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) -
            (tmp2 * m00 + tmp7 * m10 + tmp10 * m30))
        dst[7] = d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) -
            (tmp5 * m00 + tmp8 * m10 + tmp11 * m20))

        dst[8] = d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) -
            (tmp13 * m13 + tmp14 * m23 + tmp17 * m33))
        dst[9] = d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) -
            (tmp12 * m03 + tmp19 * m23 + tmp20 * m33))
        dst[10] = d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) -
            (tmp15 * m03 + tmp18 * m13 + tmp23 * m33))
        dst[11] = d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) -
            (tmp16 * m03 + tmp21 * m13 + tmp22 * m23))

        dst[12] = d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) -
            (tmp16 * m32 + tmp12 * m12 + tmp15 * m22))
        dst[13] = d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) -
            (tmp18 * m22 + tmp21 * m32 + tmp13 * m02))
        dst[14] = d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) -
            (tmp22 * m32 + tmp14 * m02 + tmp19 * m12))
        dst[15] = d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) -
            (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))

        return dst
    }

    public static cameraAimMat(eye: number[], target: number[], up: number[]) {
        const dst = Array<number>(16)

        const zAxis = Vec3.normalize(Vec3.subtract(eye, target));
        const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
        const yAxis = Vec3.normalize(Vec3.cross(zAxis, xAxis));

        dst[0] = xAxis[0]
        dst[1] = xAxis[1]
        dst[2] = xAxis[2]
        dst[3] = 0

        dst[4] = yAxis[0]
        dst[5] = yAxis[1]
        dst[6] = yAxis[2]
        dst[7] = 0

        dst[8] = zAxis[0]
        dst[9] = zAxis[1]
        dst[10] = zAxis[2]
        dst[11] = 0

        dst[12] = eye[0]
        dst[13] = eye[1]
        dst[14] = eye[2]
        dst[15] = 1

        return dst
    }

    public static lookAtMat(eye: number[], target: number[], up: number[]) {
        return Mat4.inverseMat(Mat4.cameraAimMat(eye, target, up))
    }
}