import { resizeCanvas } from "../helpers/resizeCanvas"
import { testShader } from "./shaders/test.shader"

export class Renderer {
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private canvasContext!: GPUCanvasContext

    // Buffers
    private vertexBuffer!: GPUBuffer
    private shapePropsBuffer!: GPUBuffer

    // pipeline and bind groups
    private pipeline!: GPURenderPipeline
    private bindGroup!: GPUBindGroup

    // rendering
    private renderPassDescriptor!: GPURenderPassDescriptor

    public async start() {
        await this.initCanvas()
        this.initPipeline()
        this.loadData()
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

    private loadData() {
        const points = new Float32Array([
            0, 0.5, 0, 1,
            -0.5, -0.5, 0, 1,
            0.5, -0.5, 0, 1,
        ])

        const props = new Float32Array(4)
        //set color
        props.set([1, 0, 0, 1], 0)

        if (this.vertexBuffer) {
            this.vertexBuffer.destroy()
        }
        if (this.shapePropsBuffer) {
            this.shapePropsBuffer.destroy()
        }

        this.vertexBuffer = this.device.createBuffer({
            label: "Vertex Buffer",
            size: points.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })
        this.device.queue.writeBuffer(this.vertexBuffer, 0, points)

        this.shapePropsBuffer = this.device.createBuffer({
            label: "Shape Props Buffer",
            size: props.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.shapePropsBuffer, 0, props)

        this.bindGroup = this.device.createBindGroup({
            label: "Bind Group",
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.vertexBuffer } },
                { binding: 1, resource: { buffer: this.shapePropsBuffer } }
            ]
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
        pass.setBindGroup(0, this.bindGroup)

        pass.draw(this.vertexBuffer.size / 4)
        pass.end()

        this.device.queue.submit([encoder.finish()])
    }
}