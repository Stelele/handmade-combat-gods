export interface Entity {
    scale: (sx?: number, sy?: number, sZ?: number) => Entity
    rotation: (thetaX?: number, thetaY?: number, thetaZ?: number) => Entity
    translate: (tx?: number, ty?: number, tz?: number) => Entity
}