"use strict";
console.log("LOADED?");
setTimeout(() => {
    var _a;
    console.log("Bruh");
    const coreElement = document.getElementById("core-container");
    const cores = coreElement.querySelectorAll("div");
    const pod = (_a = document.getElementById("pod")) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
    for (const coreObject of cores) {
        const domRect = coreObject.getBoundingClientRect();
        const elem = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><line x1="${domRect.x}px" y1="${domRect.y}px" x2="${pod.x}px" y2="${pod.y}px" stroke="black"/></svg>`;
        document.getElementById("cont").innerHTML += elem;
        console.log(elem);
    }
}, 5000);
