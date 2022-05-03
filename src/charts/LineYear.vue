<template>
    <div ref="container">
        <svg class='line-year-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${m.l}, ${m.t})`' fill="#333">
                <g class='inner'/>
                <g class='selected'>
                    <line y1='0' :y2='innerHeight'/>
                    <g :transform='`translate(0, ${innerHeight + 12})`'>
                        <rect :transform='`translate(-50, 0)`' />
                        <text/>
                    </g>
                </g>
                <g class='hover' visibility='hidden'>
                    <line y1='0' :y2='innerHeight'/>
                    <g :transform='`translate(0, ${innerHeight + 12})`'>
                        <rect :transform='`translate(-50, 0)`' />
                        <text class="back"/>
                        <text class="front"/>
                    </g>
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
            t: 15, r: 15, b: 15, l: 50
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
        def: v => typeof v == 'number' && !isNaN(v),
        plot() {
            const self = this;
            const time = 'v1'
            const af = d => d[time]
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
            const dataDef = data.filter(e => this.def(af(e))).map(e => af(e));
            const avg = dataDef.reduce( ( p, c ) => p + c, 0 ) / dataDef.length;


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
                    .defined(d => this.def(af(d)))
                    .x(d => x(d.date))
                    .y(d => y(af(d)))
                )

            this.g.append("line")
                .attr("class", 'avg')
                .attr("x1", 0)
                .attr("y1", y(avg))
                .attr("x2", this.innerWidth)
                .attr("y2", y(avg))



            const ls = {
                h: {
                    b: this.svg.select('g.hover'),
                    t: this.svg.selectAll('g.hover text')
                },
                s: {
                    b: this.svg.select('g.selected'),
                    t: this.svg.selectAll('g.selected text')
                }
            }

            const setYear = (y, t) => {
                if (y !== null) {
                    const d = new Date(`${y}-01-01`)
                    ls[t].b.attr('transform', `translate(${x(d)}, 0)`)
                    ls[t].t.text(y)
                } else {
                    ls[t].b.attr('visibility', 'hidden')
                }
                self.$emit('yearChange', {y, t})
            }

            let handle = 'h';
            const getYearFromE = function(e) {
                const p = d3.pointer(e);
                const d = x.invert(p[0]);
                const y = d.getFullYear();
                return d.getMonth() < 6 ? y : y+1;
            }
            this.svg.select('rect.cap')
                .on('mousemove', function(e) {
                    if (handle == 'h')
                        ls['h'].b.attr('visibility', 'visible')
                    setYear(getYearFromE(e), handle)
                }).on('mousedown', function(e) {
                    setYear(null, 'h')
                    handle = 's'
                    setYear(getYearFromE(e), handle)
                }).on('mouseup', function(e) {
                    setYear(getYearFromE(e), handle)
                    handle = 'h';
                }).on('mouseleave', function(e) {
                    setYear(null, 'h')
                })

            setYear(d3.max(data, d => d.date).getFullYear(), 's')
            setYear(null, 'h')
        }
    },
}
</script>
