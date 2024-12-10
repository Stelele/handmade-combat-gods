import { resizeCanvas } from "../helpers/resizeCanvas"
import { testShader } from "./shaders/test.shader"

export class Renderer {
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private pipeline!: GPURenderPipeline
    private canvasContext!: GPUCanvasContext
    private renderPassDescriptor!: GPURenderPassDescriptor

    // Buffers
    private vertexBuffer!: GPUBuffer

    public async start() {
        await this.initCanvas()
        this.initPipeline()
        this.initRenderPassDescriptor()
        this.startAnimation(120)
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
        const renderer: Renderer = this
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

        function initBuffers() {
            renderer.vertexBuffer = renderer.device.createBuffer({
                label: "Vertex Buffer",
                size: 3 * 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            })
        }
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

    private startAnimation(targetFps: number) {
        let prev = new Date()
        const renderer: Renderer = this
        animate()

        function animate() {
            const cur = new Date()
            const targetMs = 1000 / targetFps
            if (cur.getTime() - prev.getTime() >= targetMs) {
                renderer.render()
                prev = cur
            }

            requestAnimationFrame(animate)
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