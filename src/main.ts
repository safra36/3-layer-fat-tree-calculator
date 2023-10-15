import { Switch, SwitchMap, SwitchType, Utils, kInput } from "./types";





// create switch map
export function csm(k : kInput) : SwitchMap {


    const pods = Utils.getPodCount(k);
    const physicalServersCount = Utils.getPodPhysicalServerCount(k) * pods;
    const edgeSwitchesCount = Utils.getEdgeSwitchCountOfPod(k);
    const aggregationSwitchesCount = Utils.getAggregationSwitchCountOfPod(k);
    const coreSwitchCount = Utils.getCoreSwitchCount(k);


    // console.log(Utils.getPodPhysicalServerCount(k), pods, physicalServersCount, edgeSwitchesCount, aggregationSwitchesCount, coreSwitchCount);
    


    const physicalServers = Utils.generateSwitch(physicalServersCount, SwitchType.Server);
    const podList = Utils.generateNPods(pods as kInput);
 

    let aggregationSwitches : Switch[] = [];
    let edgeSwitches : Switch[] = [];

    podList.map(podObject => {
        aggregationSwitches = [...aggregationSwitches, ...podObject.aggregation]
        edgeSwitches = [...edgeSwitches, ...podObject.edge]
    });



    const coreSwitches = Utils.generateSwitch(coreSwitchCount, SwitchType.Core, aggregationSwitches[aggregationSwitches.length-1].switchId);

    const switches = Utils.organizeSwitches([
        ...physicalServers,
        ...edgeSwitches,
        ...aggregationSwitches,
        ...coreSwitches
    ]) 


    return {
        k,
        aggregation : switches.filter(switchObject => switchObject.type == SwitchType.Aggregation),
        core : switches.filter(switchObject => switchObject.type == SwitchType.Core),
        edge : switches.filter(switchObject => switchObject.type == SwitchType.Edge),
        physical : switches.filter(switchObject => switchObject.type == SwitchType.Server)
    }

}


// create connection map
export function ccm( map : SwitchMap) : SwitchMap {

    let _map = JSON.parse(JSON.stringify(map)) as SwitchMap;

    for(let edgeIndex = 0 ; edgeIndex < _map.edge.length ; edgeIndex++) {

        const index = (edgeIndex * (+map.k / 2));

        for(let x=index;x<(+index + (+map.k / 2));x++) { 
            _map.edge[edgeIndex].connections_down.push(_map.physical[x].switchId)
            _map.physical[x].connections_up.push(_map.edge[edgeIndex].switchId)
        }


    }



    for(let agregationIndex = 0 ; agregationIndex < _map.aggregation.length ; agregationIndex++) {

        const y = (+map.k / 2);
        const groupId = Number.parseInt(`${(agregationIndex / y)}`);
        const edgeIndexStart = +y * +groupId;

        for(let x=edgeIndexStart;x<(+edgeIndexStart + y);x++) { 

            _map.aggregation[agregationIndex].connections_down.push(_map.edge[x].switchId)
            _map.edge[x].connections_up.push(_map.aggregation[agregationIndex].switchId)


        }


    }


    let pods = new Map<number, Switch[]>();

    for(const podObject of _map.aggregation) {

        const podIndex = podObject.pod as number;
        
        const pod = pods.get(podIndex);
        if(!pod) pods.set(podIndex, [podObject])
        else {
            pods.set(podIndex, [...pod, podObject])
        }

    }

    // console.log(pods);
    

    const y = (+map.k / 2);
    for(const pod of pods) {

        const insidePods = pod[1];

        let lastIndex = 0;
        for(const podObject of insidePods) {


            for(let j=0;j<y;j++) {

                podObject.connections_up.push(_map.core[lastIndex].switchId);
                _map.core[lastIndex].connections_down.push(podObject.switchId)
                lastIndex++;

            }


        }


    }




    return _map;


}

let d = Date.now()

const map = csm(8);
const cons = ccm(map);

console.log("TOOK", Date.now() - d);



const switches = [
    ...cons.aggregation,
    ...cons.core,
    ...cons.edge,
    ...cons.physical
]


for(const switchObject of switches) {

    for(const connection of [...switchObject.connections_up]) {
        console.log(switchObject.switchId, connection, 1);
    }

}








