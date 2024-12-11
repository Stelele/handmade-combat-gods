export const testShader = /*wgsl*/`
    struct Props {
        pos: vec4f,
        color: vec4f,
    }

    struct MetaProps {
        time: f32
    }

    struct VsOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
    }

    @group(0) @binding(0) var<storage, read> props: array<Props>;
    @group(0) @binding(1) var<uniform> metaProps: MetaProps;

    @vertex
    fn vs(@builtin(vertex_index) idx: u32) -> VsOut {
        let prop = props[idx];
        var vOut: VsOut;
        vOut.pos = prop.pos;
        vOut.color = prop.color;
        return vOut;
    }

    @fragment
    fn fs(vsIn: VsOut) -> @location(0) vec4f {
        return vsIn.color;
    }
`