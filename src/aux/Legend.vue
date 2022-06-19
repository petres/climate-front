<template>
    <div id='legend-overlay' class='overlay'>
        <div class="text" v-html="text"></div>
        <div class="legend" :style="`display: inline-block; position: relative; height: ${height}px; width: ${width}px`">
            <canvas width="1" :height="innerHeight" :style="`top: ${m.t}px; left: ${m.l}px; position: absolute; height: ${innerHeight}px; width: ${innerWidth}px`"/>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    props: ['scale', 'formatter', 'text'],
    data: () => ({
        m:  {t: 10, r: 0, b: 10, l: 55},
        // domain: [-1, 1],
        height: 120,
        width: 70,
    }),
    computed: {
        innerWidth () { return this.width - (this.m.l + this.m.r); },
        innerHeight () { return this.height - (this.m.t + this.m.b); },
    },
    mounted() {
        this.$watch(
            () => [this.scale, this.formatter],
            (n, o) => {
                // console.log(this.scale)
                this.update()
            },
            { immediate : true }
        )
    },

    methods: {
        update: function() {
            let self = this;

            if (this.scale == null)
                return

            d3.select('#legend-overlay .legend svg').remove();
            var canvas = d3.select('#legend-overlay .legend canvas').node();

            var ctx = canvas.getContext("2d");
            var d = this.scale.domain()
            var scale = d3.scaleLinear()
                .domain(d)
                .range([this.innerHeight - 1, 0]);

                //.domain(d3.extent(d));

            // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
            const image = ctx.createImageData(1, this.innerHeight);
            d3.range(this.innerHeight).forEach(i => {
                const c = d3.rgb(this.scale(scale.invert(i)));
                image.data[4*i] = c.r;
                image.data[4*i + 1] = c.g;
                image.data[4*i + 2] = c.b;
                image.data[4*i + 3] = 255;
            });
            ctx.putImageData(image, 0, 0);

            const axis = d3.axisLeft()
                .scale(scale)
                .tickSize(6)
                .tickFormat(this.formatter)
                .ticks(4);

            const svg = d3.select('#legend-overlay .legend')
                .append("svg")
                .attr('height', this.height)
                .attr('width', this.width)
                .style("position", "absolute")
                .style("left", "0px")
                .style("top", "0px")
                .append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + (this.m.l - 3) + "," + (this.m.t) + ")")
                .call(axis);
        }
    }
};
</script>
