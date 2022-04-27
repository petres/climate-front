<template>
    <div ref="container">
        <svg class='line-year-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333">
                <g class='inner'/>
                <g class='hover'>
                    <line/>
                    <text/>
                </g>
                <g class='selected'>
                    <line/>
                    <text/>
                </g>
                <rect class='cap' opacity="0" :height="innerHeight" :width="innerWidth"/>
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
    data: () => ({
        m: {
            t: 15, r: 15, b: 10, l: 50
        },
        width: 100,
        height: 80
    }),
    computed: {
        innerWidth () { return this.width - (this.m.l + this.m.r); },
        innerHeight () { return this.height - (this.m.t + this.m.b); },
        p () { return {id: this.id, ind: this.ind, period: 'yearly'}; },
        unit () { return this.baseStore.indicator(this.ind).unit; },
    },
    mounted() {
        this.width = this.$refs.container.clientWidth
        // this.height = this.$refs.container.clientHeight
        this.svg = d3.select(this.$refs.container).select("svg");
        this.g = this.svg.select("g.inner");

        this.$watch(
            () => [this.id, this.ind],
            (n, o) => {
                this.stationStore.onLoaded(this.p, d => {
                    // this.data = d.filter(d => d.date.getFullYear() < 2020)
                    this.data = d
                    this.plot();
                    // this.plotPath();
                })
            },
            { immediate : true }
        )
    },
    methods: {
        plot() {
            const self = this;
            const time = 'v1'
            const af = d => d[time]
            const def = v => typeof v == 'number' && !isNaN(v)
            // const data = this.data.filter(d => def(af(d)));
            const data = this.data;

            // console.log(data.map(d => ({
            //     date: d.date,
            //     value: af(d),
            //     isdef: def(af(d))
            // })))

            this.g.selectAll("*").remove();
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, this.innerWidth]);

            const xAxis = d3.axisTop(x)
                .ticks(5)
                .tickSizeInner(-this.innerHeight)


            this.g.append("g")
                // .attr("transform", `translate(0, ${this.height})`)
                .call(xAxis);

            // Add Y axis
            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => af(d)))
                .range([this.innerHeight, 0]);

            const yAxis = d3.axisLeft(y)
                .ticks(3)
                .tickFormat(x => `${x.toFixed(1)} ${this.unit}`)
                .tickSizeInner(-this.innerWidth)

            this.g.append("g")
                .call(yAxis);

            this.g.append("path")
                .datum(data)
                .attr("class", 'line')
                .attr("d", d3.line()
                    .defined(d => def(af(d)))
                    .x(d => x(d.date))
                    .y(d => y(af(d)))
                )


            const ls = {
                h: {
                    b: this.svg.select('g.hover'),
                    l: this.svg.select('g.hover line'),
                    t: this.svg.select('g.hover text')
                },
                s: {
                    b: this.svg.select('g.selected'),
                    l: this.svg.select('g.selected line'),
                    t: this.svg.select('g.selected text')
                }
            }

            const setYear = (y, t) => {
                const d = new Date(`${y}-01-01`)
                ls[t].l.attr('x1', x(d))
                    .attr('x2', x(d))
                    .attr('y1', 0)
                    .attr('y2', self.innerHeight)

                ls[t].t.text(y)
                    .attr('x', x(d))
                    .attr('y', self.innerHeight + 10)

                self.$emit('yearChange', {y, t})
            }

            this.svg.select('rect.cap').on('mousemove', function(e) {
                const p = d3.pointer(e)
                const y = x.invert(p[0]).getFullYear();
                setYear(y, 'h')
            }).on('mouseenter', function(e) {
                ls['h'].b.attr('visibility', 'visible')
            }).on('mouseleave', function(e) {
                ls['h'].b.attr('visibility', 'hidden')
                self.$emit('yearChange', {y: null, t: 'h'})
            }).on('click', function(e) {
                const p = d3.pointer(e)
                const y = x.invert(p[0]).getFullYear();
                setYear(y, 's')
            })
        }
    },
}
</script>
