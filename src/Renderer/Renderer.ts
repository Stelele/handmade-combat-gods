import { resizeCanvas } from "../helpers/resizeCanvas"
import { testShader } from "./shaders/test.shader"
import { RenderObject } from "./types/RenderObject"

export class Renderer {
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private canvasContext!: GPUCanvasContext

    // Buffers
    private propsBuffer!: GPUBuffer
    private readonly PROPS_BUFFER_ENTRY_SIZE = 4 * 8
    private metaPropsBuffer!: GPUBuffer

    // pipeline and bind groups
    private pipeline!: GPURenderPipeline
    private bindGroup!: GPUBindGroup
    private bindGroupLayout!: GPUBindGroupLayout

    // rendering
    private renderPassDescriptor!: GPURenderPassDescriptor

    // objects
    private objects: RenderObject[] = []


    public async start() {
        await this.initCanvas()
        this.initPipeline()
        this.initSpecialBuffers()
        this.loadObjects([])
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

        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: "Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                }
            ]
        })
        const pipeLineLayout = this.device.createPipelineLayout({
            label: "Pipeline Layout",
            bindGroupLayouts: [this.bindGroupLayout]
        })

        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: pipeLineLayout,
            vertex: { module },
            fragment: { module, targets: [{ format: this.presentationFormat }] },
        })
    }

    public loadObjects(objects: RenderObject[]) {
        this.objects = objects.sort((a, b) => a.vertices.length - b.vertices.length)
    }

    private initSpecialBuffers() {
        this.metaPropsBuffer = this.device.createBuffer({
            label: "Meta Props Buffer",
            size: 1 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
    }

    private loadData() {
        if (!this.objects.length) return

        const propsData: number[] = []
        for (const obj of this.objects) {
            for (let i = 0; i < obj.vertices.length; i += 4) {
                propsData.push(
                    ...obj.vertices.slice(i, i + 4),
                    ...obj.color,
                    ...obj.transformation,
                )
            }
        }
        const props = new Float32Array(propsData)

        if (this.propsBuffer) {
            this.propsBuffer.destroy()
        }
        this.propsBuffer = this.device.createBuffer({
            label: "Vertex Buffer",
            size: props.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })
        this.device.queue.writeBuffer(this.propsBuffer, 0, props)

        this.bindGroup = this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.propsBuffer } },
                { binding: 1, resource: { buffer: this.metaPropsBuffer } },
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
        let time = 0
        animate()

        function animate() {
            const cur = new Date()
            const targetMs = 1000 / targetFps
            const diff = cur.getTime() - prev.getTime()
            if (diff >= targetMs) {
                time += diff / 1000
                renderer.render(time)
                prev = cur
            }

            requestAnimationFrame(animate)
        }
    }

    private render(time: number) {
        const canvasTexture = this.canvasContext.getCurrentTexture()
        for (const colorAttachment of this.renderPassDescriptor.colorAttachments) {
            if (colorAttachment) {
                colorAttachment.view = canvasTexture.createView()
            }
        }

        const encoder = this.device.createCommandEncoder()
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        // update time
        this.device.queue.writeBuffer(this.metaPropsBuffer, 0, new Float32Array([time]))

        pass.setPipeline(this.pipeline)

        this.loadData()
        pass.setBindGroup(0, this.bindGroup)
        pass.draw(this.propsBuffer.size / this.PROPS_BUFFER_ENTRY_SIZE)


        pass.end()
        this.device.queue.submit([encoder.finish()])
    }
}