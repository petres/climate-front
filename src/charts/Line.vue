<template>
    <div ref="container">
        <svg class='line-chart' :height='height' :width='width'>
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333"></g>
        </svg>
    </div>
</template>

<script>

import * as d3 from "d3";
import { stationStore } from '@/stores/station.js'

export default {
    setup() {
        const ss = stationStore()
        return {
            data: ss.data.monthly
        }
    },
    data: () => ({
        m: {
            t: 50, r: 50, b: 50, l: 50
        },
        width: 0,
        height: 400,
    }),
    mounted() {
        this.width = this.$refs.container.clientWidth
        const innerWidth = this.width - (this.m.l + this.m.r)
        // this.height = this.$refs.container.clientHeight

        const svg = d3.select("svg.line-chart g");

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date ))
            .range([ 0, innerWidth ]);

        svg.append("g")
            // .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisTop(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.value))
            .range([ this.height, 0 ]);

        svg.append("g")
            .call(d3.axisLeft(y));

        const def = v => typeof v == 'number' && !isNaN(v)

        svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
            )

        svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .defined(d => def(d.avg1))
                .x(d => x(d.date))
                .y(d => y(d.avg1))
            )

        svg.append("path")
            .datum(this.data)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
                .defined(d => def(d.avg10))
                .x(d => x(d.date))
                .y(d => y(d.avg10))
            )
    }
}
</script>
