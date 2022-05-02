<template>
    <div ref="container" class='polar-chart-container'>
        <svg class='polar-chart' :height='height' :width='width' :style="{opacity: stationStore.loaded(p) ? 1 : 0.3}">
            <g :transform='`translate(${width/2}, ${height/2})`'>
                <g class='path-years'></g>
                <g class='path-avg'></g>
                <g class='areas'></g>
                <g class='x-axis'></g>
                <g class='y-axis'></g>
                <g v-if='value' class='hover' >
                    <text text-anchor='middle' dominant-baseline="middle">
                        <tspan class="weekday" x='0' y="-45px">{{ weekday }},</tspan>
                        <tspan class="dayMonth" x='0' y="-32px">{{ dayMonth }}</tspan>
                        <tspan class="year header" x='-32' y="-10px">{{ years.s }}</tspan>
                        <tspan class="year value" x='-32' y="5px">{{ value.toFixed(1) }}{{ unit }}</tspan>
                        <tspan class="avg header" x='32' y="-10px">Avg.</tspan>
                        <tspan class="avg value" x='32' y="5px">{{ valueAvg.toFixed(1) }}{{ unit }}</tspan>
                        <tspan class="diff header" :class="{ pos: (value - valueAvg) > 0, neg: (value - valueAvg) < 0 }" x='0' y="28px">Diff.</tspan>
                        <tspan class="diff value" x='0' y="43px">{{ diff }}{{ unit }}</tspan>
                    </text>
                    <line :class="{ pos: (value - valueAvg) > 0, neg: (value - valueAvg) < 0 }" class='diff'/>
                    <circle class='year' r="4"/>
                    <circle class='avg' r="4"/>
                </g>
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
        smooth: String,
        years: Object,
        valueType: String,
    },
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore()
        }
    },
    computed: {
        uid() {return `${this.id}-${this.ind}-${this.smooth}-${this.valueType}`},
        weekday() { return d3.timeFormat("%a")(this.date)},
        dayMonth() { return d3.timeFormat("%d. %b")(this.date)},
        diff() { return d3.format("+.1f")(this.value - this.valueAvg)},
        p() { return {id: this.id, ind: this.ind, period: 'daily'} },
        unit() { return this.baseStore.indicator(this.ind).unit },
        yearData() {
            let t = {};
            this.data.forEach(d => {
                const year = d.date.getFullYear()
                if (!(year in t))
                    t[year] = [];
                t[year].push(d);
            });
            // console.log('yearData')
            return t;
        },
        line() {
            return d3.lineRadial()
                .defined(d => this.def(d.value))
                .radius(d => this.y(d.value))
                .angle(d => this.x(new Date(d.date).setFullYear(2000)));
        },
        areaAbove() {
            return d3.areaRadial()
                .defined(this.line.defined())
                .angle(this.line.angle())
                .innerRadius(this.line.radius())
                .outerRadius(this.radius);
        },
        areaBelow() {
            return d3.areaRadial()
                .defined(this.line.defined())
                .angle(this.line.angle())
                .outerRadius(this.line.radius())
                .innerRadius(0);
        }

    },
    data: () => ({
        d3: d3,
        width: 0,
        height: 0,
        innerRadius: 65,
        radius: 200,
        g: null,
        svg: null,
        data: [],
        date: null,
        value: null,
        avgValue: null,
        x: null,
        y: null,
    }),
    mounted() {
        const cw = this.$refs.container.clientWidth;
        // this.width = Math.min(cw, 5 * this.radius);
        this.width = cw;
        this.radius = Math.min(cw/2 * 0.9, 300);
        this.height = this.radius*2 * 1.1;

        // console.log(this.data.map(d => d.date.getFullYear()))
        this.svg = d3.select(this.$refs.container).select("svg.polar-chart")
            .attr("width", this.width)
            .attr("height", this.width)

        this.g = this.svg.select("g")

        // this.plotBase();

        this.$watch(
            () => [this.id, this.ind, this.smooth, this.valueType],
            (n, o) => {
                this.stationStore.onLoaded(this.p, d => {
                    // this.data = d.filter(d => d.date.getFullYear() < 2020)
                    this.data = d
                    this.plotBase();
                })
            },
            { immediate : true}
        )

        this.$watch(
            () => this.years,
            (n, o) => {
                this.highlightYear(n);
            },
            { immediate : false, deep: true}
        )

    },
    methods: {

        plotMonthAxis(x) {
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
        },

        plotValueAxis(y) {
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
                        .text((x, i) => `${this.valueType == "rel" ? this.diffFormat(x) : x} ${this.unit}`)
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
        },

        def: v => typeof v == 'number' && !isNaN(v),
        dateToMD: d3.timeFormat("%m-%d"),
        dateToYMD: d3.timeFormat("%Y-%m-%d"),
        diffFormat: (n) =>  n == 0 ? `±0` : d3.format("+")(n),

        prepData(data) {
            data.forEach(d => {
                d.value = d[this.smooth];
            });

            // - CALC MEAN AND PREP -
            const avgData = {}
            const date2value = {}
            const date2avg = {}

            data.forEach((d) => {
                if (this.def( d.value)) {
                    const f = this.dateToMD(d.date)
                    date2value[this.dateToYMD(d.date)] = { value: d.value };
                    if (!(f in avgData))
                        avgData[f] = {s: 0, c: 0}

                    avgData[f].s += d.value
                    avgData[f].c += 1
                }
            });

            const avgValues = Object.keys(avgData).map(k => {
                const d = avgData[k];
                const v =  d.s/d.c
                date2avg[k] = { value: v};
                return {
                    date: new Date(`2000-${k}`),
                    value: v,
                }
            }).sort((a, b) => a.date - b.date);


            if (this.valueType == 'rel') {
                data.forEach(d => {
                    d.rawValue = d.value;
                    d.value = d.value - date2avg[this.dateToMD(d.date)].value ;
                });

                Object.keys(date2value).forEach(k => {
                    date2value[k].rawValue  = date2value[k].value;
                    date2value[k].value = date2value[k].value - date2avg[k.substring(5)].value ;
                });

                Object.keys(date2avg).forEach(k => {
                    date2avg[k].rawValue  = date2avg[k].value;
                    date2avg[k].value  = 0;
                });

                avgValues.forEach(d => {
                    d.value = 0;
                });
            }

            // - CALC EXTENT -
            const ext = 1/50;
            let [minValue, maxValue] = d3.extent(data, d => d.value);
            maxValue += (maxValue - minValue)*ext;
            if (!['rr', 'ss'].includes(this.ind))
                minValue -= (maxValue - minValue)*ext;
            const extent = [minValue, maxValue];


            return {
                date2value,
                date2avg,
                avgValues,
                extent,
            }
        },

        plotBase() {
            const self = this;

            const {
                date2value,
                date2avg,
                avgValues,
                extent,
            } = this.prepData(this.data);


            // - SCALES -
            const x = this.x = d3.scaleTime()
                .domain([new Date(2000, 0, 1), new Date(2000, 11, 31) - 1])
                .range([0, 2 * Math.PI])

            const y = this.y = d3.scaleLinear()
                .domain(extent)
                .range([this.innerRadius, this.radius]);


            // - AXIS -
            this.plotMonthAxis(x);
            this.plotValueAxis(y);


            // - YEAR PATH -
            this.g.select('.path-years').selectAll("path").remove();
            Object.keys(this.yearData).forEach(k => {
                this.g.select('.path-years')
                    .append("path")
                    .datum(this.yearData[k])
                    .attr("data-year", k)
                    .attr("d", d3.lineRadial()
                        .defined(d => this.def(d.value))
                        .radius(d => y(d.value))
                        .angle(d => x(new Date(d.date).setFullYear(2000)))
                    )
            });
            this.highlightYear(this.years)


            // - AVERAGE PATH -

            this.g.select('.path-avg').selectAll("path").remove();
            this.g.select('.path-avg')
                .append("path")
                .datum(avgValues)
                .attr("data-year", 'avg')
                .attr("d", this.line)


            //  AREA
            this.g.select('defs').remove();

            const defs = this.svg.append('defs');
            defs.append('clipPath')
                .attr('id', `clip-below-${this.uid}`)
                .append('path')
                .datum(avgValues)
                .attr('d', this.areaBelow);

            defs.append('clipPath')
                .attr('id', `clip-above-${this.uid}`)
                .append('path')
                .datum(avgValues)
                .attr('d', this.areaAbove);


            // - MOUSE EVENTS -
            this.g.select('circle.capCircle').on('mousemove', function(e) {
                const p = d3.pointer(e)
                let aMouse = Math.atan2(p[1], p[0]) + Math.PI/2
                if (aMouse < 0)
                    aMouse += 2*Math.PI

                self.date = x.invert(aMouse);

                const dateBase = self.dateToMD(self.date);
                const k = `${self.years.s}-${dateBase}`;
                const a = x(new Date(`2000-${dateBase}`));
                const [cos, sin] = [Math.cos(a - Math.PI/2), Math.sin(a - Math.PI/2)]

                if (!(k in date2value)) {
                    self.value = null;
                    return;
                }

                const vYearY = y(date2value[k].value)
                const vAvgY = y(date2avg[dateBase].value)

                self.g.select('g.hover circle.year')
                    .attr("cx", cos*vYearY)
                    .attr("cy", sin*vYearY)

                self.g.select('g.hover circle.avg')
                    .attr("cx", cos*vAvgY)
                    .attr("cy", sin*vAvgY)

                self.g.select('g.hover line.diff')
                    .attr("x1", cos*vYearY)
                    .attr("y1", sin*vYearY)
                    .attr("x2", cos*vAvgY)
                    .attr("y2", sin*vAvgY)

                if (self.valueType == 'abs') {
                    self.value = date2value[k].value;
                    self.valueAvg = date2avg[dateBase].value;
                } else {
                    self.value = date2value[k].rawValue;
                    self.valueAvg = date2avg[dateBase].rawValue;
                }

            }).on('mouseenter', function(e) {
                self.g.select('g.hover').attr('visibility', 'visible')
            }).on('mouseleave', function(e) {
                self.g.select('g.hover').attr('visibility', 'hidden')
            })



        },
        highlightYear(years) {
            this.g.select('.path-years path.selected').classed('selected', false)
            if (years.s !== null) {
                this.g.select(`.path-years path[data-year="${years.s}"]`).classed('selected', true).raise()

                // console.log(this.yearData[this.years.s])
                if (this.yearData[this.years.s]) {
                    this.g.select('.areas').selectAll("path").remove();
                    this.g.select('.areas').append("path")
                        .attr("class", "area below")
                        .datum(this.yearData[this.years.s])
                        .attr("d", this.areaAbove)
                        .attr('clip-path', `url(#clip-below-${this.uid})`)

                    this.g.select('.areas').append("path")
                        .attr("class", "area above")
                        .datum(this.yearData[this.years.s])
                        .attr("d", this.areaBelow)
                        .attr('clip-path', `url(#clip-above-${this.uid})`)
                }

            }

            this.g.select('.path-years path.hover').classed('hover', false)
            if (years.h !== null && years.s != years.h)
                this.g.select(`.path-years path[data-year="${years.h}"]`).classed('hover', true).raise()
        }
    },
}
</script>
