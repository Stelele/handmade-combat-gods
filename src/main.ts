import { PrimitiveEntity } from "./Renderer/Entities/PrimitiveEntity"
import { Renderer } from "./Renderer/Renderer"

main()
async function main() {
  const renderer = new Renderer()
  await renderer.start()

  const obj1 = new PrimitiveEntity()
    .fill([0.5, 0, 0.8, 1])
    .rect([0.25, 0.25])
    .translate(0, 0, 10)
  const obj2 = new PrimitiveEntity()
    .fill([0, 1, 0, 1])
    .rect([1, 0.5])
    .translate(0, 0, 10)

  renderer.loadObjects([obj2, obj1])
}