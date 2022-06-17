export { isDefined, periods, diffFormatter, baseFormatter };

import * as d3 from "d3";

const isDefined = v => typeof v == 'number' && !isNaN(v)
const periods = {
    p1: [1940, 1960],
    // p1: [1940, 1980],
    p2: [2010, 2022],
    // p2: [2000, 2022],
}
const diffFormatter = d3.format("+.1f")
const baseFormatter = d3.format(".1f")
