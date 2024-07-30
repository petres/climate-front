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
import { isDefined, formatters, periods } from '@/globals.js'

export default {
    props: ['id', 'ind'],
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore(),
        }
    },
    data: () => ({
        m: {
            t: 15, r: 5, b: 5, l: 50
        },
        width: 0,
        height: 80,
    }),
    computed: {
        innerWidth () { return this.width - (this.m.l + this.m.r); },
        innerHeight () { return this.height - (this.m.t + this.m.b); },
        p () { return {id: this.id, ind: this.ind, period: 'yearly'}; },
        unit () { return this.baseStore.indicator(this.ind).unit; },
    },
    mounted() {
        // this.periods = ;
        this.width = this.$refs.container.clientWidth;
        this.svg = d3.select(this.$refs.container).select("svg");
        this.g = this.svg.select("g.inner");
        this.data = this.stationStore.data(this.p)
            .filter(d => d.date.getFullYear() >= periods.p1[0] - 2);
        this.plot();
    },
    methods: {
        plot() {
            const time = 'v1';
            const af = d => d[time];

            this.g.selectAll("*").remove();
            // const xExtent = d3.extent(this.data, d => d.year);
            const xExtent = [periods.p1[0] - 2, new Date().getFullYear()];
            // console.log(xExtent)
            const x = d3.scaleLinear()
                .domain(xExtent)
                .range([0, this.innerWidth]);

            const xAxis = d3.axisTop(x)
                .ticks(7)
                .tickFormat(x => `${x}`)
                .tickSizeInner(-this.innerHeight)
                .tickPadding(5)

            this.g.append("g")
                .call(xAxis);

            const y = d3.scaleLinear()
                .domain(d3.extent(this.data, d => af(d)))
                .range([this.innerHeight, 0]);

            const yAxis = d3.axisLeft(y)
                .ticks(2)
                .tickFormat(x => `${x.toFixed(1)} ${this.unit}`)
                .tickSizeInner(-this.innerWidth)
                .tickPadding(5)

            this.g.append("g")
                .call(yAxis);

            this.g.append("g")
                .attr("class", 'points')
                .selectAll('circle')
                .data(this.data.filter(d => isDefined(af(d))))
                .enter()
                .append('circle')
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(af(d)))
                .attr("r", 1.5)

            this.g.append("path")
                .datum(this.data)
                .attr("class", 'line')
                .attr("d", d3.line()
                    .defined(d => isDefined(af(d)))
                    .x(d => x(d.year))
                    .y(d => y(af(d)))
                )

            const avgs = [
                {name: "avg", years: xExtent},
                {name: "avgP1", source: 'p1'},
                {name: "avgP2", source: 'p2'},
            ];

            avgs.forEach(i => {
                let avg = null;
                let years = null;

                if (i.source === undefined) {
                    avg = this.stationStore.average(this.p, time, i.years)
                    years = i.years;
                } else {
                    // console.log(this.stationStore.calcedAvg(this.p, i.source))
                    // console.log(`line ${this.p.id}`)
                    const avgInfo = this.stationStore.calcedAvg(this.p, i.source);
                    avg = avgInfo.v;
                    years = avgInfo.y;
                }

                const avg_y = y(avg);

                const x1 = x(years[0]);
                const x2 = x(years[1]);

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
                    const t = `${formatters.base(avg)} ${this.unit}`
                    this.g.append("text")
                        .attr("class", `avg avgBack ${i.name}`)
                        .attr("x", x)
                        .attr("y", avg_y)
                        .text(t)

                    this.g.append("text")
                        .attr("class", `avg avgFront ${i.name}`)
                        .attr("x", x)
                        .attr("y", avg_y)
                        .text(t)
                }
            });

            this.g.select('text.avgBack').raise();
            this.g.select('text.avgFront').raise();
        }
    },
}
</script>
