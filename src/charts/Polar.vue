<template>
    <div ref="container" class='polar-chart-container'>
        <div class='slider'>
            <select v-model='time'>
                 <option value="monthly">Monthly</option>
                 <option value="daily">Daily</option>
            </select>
            <input type="range" :min="minYear" :max="maxYear" v-model='year'>
            <span>{{ year }}</span>
        </div>
        <svg class='polar-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${width/2}, ${height/2})`'>
                <g class='path-years'>
                    <path v-for="(v, k) in yearData" :d='d3.lineRadial().radius(d => scales.y(d.value)).angle(d => scales.x(new Date(d.date).setFullYear(2000)))(v)' />
                    <path v-if="yearData[year]" class="active" :d='d3.lineRadial().radius(d => scales.y(d.value)).angle(d => scales.x(new Date(d.date).setFullYear(2000)))(yearData[year])' />
                </g>
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
        p () { return {id: this.id, ind: this.ind, period: this.time} },
        unit () { return this.baseStore.indicator(this.ind).unit },
        yearData () {
            let t = {};
            this.data.forEach(d => {
                const year = d.date.getFullYear()
                if (!(year in t))
                    t[year] = [];
                t[year].push(d);
            });
            // console.log(yearData)
            return t;
        }
    },
    data: () => ({
        d3: d3,
        time: 'daily',
        minYear: null,
        maxYear: 2022,
        year: 2022,
        width: 0,
        height: 0,
        innerRadius: 50,
        radius: 200,
        g: null,
        scales: {},
        data: []
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
            () => [this.id, this.ind, this.time],
            (n, o) => {
                this.stationStore.onLoaded(this.p, d => {
                    this.data = d
                    console.log(this.yearData)
                    this.plotBase();
                    // this.plotPath();
                })
            },
            { immediate : true}
        )

        // this.$watch(
        //     () => [this.year],
        //     (n, o) => {
        //         this.plotPath()
        //     }
        // )
    },
    methods: {
        plotBase(d) {
            const data = this.data;

            [this.minYear, this.maxYear] = d3.extent(data.map(d => d.date.getFullYear()));
            this.year = this.maxYear;

            console.log([this.minYear, this.maxYear])

            const x = this.scales.x = d3.scaleTime()
                .domain([new Date(2000, 0, 1), new Date(2001, 0, 1) - 1])
                .range([0, 2 * Math.PI])

            let [minValue, maxValue] = d3.extent(data, d => d.value)

            maxValue += (maxValue - minValue)/10
            if (!['rr', 'ss'].includes(this.ind))
                minValue -= (maxValue - minValue)/10


            const y = this.scales.y = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([this.innerRadius, this.radius]);


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
        },
        // plotPath() {
        //     console.log(`plotPath ${this.year}`)
        //
        //     const x = this.scales.x;
        //     const y = this.scales.y;
        //
        //     // console.log(yearData)
        //     // console.log(this.data.map(e => ({date: e.date, x: x(e.date)})))
        //     // const def = v => typeof v == 'number' && !isNaN(v)
        //
        // }
    },
}
</script>
