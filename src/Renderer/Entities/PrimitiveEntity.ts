import { Mat4 } from "../../Math/Mat4";
import { Entity } from "../types/Entities";
import { RenderObject } from "../types/RenderObject";

export class PrimitiveEntity implements RenderObject, Entity {
    public color: number[]
    public vertices: number[]

    private get s() { return [this.sX, this.sY, this.sZ] }
    private get r() { return [this.rX, this.rY, this.rZ] }
    private get t() { return [this.x, this.y, this.z] }

    public get transformation() {
        const transLateMat = Mat4.transMat(...this.t)
        const rotMat = Mat4.rotMat(...this.r)
        const scaleMat = Mat4.scaleMat(...this.s)

        return Mat4.matMultiply([transLateMat, rotMat, scaleMat])
    }

    private x: number = 0
    private y: number = 0
    private z: number = 0

    private rX: number = 0
    private rY: number = 0
    private rZ: number = 0

    private sX: number = 1
    private sY: number = 1
    private sZ: number = 1

    public constructor() {
        this.color = [0, 0, 0, 0]
        this.vertices = []
    }

    public scale(sX?: number, sY?: number, sZ?: number) {
        this.sX = sX ?? 1
        this.sY = sY ?? 1
        this.sZ = sZ ?? 1
        return this
    }

    public rotation(thetaX?: number, thetaY?: number, thetaZ?: number) {
        this.rX = thetaX ?? 0
        this.rY = thetaY ?? 0
        this.rZ = thetaZ ?? 0
        return this
    }

    public translate(tX?: number, tY?: number, tZ?: number) {
        this.x = tX ?? 0
        this.y = tY ?? 0
        this.z = tZ ?? 0
        return this
    }

    public fill([r, g, b, a]: number[]) {
        this.color = [r, g, b, a]

        return this
    }

    public rect([w, h]: number[]) {
        const mW = w / 2
        const mH = h / 2
        this.vertices = [
            -mW, mH, 0, 1,
            mW, mH, 0, 1,
            -mW, -mH, 0, 1,

            -mW, -mH, 0, 1,
            mW, -mH, 0, 1,
            mW, mH, 0, 1,
        ]

        return this
    }

    public circle(r: number, z: number) {
        const points: number[] = []

        const max = 1000
        const dTheta = 2 * Math.PI / max
        for (let i = 0; i < max; i++) {
            points.push(0, 0, 0, 1)

            const x1 = r * Math.cos(dTheta * i)
            const y1 = r * Math.sin(dTheta * i)
            points.push(x1, y1, z, 1)

            const x2 = r * Math.cos(dTheta * (i + 1))
            const y2 = r * Math.sin(dTheta * (i + 1))
            points.push(x2, y2, z, 1)
        }

        this.vertices = points
        return this
    }
}