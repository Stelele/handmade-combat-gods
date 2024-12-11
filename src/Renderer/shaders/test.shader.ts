export const testShader = /*wgsl*/`
    struct ShapeProps {
        color: vec4f
    }

    @group(0) @binding(0) var<storage, read> vertices: array<vec4f>;
    @group(0) @binding(1) var<uniform> props: ShapeProps;

    @vertex
    fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
        return vertices[idx];
    }

    @fragment
    fn fs() -> @location(0) vec4f {
        return props.color;
    }
`