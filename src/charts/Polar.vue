<template>
    <div ref="container" class='polar-chart-container'>
        <div class='slider'>
            <select v-model='time'>
                 <option value="v31">Monthly</option>
                 <option value="v15">2 Weekks</option>
                 <option value="v7">Week</option>
                 <option value="v1">Daily</option>
            </select>
            <input type="range" :min="minYear" :max="maxYear" v-model='year'>
            <span>{{ year }}</span>
        </div>
        <svg class='polar-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${width/2}, ${height/2})`'>
                <g class='path-years'>
                    <!-- <path v-for="(v, k) in yearData" :d='d3.lineRadial().radius(d => scales.y(d.value)).angle(d => scales.x(new Date(d.date).setFullYear(2000)))(v)' />
                    <path v-if="yearData[year]" class="active" :d='d3.lineRadial().radius(d => scales.y(d.value)).angle(d => scales.x(new Date(d.date).setFullYear(2000)))(yearData[year])' /> -->
                </g>
                <g class='path-avg'></g>
                <g class='x-axis'></g>
                <g class='y-axis'></g>
                <g class='hover' visibility="hidden">
                    <text class='date' text-anchor='middle' dominant-baseline="middle" transform='translate(0, -20)'/>
                    <text class='value' text-anchor='middle' dominant-baseline="middle" transform='translate(0, 0)'/>
                    <text class='diff' text-anchor='middle' dominant-baseline="middle" transform='translate(0, 20)'/>
                    <line class='diff'/>
                    <circle class='year' r="4"/>
                    <circle class='avg' r="4"/>
                </g>
                <line class='test' stroke="black"/>
                <circle class='capCircle' :r="radius" opacity="0"/>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import { stationStore } from '@/stores/station.js'
import { baseStore } from '@/stores/base.js'

export default {
    props: {
        id: String,
        ind: String,
    },
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore()
        }
    },
    computed: {
        p () { return {id: this.id, ind: this.ind, period: 'daily'} },
        unit () { return this.baseStore.indicator(this.ind).unit },
        yearData () {
            let t = {};
            this.data.forEach(d => {
                const year = d.date.getFullYear()
                if (!(year in t))
                    t[year] = [];
                t[year].push(d);
            });
            // console.log('yearData')
            return t;
        }
    },
    data: () => ({
        d3: d3,
        time: 'v7',
        minYear: null,
        maxYear: 2022,
        year: 2021,
        width: 0,
        height: 0,
        innerRadius: 80,
        radius: 200,
        g: null,
        scales: {},
        data: [],
        ready: false
    }),
    mounted() {
        const cw = this.$refs.container.clientWidth;
        // this.width = Math.min(cw, 5 * this.radius);
        this.width = cw;
        this.radius = Math.min(cw/2 * 0.9, 300);
        this.height = this.radius*2 * 1.1;

        // console.log(this.data.map(d => d.date.getFullYear()))
        const svg = d3.select(this.$refs.container).select("svg.polar-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        this.g = svg.select("g")

        // this.plotBase();

        this.$watch(
            () => [this.id, this.ind, this.time],
            (n, o) => {
                this.stationStore.onLoaded(this.p, d => {
                    // this.data = d.filter(d => d.date.getFullYear() < 2020)
                    this.data = d
                    this.plotBase();
                    // this.plotPath();
                })
            },
            { immediate : true}
        )

        this.$watch(
            () => [this.year],
            (n, o) => {
                this.plotPath();
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
        plotBase() {
            const self = this;
            const def = v => typeof v == 'number' && !isNaN(v);

            // console.log(`plotbase ${this.time}`)
            const data = this.data;

            const af = d => d[this.time];

            [this.minYear, this.maxYear] = d3.extent(data.map(d => d.date.getFullYear()));
            // this.year = this.maxYear;

            // console.log([this.minYear, this.maxYear])

            const x = this.scales.x = d3.scaleTime()
                .domain([new Date(2000, 0, 1), new Date(2000, 11, 31) - 1])
                .range([0, 2 * Math.PI])

            const ext = 1/50;
            let [minValue, maxValue] = d3.extent(data, d => af(d))

            maxValue += (maxValue - minValue)*ext
            if (!['rr', 'ss'].includes(this.ind))
                minValue -= (maxValue - minValue)*ext

            // console.log([minValue, maxValue])

            const y = this.scales.y = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([this.innerRadius, this.radius]);


            const radiusText = 1.02*this.radius;

            const ticks = [...Array(12).keys()].map(i => new Date(2000, i, 1))


            const xAxis = g => g
                .call(g => g.selectAll("g")
                    .data(ticks)
                    .join("g")
                    .each((d, i) => d.id = `m${i}`)
                    .call(g => g.append("path")
                        .attr("stroke", "#000")
                        .attr("stroke-opacity", 0.2)
                        .attr("d", d => `
                        M${d3.pointRadial(x(d), this.innerRadius)}
                        L${d3.pointRadial(x(d), radiusText + 10)}
                        `)
                    )
                    .call(g => g.append("path")
                        .attr("id", d => d.id)
                        .datum(d => [d, d3.utcMonth.offset(d, +1)])
                        .attr("fill", "none")
                        // .attr("stroke", "black")
                        .attr("d", ([a, b], i) => `
                            M${d3.pointRadial(x(a), radiusText)}
                            A${radiusText}, ${radiusText} 0,0,1 ${d3.pointRadial(x(b), radiusText)}
                        `)
                    )
                    .call(g => g.append("text")
                        .append("textPath")
                        .attr("startOffset", 6)
                        .attr("xlink:href", d => `#${d.id}`)
                        .text(d3.timeFormat("%B"))
                    )
                )

            this.g.select('.x-axis').selectAll("*").remove();
            this.g.select('.x-axis')
                .call(xAxis);

            const yAxis = g => g
                .call(g => g.selectAll("g")
                    .data(y.ticks(6))
                    .join("g")
                    .call(g => g.append("circle")
                        .attr("r", y)
                    )
                    .call(g => g.append("text")
                        .attr("y", d => -y(d))
                        .attr("dy", "0.35em")
                        .text((x, i) => `${x} ${this.unit}`)
                        .clone(true)
                        .attr("y", d => y(d))
                        .selectAll(function() { return [this, this.previousSibling]; })
                        .clone(true)
                        .attr("class", "text")
                    )
                )

            this.g.select('.y-axis').selectAll("*").remove();
            this.g.select('.y-axis')
                .call(yAxis);

            this.g.select('.path-years').selectAll("path").remove();


            Object.keys(this.yearData).forEach(k => {
                this.g.select('.path-years')
                    .append("path")
                    .datum(this.yearData[k])
                    .attr("data-year", k)
                    .attr("d", d3.lineRadial()
                        .defined(d => def(af(d)))
                        .radius(d => this.scales.y(af(d)))
                        .angle(d => this.scales.x(new Date(d.date).setFullYear(2000)))
                    )

            });


            // AVERAGE
            const df = d3.timeFormat("%m-%d")
            const dfy = d3.timeFormat("%Y-%m-%d")
            const dfn = d3.timeFormat("%a, %d. %b, %Y")
            const avgData = {}
            const date2value = {}
            const date2avg = {}
            this.data.forEach((d) => {
                // console.log(d.date)
                // console.log(df(d.date))
                const v = af(d)
                if (def(v)) {
                    const f = df(d.date)
                    date2value[dfy(d.date)] = v;
                    if (!(f in avgData))
                        avgData[f] = {s: 0, c: 0}

                    avgData[f].s += v
                    avgData[f].c += 1
                }
            });
            const avgValue = Object.keys(avgData).map(k => {
                const d = avgData[k];
                const v =  d.s/d.c
                date2avg[k] = v;
                return {
                    value: v,
                    date: new Date(`2000-${k}`)
                }
            }).sort((a, b) => a.date - b.date);
            // console.log(avgValue)
            this.g.select('.path-avg').selectAll("path").remove();
            this.g.select('.path-avg')
                .append("path")
                .datum(avgValue)
                .attr("data-year", 'avg')
                .attr("d", d3.lineRadial()
                    .defined(d => def(d.value))
                    .radius(d => this.scales.y(d.value))
                    .angle(d => this.scales.x(new Date(d.date).setFullYear(2000)))
                )

            this.ready = true;
            this.plotPath()

            // const l = this.g.select('line.test')
            //     .attr("x1", 0)
            //     .attr("y1", 0)
            const gHover = this.g.select('g.hover');
            const circleAvg = gHover.select('circle.avg')
            const circleYear = gHover.select('circle.year')
            const textDate = gHover.select('text.date')
            const textValue = gHover.select('text.value')
            const textDiff = gHover.select('text.diff')
            const lineDiff = gHover.select('line.diff')

            // console.log(date2value)
            this.g.select('circle.capCircle').on('mousemove', function(e) {
                const p = d3.pointer(e)

                let aMouse = Math.atan2(p[1], p[0]) + Math.PI/2
                if (aMouse < 0)
                    aMouse += 2*Math.PI
                // console.log(aMouse )
                const date = x.invert(aMouse);
                const dateBase = df(date);
                const k = `${self.year}-${dateBase}`;
                const kBase = `2000-${dateBase}`;
                const a = x(new Date(kBase));
                const [cos, sin] = [Math.cos(a - Math.PI/2), Math.sin(a - Math.PI/2)]
                const vYear = date2value[k];
                const vYearY = y(vYear)
                circleYear.attr("cx", cos*vYearY)
                    .attr("cy", sin*vYearY)

                const vAvg = date2avg[dateBase];
                const vAvgY = y(vAvg)
                circleAvg.attr("cx", cos*vAvgY)
                    .attr("cy", sin*vAvgY)

                lineDiff.attr("x1", cos*vYearY)
                    .attr("y1", sin*vYearY)
                    .attr("x2", cos*vAvgY)
                    .attr("y2", sin*vAvgY)

                textDate.text(dfn(new Date(k)))
                textValue.text(`${vYear.toFixed(1)} ${self.unit} (Avg: ${vAvg.toFixed(1)} ${self.unit})`)

                const diff = vYear - vAvg
                textDiff.text(`${d3.format("+.1f")(diff)} ${self.unit}`)
                    .classed('pos', diff > 0)
                    .classed('neg', diff < 0)

            }).on('mouseenter', function(e) {
                gHover.attr('visibility', 'visible')
            }).on('mouseleave', function(e) {
                gHover.attr('visibility', 'hidden')
            })

        },
        plotPath() {
            this.g.select('.path-years path.active').classed('active', false)
            this.g.select(`.path-years path[data-year="${this.year}"]`).classed('active', true).raise()
        }
    },
}
</script>
