<template>
    <div ref="container">
        <svg class='line-year-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333">
                <g class='inner'/>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import { stationStore } from '@/stores/station.js'
import { baseStore } from '@/stores/base.js'
import { isDefined, baseFormatter } from '@/globals.js'

export default {
    props: ['id', 'ind', 'periods'],
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore()
        }
    },
    data: () => ({
        m: {
            t: 25, r: 35, b: 5, l: 50
        },
        width: 600,
        height: 80
    }),
    computed: {
        innerWidth () { return this.width - (this.m.l + this.m.r); },
        innerHeight () { return this.height - (this.m.t + this.m.b); },
        p () { return {id: this.id, ind: this.ind, period: 'yearly'}; },
        unit () { return this.baseStore.indicator(this.ind).unit; },
    },
    mounted() {
        // this.width = this.$refs.container.clientWidth
        this.svg = d3.select(this.$refs.container).select("svg");
        this.g = this.svg.select("g.inner");
        this.stationStore.onLoaded(this.p, d => {
            // this.data =
            this.data = d.filter(d => d.date.getFullYear() >= 1936)
            this.plot();
            // this.plotPath();
        })
    },
    methods: {
        plot() {
            const self = this;
            const time = 'v1';
            const af = d => d[time];

            const data = this.data;
            // console.log(data)

            this.g.selectAll("*").remove();
            const xExtent = d3.extent(data, d => d.year);
            const x = d3.scaleLinear()
                .domain(xExtent)
                .range([0, this.innerWidth]);

            const xAxis = d3.axisTop(x)
                .ticks(7)
                .tickFormat(x => `${x}`)
                .tickSizeInner(-this.innerHeight)


            this.g.append("g")
                // .attr("transform", `translate(0, ${this.height})`)
                .call(xAxis);

            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => af(d)))
                .range([this.innerHeight, 0]);

            const yAxis = d3.axisLeft(y)
                .ticks(2)
                .tickFormat(x => `${x.toFixed(1)} ${this.unit}`)
                .tickSizeInner(-this.innerWidth)

            this.g.append("g")
                .call(yAxis);



            this.g.append("path")
                .datum(data)
                .attr("class", 'line')
                .attr("d", d3.line()
                    .defined(d => isDefined(af(d)))
                    .x(d => x(d.year))
                    .y(d => y(af(d)))
                )

                const avgs = [
                    {name: "avg", years: xExtent},
                    {name: "avgP1", years: this.periods[0].years},
                    {name: "avgP2", years: this.periods[1].years},
                ];

                avgs.forEach(i => {
                    const avg = this.stationStore.average(this.p, time, i.years[0], i.years[1]);
                    const avg_y = y(avg);

                    const x1 = x(i.years[0]);
                    const x2 = x(i.years[1]);

                    this.g.append("rect")
                        .attr("class", `avg ${i.name}`)
                        .attr("x", x1)
                        .attr("y", 0)
                        .attr("width", x2 - x1)
                        .attr("height", this.innerHeight)

                    this.g.append("line")
                        .attr("class", `avg ${i.name}`)
                        .attr("x1", x1)
                        .attr("y1", avg_y)
                        .attr("x2", x2)
                        .attr("y2", avg_y)

                    if (i.name != "avg") {
                        const x = (i.name == "avgP1") ? x2 : x1;
                        const t = `${baseFormatter(avg)} ${this.unit}`
                        this.g.append("text")
                            .attr("class", `avg avgBack ${i.name}`)
                            .attr("x", x)
                            .attr("y", avg_y)
                            .text(t)

                        this.g.append("text")
                            .attr("class", `avg ${i.name}`)
                            .attr("x", x)
                            .attr("y", avg_y)
                            .text(t)
                    }


                });
        }
    },
}
</script>
