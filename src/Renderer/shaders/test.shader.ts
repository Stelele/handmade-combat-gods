export const testShader = /*wgsl*/`
    struct Props {
        color: vec4f,
        transformation: mat4x4f,
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
    @group(0) @binding(2) var<storage, read> points: array<array<vec4f,4>>;
    @group(0) @binding(3) var<storage, read> indexes: array<array<u32,6>>;

    @vertex
    fn vs(
        @builtin(vertex_index) vertIdx: u32, 
        @builtin(instance_index) instanceIdx: u32
    ) -> VsOut {
        let index = indexes[instanceIdx][vertIdx];
        let prop  = props[instanceIdx];
        let point = points[instanceIdx][index];

        var vOut: VsOut;
        vOut.pos   = prop.transformation * point;
        vOut.color = prop.color;
        return vOut;
    }

    @fragment
    fn fs(vsIn: VsOut) -> @location(0) vec4f {
        return vsIn.color;
    }
`