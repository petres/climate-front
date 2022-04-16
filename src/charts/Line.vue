<template>
    <div ref="container">
        <svg class='line-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333"></g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import { stationStore } from '@/stores/station.js'

export default {
    props: ['id', 'ind'],
    setup() {
        return {
            stationStore: stationStore()
        }
    },
    data: () => ({
        m: {
            t: 50, r: 20, b: 50, l: 20
        },
        width: 0,
        height: 200,
        g: null,
    }),
    computed: {
        innerWidth () { return this.width - (this.m.l + this.m.r); },
        p () { return {id: this.id, ind: this.ind, period: 'monthly'}; },
        unit () { return this.baseStore.indicator(this.ind).unit; },
    },
    mounted() {
        this.width = this.$refs.container.clientWidth
        // this.height = this.$refs.container.clientHeight
        this.g = d3.select(this.$refs.container).select("svg.line-chart g");

        this.$watch(
            () => [this.id, this.ind],
            (n, o) => {
                this.stationStore.onLoaded(this.p, this.plot)
            },
            { immediate : true}
        )
    },
    methods: {
        plot(data) {

            this.g.selectAll("*").remove();
            // Add X axis --> it is a date format
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date ))
                .range([ 0, this.innerWidth ]);

            this.g.append("g")
                // .attr("transform", `translate(0, ${this.height})`)
                .call(d3.axisTop(x));

            // Add Y axis
            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => d.value))
                .range([ this.height, 0 ]);

            this.g.append("g")
                .call(d3.axisLeft(y));

            const def = v => typeof v == 'number' && !isNaN(v)

            this.g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1)
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value))
                )

            this.g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .defined(d => def(d.avg1))
                    .x(d => x(d.date))
                    .y(d => y(d.avg1))
                )

            this.g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 3)
                .attr("d", d3.line()
                    .defined(d => def(d.avg10))
                    .x(d => x(d.date))
                    .y(d => y(d.avg10))
                )
        }
    },
}
</script>
