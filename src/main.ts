import { Renderer } from "./Renderer/Renderer"
import { IObject } from "./Renderer/types/Object"

main()

async function main() {
  const renderer = new Renderer()
  await renderer.start()

  const objs: IObject[] = [
    {
      color: [0, 1, 0, 1],
      vertices: [
        -0.5, 0.5, 0, 1,
        -0.8, -0.5, 0, 1,
        0, -0.5, 0, 1
      ]
    },
    {
      color: [0, 1, 0, 1],
      vertices: [
        0.5, 0.5, 0, 1,
        0.8, -0.5, 0, 1,
        0, -0.5, 0, 1
      ]
    }
  ]
  renderer.loadObjects(objs)
}