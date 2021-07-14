const toUint8Array = require('base64-to-uint8array');
const hourglass = require('./hourglass.jpg');
const d4 = require('./d4.jpg');
const d6 = require('./d6.jpg');
const d8 = require('./d8.jpg');
const d10 = require('./d10.jpg');
const d12 = require('./d12.jpg');
const d20 = require('./d20.jpg');

const IMAGE_REF = {
    hourglass,
    d4,
    d6,
    d8,
    d10,
    d12,
    d20,
};

const BASE64_MARKER = ';base64,';
let pluginElements = [];

figma.showUI(__html__, {width: 640, height: 400});

function removePreviousElements() {
    pluginElements.forEach(el => {
        el.remove();
    });

    pluginElements = [];
}

function validateSurface() {
    const page = figma.currentPage;
    if (
        !page.selection || page.selection.length === 0
    ) {
        alert('Select a surface!');
        throw false;
    }
}

function loadFont() {
    return figma.loadFontAsync({ family: "Roboto", style: "Regular" });
}

figma.ui.onmessage = async msg => {
    const page = figma.currentPage;
    const surface = page.selection[0];
    const { selection } = page;

    removePreviousElements();
    validateSurface();
    await loadFont();

    if (msg.type === 'roll-dice') {
        rollDices(msg.sides, msg.amount, { surface, page });
    } else if (msg.type === 'set-hourglass') {
        setHourglass(msg.length, { surface, page });
    } else if (msg.type === 'reveal-one') {
        revealOne({ page, selection });
    }
};

function getBase64FromDataUri(dataURI) {
    const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    return dataURI.substring(base64Index);
}

function createImage(imageName) {
    const imageRef = IMAGE_REF[imageName];

    if(!imageRef) {
        throw new Error('No image match this name');
    }

    const data = toUint8Array(getBase64FromDataUri(imageRef));
    let imageHash = figma.createImage(data).hash;
    const rect = figma.createRectangle();
    rect.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash }]
    return rect;
}

function selectAndZoomIn(page, nodes) {
    if(nodes.length === 1) nodes = [nodes];
    // figma.currentPage.selection = nodes;
    // figma.viewport.scrollAndZoomIntoView(nodes);

    page.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
}

function revealOne({ page, selection }) {
    const selected = selection[0];

    const elements = (
        selection.length === 1 && selected.type === 'GROUP'
    ) ? selected.children : selection;

    const chosenIndex = randomize(0, elements.length);
    const chosen = elements[chosenIndex];

    const { width, height, x, y } = chosen;
    const outline = figma.createRectangle();

    outline.fills = [{ type: 'SOLID', opacity: 0.01, color: { r: 0, g: 0, b: 0 } }];
    outline.strokeAlign = 'OUTSIDE';
    outline.strokeWeight = Math.ceil(width / 10);
    outline.strokes = [
        { type: 'SOLID', color: { r: 1, g: 1, b: 0 } }
    ];

    outline.resize(width + 20, height + 20)
    outline.x = x - 10;
    outline.y = y - 10;

    pluginElements.push(outline);
    page.appendChild(outline);

    figma.currentPage.selection = [outline];
    figma.viewport.scrollAndZoomIntoView([outline]);
}

async function setHourglass(length, { surface, page }) {
    const image = createImage('hourglass');
    
    const timeText = figma.createText();
    timeText.fontSize = 50;
    timeText.characters = length.toString();

    const hourglass = figma.group([image, timeText], page);
    hourglass.x = surface.x;
    hourglass.y = surface.y;

    pluginElements.push(hourglass);
    page.appendChild(hourglass);

    figma.currentPage.selection = [hourglass];
    figma.viewport.scrollAndZoomIntoView([hourglass]);

    figma.ui.hide();

    let interval = setInterval(() => {
        let c = parseInt(timeText.characters);
        c--;
        timeText.characters = c.toString();

        if (c === 0) {
            clearInterval(interval);
            interval = null;
            figma.ui.postMessage('hourglass-stop');
            figma.closePlugin();
        }
    }, 1000);
}

async function rollDices(sides, amount, { surface, page }) {
    const nodes = [];

    for (let i = 0; i < amount; i++) {
        const image = createImage(`d${sides}`);

        const text = figma.createText();
        text.fontSize = 64;
        text.characters = randomize(1, sides).toString();

        const dice = figma.group([image, text], page);
        dice.x = surface.x + (i * (dice.width + 50));
        dice.y = surface.y;

        page.appendChild(dice);

        pluginElements.push(dice);
        nodes.push(dice);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    figma.closePlugin();
}

function randomize(min, max) {
    return Math.floor(Math.random() * max) + min;
}