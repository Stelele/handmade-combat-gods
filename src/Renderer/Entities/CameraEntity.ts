import { Mat4 } from "../../Math/Mat4"

export class CameraEntity {

    // for view matrix
    private up: number[]
    private eye: number[]
    private focus: number[]

    // for proprojection matrix
    private fov: number
    private zNear: number
    private zFar: number
    private get aspect() {
        const canvas = document.getElementById("webgpu") as HTMLCanvasElement
        return canvas.width / canvas.height
    }

    public get viewProjMat() {
        const projMat = Mat4.perspectiveMat(this.fov, this.aspect, this.zNear, this.zFar)
        const viewMat = Mat4.lookAtMat(this.eye, this.focus, this.up)

        return Mat4.matMultiply([viewMat, projMat])
    }

    public constructor() {
        this.zNear = 10
        this.zFar = 2000
        this.fov = Math.atan2(1, this.zNear)

        this.up = [0, 1, 0]
        this.eye = [0, 0, 0]
        this.focus = [0, 0, 30]
    }

}

