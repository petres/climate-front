<template>
    <div ref="container">
        <svg class='line-chart' :height='height' :width='width'>
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333"></g>
        </svg>
    </div>
</template>

<script>

import * as d3 from "d3";

export default {
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

        d3.csv("/data/vienna.csv", d => ({
            date: d3.timeParse("%Y-%m-%d")(d.date),
            value: +d.value/10,
            avg1: +d.avg1/10,
            avg5: +d.avg5/10,
            avg10: +d.avg10/10,
        })).then(data => {
            console.log(data)

            // Add X axis --> it is a date format
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date ))
                .range([ 0, innerWidth ]);

            svg.append("g")
                // .attr("transform", `translate(0, ${this.height})`)
                .call(d3.axisTop(x));

            // Add Y axis
            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => d.value))
                .range([ this.height, 0 ]);

            svg.append("g")
                .call(d3.axisLeft(y));

            const def = v => typeof v == 'number' && !isNaN(v)
            console.log(def(123))

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1)
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value))
                )

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .defined(d => def(d.avg1))
                    .x(d => x(d.date))
                    .y(d => y(d.avg1))
                )

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 3)
                .attr("d", d3.line()
                    .defined(d => def(d.avg10))
                    .x(d => x(d.date))
                    .y(d => y(d.avg10))
                )
        })
    }
}
</script>
