export const testShader = /*wgsl*/`
    @vertex
    fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
        var points: array<vec4f, 3> = array(
            vec4f(.0, .5, .0, 1.),
            vec4f(-.5, -.5, .0, 1.),
            vec4f(.5, -.5, .0, 1.)
        );

        return points[idx];
    }

    @fragment
    fn fs() -> @location(0) vec4f {
        return vec4f(1., .0, .0, 1.);
    }
`