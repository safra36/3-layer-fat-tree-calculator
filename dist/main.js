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
function printConnections(switches) {
    for (const switchObject of switches) {
        for (const connection of [...switchObject.connections_up]) {
            console.log(switchObject.switchId, connection, 1);
        }
        for (const connection of [...switchObject.connections_down]) {
            console.log(switchObject.switchId, connection, 1);
        }
    }
}
// store links with direction to travers and find a path
function generateLinks(switches) {
    let links = [];
    for (const switchObject of switches) {
        for (const connection of [...switchObject.connections_up]) {
            links.push({
                entAt: connection,
                startAt: switchObject.switchId
            });
            console.log(switchObject.switchId, connection, 1);
        }
        for (const connection of [...switchObject.connections_down]) {
            links.push({
                entAt: connection,
                startAt: switchObject.switchId
            });
            console.log(switchObject.switchId, connection, 1);
        }
    }
    return links;
}
function generateGraph(k, start, end) {
    const startServer = cons.physical[start];
    const endServer = cons.physical[end];
    let routes = [];
    const halfK = (+k / 2);
    for (let x = 0; x < halfK; x++) {
        const edgeSwitch = switches.find(switchObject => switchObject.switchId == startServer.connections_up[0]);
        const aggregationSwitch = switches.find(switchObject => switchObject.switchId == edgeSwitch.connections_up[x]);
        for (let j = 0; j < halfK; j++) {
            const coreSwtich = switches.find(switchObject => switchObject.switchId == aggregationSwitch.connections_up[j]);
            const endServerPod = switches.find(switchObject => switchObject.switchId == endServer.connections_up[0]).pod;
            const nextAggregationSwitch = switches.filter(switchObject => switchObject.pod == endServerPod && switchObject.connections_up.includes(coreSwtich.switchId))[0];
            const nextEdgeSwitch = endServer.connections_up[0];
            let route = [startServer.switchId, startServer.connections_up[0]];
            route.push(aggregationSwitch.switchId, coreSwtich.switchId, nextAggregationSwitch.switchId, nextEdgeSwitch, endServer.switchId);
            routes.push(route);
        }
    }
    return routes;
}
const k = 128;
const map = csm(k);
const cons = ccm(map);
const switches = [
    ...cons.aggregation,
    ...cons.core,
    ...cons.edge,
    ...cons.physical
];
// console.log(switches);
// printConnections(switches);
const graphs = generateGraph(k, 0, 128);
for (const graphArray of graphs) {
    console.log("\n");
    for (let x = 1; x < graphArray.length; x++) {
        console.log(graphArray[x - 1], graphArray[x], 1);
    }
}
// console.log(links);
/* const startServer = cons.physical[0]
const endServer = cons.physical[1]


let routes = [];
const halfK = (+k/2);

for(let x = 0 ; x< halfK ; x++) {

    const edgeSwitch = switches.find(switchObject => switchObject.switchId == startServer.connections_up[0]) as Switch;
    const aggregationSwitch = switches.find(switchObject => switchObject.switchId == edgeSwitch.connections_up[x]) as Switch;


    for(let j=0;j<halfK;j++) {
        

        const coreSwtich = switches.find(switchObject => switchObject.switchId == aggregationSwitch.connections_up[j]) as Switch;
        const endServerPod = (switches.find(switchObject => switchObject.switchId == endServer.connections_up[0]) as Switch).pod as number;

        const nextAggregationSwitch = switches.filter(switchObject => switchObject.pod == endServerPod && switchObject.connections_up.includes(coreSwtich.switchId))[0]
        const nextEdgeSwitch = endServer.connections_up[0];

        // console.log(nextTheNextServer, DatNextServer, endServerPod, edgeSwitch.switchId, aggregationSwitch.switchId, route);
        

        let route = [startServer.switchId, startServer.connections_up[0]];
        route.push(aggregationSwitch.switchId, coreSwtich.switchId, nextAggregationSwitch.switchId, nextEdgeSwitch, endServer.switchId)
        routes.push(route)

    }

}

console.log(routes); */
/* let shits = []
// create a last index of
let lastIndex = 0;
let aggregationIndex = 0;
let edgeIndex = 0;
let coreIndex = 0;

while(true) {

    // console.log(lastIndex, ((+k/2)) - 1);
    console.log("Sam", coreIndex, aggregationIndex, edgeIndex);

    let visited_1 = [startServer.switchId];
    let visited_2 = [endServer.switchId];
    
    while(true) {

        console.log("Sam 2", coreIndex, aggregationIndex, edgeIndex);
        
        const currentServer = switches.find(swtichObject => swtichObject.switchId == visited_1[visited_1.length-1]) as Switch;
        // currentServer.connections_up.map(connection => visited_1.push(connection));

        if(currentServer.connections_up.length > 1) {
            // console.log("Khier", currentServer.type, visited_1);
            
            if(currentServer.type == SwitchType.Aggregation) {
                visited_1.push(currentServer.connections_up[aggregationIndex] as number)
            } else if(currentServer.type == SwitchType.Core) {
                visited_1.push(currentServer.connections_up[coreIndex] as number)
            } else if(currentServer.type == SwitchType.Edge) {
                visited_1.push(currentServer.connections_up[edgeIndex] as number)
            }

        } else {
            console.log("goes", currentServer.type);
            visited_1.push(currentServer.connections_up[0] as number)
        }

        
    
        const targetServer = switches.find(swtichObject => swtichObject.switchId == visited_2[visited_2.length-1]) as Switch;
        // targetServer.connections_up.map(connection => visited_2.push(connection));
        if(targetServer.connections_up.length > 1) {
            // visited_2.push(targetServer.connections_up[lastIndex] as number)

            if(targetServer.type == SwitchType.Aggregation) {
                visited_1.push(targetServer.connections_up[aggregationIndex] as number)
            } else if(targetServer.type == SwitchType.Core) {
                visited_1.push(targetServer.connections_up[coreIndex] as number)
            } else if(targetServer.type == SwitchType.Edge) {
                visited_1.push(targetServer.connections_up[edgeIndex] as number)
            }

        } else {
            visited_2.push(targetServer.connections_up[0] as number)
        }
    
        const similarity = Utils.getSimilarity(visited_1, visited_2);
        if(similarity.length > 0) {
            break;
        }

        coreIndex++;

        if(coreIndex == ((+k/2))) break;
    
    
    }

    console.log("Doh");
    

    shits.push(Utils.mergePath(visited_1, visited_2))

    

    if(coreIndex != ((+k/2))) {
        coreIndex = 0;
        aggregationIndex = +aggregationIndex + 1;
    }

    if(aggregationIndex != ((+k/2))) {
        aggregationIndex = 0;
        edgeIndex = +edgeIndex + 1;
    }

    if(edgeIndex ==((+k/2))) break;

    console.log(coreIndex, aggregationIndex, edgeIndex);
    
    

}

console.log(shits); */
// for(const)
/* for(const server of cons.physical) {

    let otherServers = JSON.parse(JSON.stringify(cons.physical)) as Switch[]
    otherServers.splice(otherServers.indexOf(server));

    let visitedPath = new Set<number>();

    for(const otherServer of otherServers) {


    }
    

} */
/* let paths : SwitchPath[] = []

for(const server of cons.physical) {

    let linkCopy = JSON.parse(JSON.stringify(links)) as Link[];

    let path : SwitchPath = {
        startId : server.switchId,
        endId : -1,
        paths : []
    }

    let startingLinkIndex = linkCopy.findIndex(linkObject => linkObject.startAt == server.switchId);
    let startingLink = linkCopy[startingLinkIndex];

    let otherServers = JSON.parse(JSON.stringify(cons.physical)) as Switch[]
    otherServers.splice(otherServers.indexOf(server));


    for(const targetServer of otherServers) {

        console.log(server, targetServer);
        
        if(path.endId == -1) path.endId = targetServer.switchId;
        let traversingPath = [startingLink.startAt];

        console.log(startingLink);
        
        while(startingLink.entAt != targetServer.switchId) {

            traversingPath.push(startingLink.entAt);
            linkCopy.splice(startingLinkIndex, 1);
            startingLinkIndex = linkCopy.findIndex(linkObject => linkObject.startAt == startingLink.entAt);
            startingLink = linkCopy[startingLinkIndex];

            console.log("LEN", linkCopy.length, startingLinkIndex);
            
            

        }

        
        path.paths.push(traversingPath);

        console.log("PATH", path);

    }

    console.log(path);
    break;
    

} */
