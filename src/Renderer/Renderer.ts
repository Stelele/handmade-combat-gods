import { resizeCanvas } from "../helpers/resizeCanvas"
import { testShader } from "./shaders/test.shader"
import { RenderObject } from "./types/RenderObject"

export class Renderer {
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private canvasContext!: GPUCanvasContext

    // Buffers
    private propsBuffer!: GPUBuffer
    private vertexBuffer!: GPUBuffer
    private metaPropsBuffer!: GPUBuffer
    private indexBuffer!: GPUBuffer

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
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" }
                },
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
        this.objects = objects
    }

    private initSpecialBuffers() {
        this.metaPropsBuffer = this.device.createBuffer({
            label: "Meta Props Buffer",
            size: 1 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
    }

    private loadData() {
        if (!this.objects.length) return 0

        const propsData: number[] = []
        const vertexData: number[] = []
        const indexData: number[] = []

        for (const obj of this.objects) {
            for (const vertex of obj.vertices) {
                vertexData.push(vertex)
            }
            for (const index of obj.indexes) {
                indexData.push(index)
            }

            propsData.push(
                ...obj.color,
                ...obj.transformation,
            )
        }

        const props = new Float32Array(propsData)
        const vertices = new Float32Array(vertexData)
        const indexes = new Uint32Array(indexData)

        if (!this.propsBuffer || (this.propsBuffer && this.propsBuffer.size !== props.byteLength)) {
            this.propsBuffer?.destroy()
            this.propsBuffer = this.device.createBuffer({
                label: "Props Buffer",
                size: props.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            })
        }
        this.device.queue.writeBuffer(this.propsBuffer, 0, props)

        if (!this.vertexBuffer || (this.vertexBuffer && this.vertexBuffer.size !== vertices.byteLength)) {
            this.vertexBuffer?.destroy()
            this.vertexBuffer = this.device.createBuffer({
                label: "Vertex Buffer",
                size: vertices.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            })
        }
        this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices)

        if (!this.indexBuffer || (this.indexBuffer.size !== indexes.byteLength)) {
            this.indexBuffer?.destroy()
            this.indexBuffer = this.device.createBuffer({
                label: "Index Buffer",
                size: indexes.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            })
        }
        this.device.queue.writeBuffer(this.indexBuffer, 0, indexes)

        this.bindGroup = this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.propsBuffer } },
                { binding: 1, resource: { buffer: this.metaPropsBuffer } },
                { binding: 2, resource: { buffer: this.vertexBuffer } },
                { binding: 3, resource: { buffer: this.indexBuffer } }
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
        pass.draw(6, this.objects.length)


        pass.end()
        this.device.queue.submit([encoder.finish()])
    }
}