<template>
    <div ref="container">
        <svg class='pie-chart' :height='height' :width='width'>
            <!-- <rect :height='height' :width='width' style="fill:#DDD"/> -->
            <g :transform='`translate(${width/2}, ${height/2})`'></g>
        </svg>
    </div>
</template>

<script>

import * as d3 from "d3";
import { dataStore } from '@/stores/data.js'

export default {
    setup() {
        const ds = dataStore()
        return {
            data: ds.data.filter(d => d.date.getFullYear() > 1)
        }
    },
    data: () => ({
        width: 0,
        height: 0,
        radius: 150,
    }),
    mounted() {
        const cw = this.$refs.container.clientWidth
        this.width = Math.min(cw, 5 * this.radius)
        this.height = this.width
        this.radius = this.height / 10

        // console.log(this.data.map(d => d.date.getFullYear()))

        const innerRadius = 70;
        const outerRadius = 300;

        const svg = d3.select("svg.pie-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        const svgI = svg.select("g")

        const x = d3.scaleUtc()
            .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])
            .range([0, 2 * Math.PI])

        const y = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.value)-5, d3.max(this.data, d => d.value) + 5])
            .range([ innerRadius, outerRadius]);

        // const def = v => typeof v == 'number' && !isNaN(v)

        svgI.append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.lineRadial()
                // .defined(d => def(d.value))
                .radius(d => y(d.value))
                .angle(d => x(d.date))
            (this.data));

        const xAxis = g => g
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .call(g => g.selectAll("g")
                .data(x.ticks())
                .join("g")
                .each((d, i) => d.id = `m${i}`)
                .call(g => g.append("path")
                    .attr("stroke", "#000")
                    .attr("stroke-opacity", 0.2)
                    .attr("d", d => `
                    M${d3.pointRadial(x(d), innerRadius)}
                    L${d3.pointRadial(x(d), outerRadius)}
                    `)
                )
                .call(g => g.append("path")
                    .attr("id", d => d.id)
                    .datum(d => [d, d3.utcMonth.offset(d, 1)])
                    .attr("fill", "none")
                    .attr("d", ([a, b]) => `
                    M${d3.pointRadial(x(a), outerRadius - 10)}
                    A${outerRadius - 10},${outerRadius - 10} 0,0,1 ${d3.pointRadial(x(b), outerRadius - 10)}
                    `)
                )
                .call(g => g.append("text")
                    .append("textPath")
                    .attr("startOffset", 6)
                    .attr("xlink:href", d => `#${d.id}`)
                    .text(d3.utcFormat("%B"))
                )
            )

        svgI.append("g")
            .call(xAxis);

        const yAxis = g => g
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .call(g => g.selectAll("g")
                .data(y.ticks(6))
                .join("g")
                .attr("fill", "none")
                .call(g => g.append("circle")
                    .attr("stroke", "#000")
                    .attr("stroke-opacity", 0.2)
                    .attr("r", y)
                )
                .call(g => g.append("text")
                    .attr("y", d => -y(d))
                    .attr("dy", "0.35em")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 5)
                    .text((x, i) => `${x} °C`)
                    .clone(true)
                    .attr("y", d => y(d))
                    .selectAll(function() { return [this, this.previousSibling]; })
                    .clone(true)
                    .attr("fill", "currentColor")
                    .attr("stroke", "none")
                )
            )

            svgI.append("g")
                .call(yAxis);
    }
}
</script>
