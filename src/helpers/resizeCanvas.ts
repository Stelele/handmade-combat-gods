export function resizeCanvas() {
    const canvas = document.getElementById("webgpu") as HTMLCanvasElement

    const scale = Math.min(
        window.innerWidth / canvas.width,
        window.innerHeight / canvas.height
    )

    canvas.style.width = `${canvas.width * scale}px`
    canvas.style.height = `${canvas.height * scale}px`
}