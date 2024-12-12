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
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1,
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
            -s, -c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }

    public static rotYMat(theta = 0) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
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

}