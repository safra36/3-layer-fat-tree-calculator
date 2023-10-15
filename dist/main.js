"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccm = exports.csm = void 0;
const types_1 = require("./types");
// create switch map
function csm(k) {
    const pods = types_1.Utils.getPodCount(k);
    const physicalServersCount = types_1.Utils.getPodPhysicalServerCount(k) * pods;
    const edgeSwitchesCount = types_1.Utils.getEdgeSwitchCountOfPod(k);
    const aggregationSwitchesCount = types_1.Utils.getAggregationSwitchCountOfPod(k);
    const coreSwitchCount = types_1.Utils.getCoreSwitchCount(k);
    // console.log(Utils.getPodPhysicalServerCount(k), pods, physicalServersCount, edgeSwitchesCount, aggregationSwitchesCount, coreSwitchCount);
    const physicalServers = types_1.Utils.generateSwitch(physicalServersCount, types_1.SwitchType.Server);
    const podList = types_1.Utils.generateNPods(pods);
    let aggregationSwitches = [];
    let edgeSwitches = [];
    podList.map(podObject => {
        aggregationSwitches = [...aggregationSwitches, ...podObject.aggregation];
        edgeSwitches = [...edgeSwitches, ...podObject.edge];
    });
    const coreSwitches = types_1.Utils.generateSwitch(coreSwitchCount, types_1.SwitchType.Core, aggregationSwitches[aggregationSwitches.length - 1].switchId);
    const switches = types_1.Utils.organizeSwitches([
        ...physicalServers,
        ...edgeSwitches,
        ...aggregationSwitches,
        ...coreSwitches
    ]);
    return {
        k,
        aggregation: switches.filter(switchObject => switchObject.type == types_1.SwitchType.Aggregation),
        core: switches.filter(switchObject => switchObject.type == types_1.SwitchType.Core),
        edge: switches.filter(switchObject => switchObject.type == types_1.SwitchType.Edge),
        physical: switches.filter(switchObject => switchObject.type == types_1.SwitchType.Server)
    };
}
exports.csm = csm;
// create connection map
function ccm(map) {
    let _map = JSON.parse(JSON.stringify(map));
    for (let edgeIndex = 0; edgeIndex < _map.edge.length; edgeIndex++) {
        const index = (edgeIndex * (+map.k / 2));
        for (let x = index; x < (+index + (+map.k / 2)); x++) {
            _map.edge[edgeIndex].connections_down.push(_map.physical[x].switchId);
            _map.physical[x].connections_up.push(_map.edge[edgeIndex].switchId);
        }
    }
    for (let agregationIndex = 0; agregationIndex < _map.aggregation.length; agregationIndex++) {
        const y = (+map.k / 2);
        const groupId = Number.parseInt(`${(agregationIndex / y)}`);
        const edgeIndexStart = +y * +groupId;
        for (let x = edgeIndexStart; x < (+edgeIndexStart + y); x++) {
            _map.aggregation[agregationIndex].connections_down.push(_map.edge[x].switchId);
            _map.edge[x].connections_up.push(_map.aggregation[agregationIndex].switchId);
        }
    }
    let pods = new Map();
    for (const podObject of _map.aggregation) {
        const podIndex = podObject.pod;
        const pod = pods.get(podIndex);
        if (!pod)
            pods.set(podIndex, [podObject]);
        else {
            pods.set(podIndex, [...pod, podObject]);
        }
    }
    // console.log(pods);
    const y = (+map.k / 2);
    for (const pod of pods) {
        const insidePods = pod[1];
        let lastIndex = 0;
        for (const podObject of insidePods) {
            for (let j = 0; j < y; j++) {
                podObject.connections_up.push(_map.core[lastIndex].switchId);
                _map.core[lastIndex].connections_down.push(podObject.switchId);
                lastIndex++;
            }
        }
    }
    return _map;
}
exports.ccm = ccm;
let d = Date.now();
const map = csm(8);
const cons = ccm(map);
console.log("TOOK", Date.now() - d);
const switches = [
    ...cons.aggregation,
    ...cons.core,
    ...cons.edge,
    ...cons.physical
];
for (const switchObject of switches) {
    for (const connection of [...switchObject.connections_up]) {
        console.log(switchObject.switchId, connection, 1);
    }
}
