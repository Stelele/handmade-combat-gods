import { resizeCanvas } from "../helpers/resizeCanvas"
import { testShader } from "./shaders/test.shader"

export class Renderer {
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private pipeline!: GPURenderPipeline
    private canvasContext!: GPUCanvasContext
    private renderPassDescriptor!: GPURenderPassDescriptor

    public async start() {
        await this.initCanvas()
        this.initPipeline()
        this.initRenderPassDescriptor()
        this.render()
    }

    private async initCanvas() {
        const canvas = document.getElementById("webgpu") as HTMLCanvasElement
        const adapter = await navigator.gpu?.requestAdapter()
        const device = await adapter?.requestDevice()
        if (!device) {
            document.getElementById("errors")!.innerHTML = "<h1>Web GPU not supported</h1>"
            throw new Error()
        }
        this.device = device

        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat()
        const context = canvas.getContext("webgpu")
        if (!context) {
            document.getElementById("errors")!.innerHTML = "<h1>Web GPU context couldn't be got</h1>"
            throw new Error()
        }
        this.canvasContext = context
        this.canvasContext.configure({
            device: this.device,
            format: this.presentationFormat,
        })

        window.addEventListener('resize', resizeCanvas)
        resizeCanvas()
    }

    private initPipeline() {
        const module = this.device.createShaderModule({
            label: "Test shader",
            code: testShader,
        })

        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: "auto",
            vertex: { module },
            fragment: { module, targets: [{ format: this.presentationFormat }] },
        })
    }

    private initRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Descriptor",
            // @ts-ignore
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: [0, 0, 0, 0],
            }]
        }
    }

    private render() {
        const canvasTexture = this.canvasContext.getCurrentTexture()
        for (const colorAttachment of this.renderPassDescriptor.colorAttachments) {
            if (colorAttachment) {
                colorAttachment.view = canvasTexture.createView()
            }
        }

        const encoder = this.device.createCommandEncoder()
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        pass.setPipeline(this.pipeline)

        pass.draw(3)
        pass.end()

        this.device.queue.submit([encoder.finish()])
    }
}