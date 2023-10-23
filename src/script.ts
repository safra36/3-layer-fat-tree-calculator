

console.log("LOADED?");



setTimeout(() => {

    console.log("Bruh");
    

    const coreElement = document.getElementById("core-container") as HTMLElement;
    const cores = coreElement.querySelectorAll("div");

    const pod = document.getElementById("pod")?.getBoundingClientRect() as DOMRect;

    for(const coreObject of cores) {

        const domRect = coreObject.getBoundingClientRect() as DOMRect;
        const elem = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><line x1="${domRect.x}px" y1="${domRect.y}px" x2="${pod.x}px" y2="${pod.y}px" stroke="black"/></svg>`;
        (document.getElementById("cont") as HTMLElement).innerHTML += elem
        console.log(elem);
        

    }
    
}, 5000);