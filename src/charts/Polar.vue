<template>
    <div ref="container">
        <svg class='pie-chart' :height='height' :width='width'>
            <g :transform='`translate(${width/2}, ${height/2})`'></g>
        </svg>
    </div>
</template>

<script>

import * as d3 from "d3";

export default {
    data: () => ({
        width: 0,
        height: 0,
        radius: 0,
    }),
    mounted() {
        this.width = this.$refs.container.clientWidth
        this.height = Math.min(this.width, 10 * this.radius)
        this.radius = this.height / 10

        const svg = d3.select("svg.pie-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        const svgI = svg.select("g")

        


    }
}
</script>
