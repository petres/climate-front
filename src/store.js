import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

import info from './info.js';

const prep = {
    labels: (d) => Object.assign({}, ...d.map((x) => ({[x.id]: x.label}))),
    topics: (d) => d,
    // {"id":"emp_wiss","year":2021,"rel.inno":1.1359,"rel.eu":0.9682,"rel.top3":1.8143}
    values: (d) => Object.assign({}, ...d.map((x) => ({[x.id]: x}))),
    // countries: (d) => Object.assign({}, ...d.map((x) => ({[x.id]: [x.name]}))),
    countries: (d) => d,
    docs: (d) => d,
};

export const store = new Vuex.Store({
    state: {
        data: {},
        names: [],
        info: info,
        highlightTopics: [],
        highlightTargets: [],
    },
    getters: {
        data: (s) => (id) => s.data[id],
        loaded: (s) => Object.keys(prep).filter(d => !s.names.includes(d)) == 0,
        value: (s) => (id, value = undefined) => value ? s.data.values[id][value] : s.data.values[id],
        topicData: (s, g) => (topicId) => {
            // console.log(topicId)
            // console.log(s.data.topics)
            const ids = s.data.topics.filter(e => e.topic == topicId).map(e => e.id)
            // console.log(ids)
            return ids.map(id => ({
                id: id,
                // label: s.data.labels[id],
                value: g.value(id)
            }));
        },
        // labelForId: (s) => (id) => s.data.labels[id],

        docs: (s) => (topicId, type) => {
            // console.log(s.data.docs)
            return s.data.docs[topicId][type].map(d => {
                d['fileUrl'] = PUBLIC_PATH + `docs/${d['file']}`;
                d['imgUrl'] = PUBLIC_PATH + `docs/${d['file'] + ".png"}`;
                return d;
            });
        },

        targets: (s) => s.info.targets,
        topics: (s) => s.info.topics,


        topic: (s, g) => (id) => {
            const t = g.topics[id]
            const a = t.nr.substring(0, 1);
            t.area = {
                code: a,
                name: s.info.areas[a].name
            }
            if (a == 'B') {
                t.docBaseUrl = PUBLIC_PATH + `docs/B/1/`;
            } else {
                t.docBaseUrl = PUBLIC_PATH + `docs/A/2/`;
            }

            return t
        },

        topicByNr: (s, g) => (nr) => g.topic(s.info.topicIdByNr[nr]),

        target: (s) => (id) => {
            // console.log(id);
            const info = s.info.targetById[id];
            // console.log(id)
            // console.log(info)
            info.id = id
            info.parentName = s.info.targetById[id.substring(0, 1)].name;
            return info;
        },

        targetsForTopic: (s, g) => (topic) => {
            // console.log(s.info.targetById)
            return s.info.topicsToTargets[topic.nr].map(id => g.target(id))
        },

        toColorNr: s => v => {
            for (const e of  s.info.colorClasses) {
                if (v > e.nr)
                    return (e.id)
            }
        }
    },
    mutations: {
        loaded(state, content) {
            state.data[content.name] = content.data
            state.names = state.names.concat([content.name])
        },
        highlightTopics(state, highlight) {
            state.highlightTopics = highlight
        },
        highlightTargets(state, highlight) {
            state.highlightTargets = highlight
        },
    },
    actions: {
        init(context) {
            Object.keys(prep).forEach((d) => {
                axios
                    .get(PUBLIC_PATH + `data/${d}.json`)
                    .then(response => context.commit('loaded', {
                        name: d,
                        data: prep[d](response.data)
                    }))
            });
        },
        highlightTopicsOfTarget(context, targetId = undefined) {
            let topicNrs = [];
            if (targetId) {
                const target = context.getters.target(targetId);
                topicNrs = target.topics.map(id => context.getters.topic(id).nr);
            }
            context.commit('highlightTopics', topicNrs);
        },
        highlightTargetsOfTopic(context, topicId = undefined) {
            let targetNrs = [];
            if (topicId) {
                const targets = context.getters.targetsForTopic(context.getters.topic(topicId));
                targetNrs = targets.map(t => t.id);
                // console.log(targetNrs)
            }
            context.commit('highlightTargets', targetNrs);
        },
        clearHighlighted(context) {
            context.commit('highlightTopics', []);
            context.commit('highlightTargets', []);
        },
    }
})
