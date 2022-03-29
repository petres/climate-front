<template>
    <div ref="container">
        <svg class='polar-chart' :height='height' :width='width'>
            <g :transform='`translate(${width/2}, ${height/2})`'>
                <path/>
                <g class='x-axis'></g>
                <g class='y-axis'></g>
            </g>
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
            data: ds.daily.filter(d => d.date.getFullYear() > 2020)
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

        const svg = d3.select("svg.polar-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        const svgI = svg.select("g")

        const x = d3.scaleTime()
            .domain([new Date(2000, 0, 1), new Date(2001, 0, 1) - 1])
            .range([0, 2 * Math.PI])

        const y = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.value)-5, d3.max(this.data, d => d.value) + 5])
            .range([ innerRadius, outerRadius]);


        console.log(this.data.map(e => ({date: e.date, x: x(e.date)})))
        // const def = v => typeof v == 'number' && !isNaN(v)

        svgI.select("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.lineRadial()
                // .defined(d => def(d.value))
                .radius(d => y(d.value))
                .angle(d => x(new Date(d.date).setFullYear(2000)))
            (this.data));

        const xAxis = g => g
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
                    M${d3.pointRadial(x(a), outerRadius)}
                    A${outerRadius},${outerRadius} 0,0,1 ${d3.pointRadial(x(b), outerRadius)}
                    `)
                )
                .call(g => g.append("text")
                    .append("textPath")
                    .attr("startOffset", 6)
                    .attr("xlink:href", d => `#${d.id}`)
                    .text(d3.utcFormat("%B"))
                )
            )

        svgI.select('.x-axis')
            .call(xAxis);

        const yAxis = g => g
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

            svgI.select('.y-axis')
                .call(yAxis);
    }
}
</script>

<style scoped>
    g.x-axis {
        font-size: 12px;
        font-family: 'Arial'
    }

    g.y-axis {
        font-size: 10px;
        font-family: 'Arial';
        text-anchor: middle;
    }
</style>
