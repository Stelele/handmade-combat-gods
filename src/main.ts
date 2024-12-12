import { PrimitiveEntity } from "./Renderer/Entities/PrimitiveEntity"
import { Renderer } from "./Renderer/Renderer"

main()
async function main() {
  const renderer = new Renderer()
  await renderer.start()

  const obj1 = new PrimitiveEntity()
    .fill([0.5, 0, 0.8, 1])
    .rect([0.25, 0.25])
  const obj2 = new PrimitiveEntity()
    .fill([0, 1, 0, 1])
    .rect([0.5, 0.5])

  let theta = 0

  setInterval(test, 200)
  function test() {
    theta += 0.1
    obj2.rotation(theta)
  }

  renderer.loadObjects([obj2, obj1])
}