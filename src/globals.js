import * as d3 from "d3";

const isDefined = v => typeof v == 'number' && !isNaN(v)
const periods = {
    p1: [1931, 1960],
    // p1: [1940, 1980],
    p2: [1991, 2020],
    // p2: [2000, 2022],
}

const dataUrls = {
    station: (id, ind, freq, format = "csv") => `/api/${freq}/station/${id}/type/${ind}/format/${format}`,
    combined: (ind, format = "csv") => `/api/y/type/${ind}/format/${format}`,
}

const formatters = {
    diff: d3.format("+.1f"),
    base: d3.format(".1f"),
}

export { 
    isDefined, 
    periods, 
    formatters,
    dataUrls,
};
