


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














