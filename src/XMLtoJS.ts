type GenericObject = {
    [key: string]: any
}

export function XMLtoJS(xml: string, arrayTags?: string[]) {
    const dom = new DOMParser().parseFromString(xml, 'text/xml')
    
    const obj : GenericObject = {}
    dom.childNodes.forEach(v => parseNode(v, obj))

    // From https://stackoverflow.com/questions/4200913/xml-to-javascript-object
    function parseNode(xmlNode : Node, result: GenericObject) {
        if (xmlNode.nodeName == "#text") {
            let v = xmlNode.nodeValue;
            if (v?.trim()) result['#text'] = v;
            return;
        }
    
        let jsonNode : GenericObject = {},
            existing = result[xmlNode.nodeName];
        if (existing) {
            if (!Array.isArray(existing)) result[xmlNode.nodeName] = [existing, jsonNode];
            else result[xmlNode.nodeName].push(jsonNode);
        }
        else {
            if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) result[xmlNode.nodeName] = [jsonNode];
            else result[xmlNode.nodeName] = jsonNode;
        }
    
        if (xmlNode instanceof Element && xmlNode.attributes) for (let attribute of xmlNode.attributes) jsonNode[attribute.nodeName] = attribute.nodeValue;
    
        for (let node of xmlNode.childNodes) parseNode(node, jsonNode);
    }

    return obj
}


