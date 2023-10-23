


export enum SwitchType {

    Core = "Core",
    Aggregation = "Aggregation",
    Edge = "Edge",
    Server = "Server"
}


export interface Pod {

    aggregation : Switch[],
    edge : Switch[]

}

export interface Link {

    startAt : number,
    entAt : number

}


export interface SwitchPath {

    startId : number,
    endId : number
    paths : number[][]

}


export interface Switch {

    switchId : number,
    connections_down : number[],
    connections_up : number[],
    type : SwitchType,
    pod ?: number
}



export interface SwitchMap {
    k : kInput,
    edge : Switch[],
    aggregation : Switch[],
    core : Switch[],
    physical : Switch[],
}




export interface PhysicalServer {

    connection : number

}


export type kInput = 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512




export class Utils {


    static getAllPossiblePaths(
        startServer : Switch,
        endServer : Switch,
        _switches : Switch[],
        k : kInput
    ) {

        const switches = JSON.parse(JSON.stringify(_switches)) as Switch[]

        let pathList = []
        let lastIndex = 0;

        while(lastIndex != ((+k/2))) {
            

            let visited_1 = [startServer.switchId];
            let visited_2 = [endServer.switchId];
            
            while(true) {
                
                const currentServer = switches.find(swtichObject => swtichObject.switchId == visited_1[visited_1.length-1]) as Switch;
                // currentServer.connections_up.map(connection => visited_1.push(connection));

                if(currentServer.connections_up.length > 1) {
                    visited_1.push(currentServer.connections_up[lastIndex] as number)
                } else {
                    visited_1.push(currentServer.connections_up[0] as number)
                }

                
            
                const targetServer = switches.find(swtichObject => swtichObject.switchId == visited_2[visited_2.length-1]) as Switch;
                // targetServer.connections_up.map(connection => visited_2.push(connection));
                if(targetServer.connections_up.length > 1) {
                    visited_2.push(targetServer.connections_up[lastIndex] as number)
                } else {
                    visited_2.push(targetServer.connections_up[0] as number)
                }
            
                const similarity = Utils.getSimilarity(visited_1, visited_2);
                if(similarity.length > 0) {
                    break;
                }
            
            
            }

            pathList.push(Utils.mergePath(visited_1, visited_2))

            lastIndex++;

        }

        return pathList;

    }


    static getShortestPath(
        startServer : Switch,
        endServer : Switch,
        _switches : Switch[]
    ) {

        const switches = JSON.parse(JSON.stringify(_switches)) as Switch[]

        let visited_1 = [startServer.switchId];
        let visited_2 = [endServer.switchId];

        while(true) {
            
            const currentServer = switches.find(swtichObject => swtichObject.switchId == visited_1[visited_1.length-1]) as Switch;
            // currentServer.connections_up.map(connection => visited_1.push(connection));
            visited_1.push(currentServer.connections_up.shift() as number)

            const targetServer = switches.find(swtichObject => swtichObject.switchId == visited_2[visited_2.length-1]) as Switch;
            // targetServer.connections_up.map(connection => visited_2.push(connection));
            visited_2.push(targetServer.connections_up.shift() as number)

            const similarity = Utils.getSimilarity(visited_1, visited_2);
            if(similarity.length > 0) {
                console.log(similarity);
                
                break;
            }


        }

        // console.log(visited_1, visited_2, Utils.mergePath(visited_1, visited_2));
        return Utils.mergePath(visited_1, visited_2);

    }


    static getSimilarity(
        array1 : any[],
        array2 : any[]
    ) {

        return array1.filter(arrayItem => array2.find(arrayItem2 => arrayItem == arrayItem2));

    }

    static mergePath(
        array1 : number[],
        array2 : number[]
    ) {

        return Array.from(new Set([...array1, ...array2.reverse()]))

    }


    static getCoreSwitchCount(k : kInput) : number {
        return (+k / 2) * (+k / 2);
    }


    static getPodCount(k : kInput) : number {
        return k;
    }

    static getPodPhysicalServerCount(k : kInput) : number {
        return (+k / 2) * (+k / 2);
    }


    static getEdgeSwitchCountOfPod(k : kInput) {
        return +k / 2;
    }


    static getAggregationSwitchCountOfPod(k : kInput) {
        return +k / 2;
    }


    static populatePod(k : kInput) : Pod {

        const index = +k/2;
        
        return {
            aggregation : new Array(index).fill({
                connections_up : [],
                connections_down : [],
                switchId : null,
                type : SwitchType.Aggregation
            }) as Switch[],
            edge : new Array(index).fill({
                connections_up : [],
                connections_down : [],
                switchId : null,
                type : SwitchType.Edge
            }) as Switch[]
        }

    }


    static generateNPods(k : kInput) : Pod[] {

        let results : Pod[] = []
        for(let x = 0;x<k;x++) {
            const pods = this.populatePod(k);
            pods.aggregation.map(podObject => { podObject.pod = x; return podObject; })
            pods.edge.map(podObject => { podObject.pod = x; return podObject; })
            results.push(pods)
        }
        return results;

    }

    static organizeSwitches(switches : Switch[]) : Switch[] {

        let switchList = JSON.parse(JSON.stringify(switches))
        // let switchList = [...switches]
        // let switchList = switches.map(x => x)
        for(let index = 0 ;index < switchList.length;index++) {
            const switchObject = switchList[index];
            switchObject.switchId = index
        }

        return switchList;

    }


    static generateSwitch(switchCount : number, type : SwitchType, startAt ?: number) : Switch[] {

        let results : Switch[] = []
        for(let x = 0;x<switchCount;x++) {

            results.push({
                connections_up : [],
                connections_down : [],
                switchId : (startAt) ? +(+startAt + 1) + x : x,
                type
            })

        }

        return results;

    }

}














