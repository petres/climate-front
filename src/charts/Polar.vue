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
import { stationStore } from '@/stores/station.js'
import { baseStore } from '@/stores/base.js'

export default {
    props: ['id', 'ind'],
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore()
        }
    },
    computed: {
        p () { return {id: this.id, ind: this.ind, period: 'daily'} },
        unit () { return this.baseStore.indicator(this.ind).unit },
    },
    data: () => ({
        width: 0,
        height: 0,
        innerRadius: 50,
        radius: 200,
        g: null,
    }),
    mounted() {
        const cw = this.$refs.container.clientWidth;
        // this.width = Math.min(cw, 5 * this.radius);
        this.width = cw;
        this.radius = Math.min(cw/2 - 10, 200);
        this.height = this.radius*2 + 20;

        // console.log(this.data.map(d => d.date.getFullYear()))
        const svg = d3.select(this.$refs.container).select("svg.polar-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        this.g = svg.select("g")

        this.$watch(
            () => [this.id, this.ind],
            (n, o) => {
                // console.log(`Polar watch: ${id}, ${ind}`)
                console.log(this.p)
                if (this.stationStore.loaded(this.p)) {
                    this.plot()
                } else {
                    this.stationStore.load(this.p).then(
                        this.plot
                    )
                }
            },
            { immediate : true}
        )
    },
    methods: {
        plot() {
            this.data = this.stationStore.data(this.p).filter(d => d.date.getFullYear() == 2021)

            // console.log(`Id: ${this.id}, Ind: ${this.ind}`)

            const x = d3.scaleTime()
                .domain([new Date(2000, 0, 1), new Date(2001, 0, 1) - 1])
                .range([0, 2 * Math.PI])

            const y = d3.scaleLinear()
                .domain([d3.min(this.data, d => d.value)-5, d3.max(this.data, d => d.value) + 5])
                .range([ this.innerRadius, this.radius]);


            // console.log(this.data.map(e => ({date: e.date, x: x(e.date)})))
            // const def = v => typeof v == 'number' && !isNaN(v)
            this.g.select("path")
                .datum(this.data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d => d3.lineRadial()
                    // .defined(d => def(d.value))
                    .radius(d => y(d.value))
                    .angle(d => x(new Date(d.date).setFullYear(2000)))(d)
                );

            const xAxis = g => g
                .call(g => g.selectAll("g")
                    .data(x.ticks())
                    .join("g")
                    .each((d, i) => d.id = `m${i}`)
                    .call(g => g.append("path")
                        .attr("stroke", "#000")
                        .attr("stroke-opacity", 0.2)
                        .attr("d", d => `
                        M${d3.pointRadial(x(d), this.innerRadius)}
                        L${d3.pointRadial(x(d), this.radius)}
                        `)
                    )
                    .call(g => g.append("path")
                        .attr("id", d => d.id)
                        .datum(d => [d, d3.utcMonth.offset(d, 1)])
                        .attr("fill", "none")
                        .attr("d", ([a, b]) => `
                        M${d3.pointRadial(x(a), this.radius)}
                        A${this.radius},${this.radius} 0,0,1 ${d3.pointRadial(x(b), this.radius)}
                        `)
                    )
                    .call(g => g.append("text")
                        .append("textPath")
                        .attr("startOffset", 6)
                        .attr("xlink:href", d => `#${d.id}`)
                        .text(d3.utcFormat("%B"))
                    )
                )

            this.g.select('.x-axis').selectAll("*").remove();
            this.g.select('.x-axis')
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
                        .text((x, i) => `${x} ${this.unit}`)
                        .clone(true)
                        .attr("y", d => y(d))
                        .selectAll(function() { return [this, this.previousSibling]; })
                        .clone(true)
                        .attr("fill", "currentColor")
                        .attr("stroke", "none")
                    )
                )

            this.g.select('.y-axis').selectAll("*").remove();
            this.g.select('.y-axis')
                .call(yAxis);
        }
    },
}
</script>
