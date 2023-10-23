"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.SwitchType = void 0;
var SwitchType;
(function (SwitchType) {
    SwitchType["Core"] = "Core";
    SwitchType["Aggregation"] = "Aggregation";
    SwitchType["Edge"] = "Edge";
    SwitchType["Server"] = "Server";
})(SwitchType = exports.SwitchType || (exports.SwitchType = {}));
class Utils {
    static getAllPossiblePaths(startServer, endServer, _switches, k) {
        const switches = JSON.parse(JSON.stringify(_switches));
        let pathList = [];
        let lastIndex = 0;
        while (lastIndex != ((+k / 2))) {
            let visited_1 = [startServer.switchId];
            let visited_2 = [endServer.switchId];
            while (true) {
                const currentServer = switches.find(swtichObject => swtichObject.switchId == visited_1[visited_1.length - 1]);
                // currentServer.connections_up.map(connection => visited_1.push(connection));
                if (currentServer.connections_up.length > 1) {
                    visited_1.push(currentServer.connections_up[lastIndex]);
                }
                else {
                    visited_1.push(currentServer.connections_up[0]);
                }
                const targetServer = switches.find(swtichObject => swtichObject.switchId == visited_2[visited_2.length - 1]);
                // targetServer.connections_up.map(connection => visited_2.push(connection));
                if (targetServer.connections_up.length > 1) {
                    visited_2.push(targetServer.connections_up[lastIndex]);
                }
                else {
                    visited_2.push(targetServer.connections_up[0]);
                }
                const similarity = Utils.getSimilarity(visited_1, visited_2);
                if (similarity.length > 0) {
                    break;
                }
            }
            pathList.push(Utils.mergePath(visited_1, visited_2));
            lastIndex++;
        }
        return pathList;
    }
    static getShortestPath(startServer, endServer, _switches) {
        const switches = JSON.parse(JSON.stringify(_switches));
        let visited_1 = [startServer.switchId];
        let visited_2 = [endServer.switchId];
        while (true) {
            const currentServer = switches.find(swtichObject => swtichObject.switchId == visited_1[visited_1.length - 1]);
            // currentServer.connections_up.map(connection => visited_1.push(connection));
            visited_1.push(currentServer.connections_up.shift());
            const targetServer = switches.find(swtichObject => swtichObject.switchId == visited_2[visited_2.length - 1]);
            // targetServer.connections_up.map(connection => visited_2.push(connection));
            visited_2.push(targetServer.connections_up.shift());
            const similarity = Utils.getSimilarity(visited_1, visited_2);
            if (similarity.length > 0) {
                console.log(similarity);
                break;
            }
        }
        // console.log(visited_1, visited_2, Utils.mergePath(visited_1, visited_2));
        return Utils.mergePath(visited_1, visited_2);
    }
    static getSimilarity(array1, array2) {
        return array1.filter(arrayItem => array2.find(arrayItem2 => arrayItem == arrayItem2));
    }
    static mergePath(array1, array2) {
        return Array.from(new Set([...array1, ...array2.reverse()]));
    }
    static getCoreSwitchCount(k) {
        return (+k / 2) * (+k / 2);
    }
    static getPodCount(k) {
        return k;
    }
    static getPodPhysicalServerCount(k) {
        return (+k / 2) * (+k / 2);
    }
    static getEdgeSwitchCountOfPod(k) {
        return +k / 2;
    }
    static getAggregationSwitchCountOfPod(k) {
        return +k / 2;
    }
    static populatePod(k) {
        const index = +k / 2;
        return {
            aggregation: new Array(index).fill({
                connections_up: [],
                connections_down: [],
                switchId: null,
                type: SwitchType.Aggregation
            }),
            edge: new Array(index).fill({
                connections_up: [],
                connections_down: [],
                switchId: null,
                type: SwitchType.Edge
            })
        };
    }
    static generateNPods(k) {
        let results = [];
        for (let x = 0; x < k; x++) {
            const pods = this.populatePod(k);
            pods.aggregation.map(podObject => { podObject.pod = x; return podObject; });
            pods.edge.map(podObject => { podObject.pod = x; return podObject; });
            results.push(pods);
        }
        return results;
    }
    static organizeSwitches(switches) {
        let switchList = JSON.parse(JSON.stringify(switches));
        // let switchList = [...switches]
        // let switchList = switches.map(x => x)
        for (let index = 0; index < switchList.length; index++) {
            const switchObject = switchList[index];
            switchObject.switchId = index;
        }
        return switchList;
    }
    static generateSwitch(switchCount, type, startAt) {
        let results = [];
        for (let x = 0; x < switchCount; x++) {
            results.push({
                connections_up: [],
                connections_down: [],
                switchId: (startAt) ? +(+startAt + 1) + x : x,
                type
            });
        }
        return results;
    }
}
exports.Utils = Utils;
