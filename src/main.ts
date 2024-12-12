import { PrimitiveEntity } from "./Renderer/Entities/PrimitiveEntity"
import { Renderer } from "./Renderer/Renderer"

main()
async function main() {
  const renderer = new Renderer()
  await renderer.start()

  const obj1 = new PrimitiveEntity()
    .fill([0.5, 0, 0.8, 1])
    .circle(.25, 0)
  const obj2 = new PrimitiveEntity()
    .fill([0, 1, 0, 1])
    .rect([0.5, 0.5])
  // .translate(0)

  renderer.loadObjects([obj1, obj2])
}