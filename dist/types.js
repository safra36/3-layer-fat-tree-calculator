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
