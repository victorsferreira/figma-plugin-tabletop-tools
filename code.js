var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
let pluginElements = [];
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    const page = figma.currentPage;
    const surface = page.selection[0];
    const { selection } = page;
    pluginElements.forEach(el => {
        el.remove();
    });
    pluginElements = [];
    if (!page.selection || page.selection.length === 0) {
        alert('Select a surface!');
        return false;
    }
    yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    if (msg.type === 'roll-dice') {
        rollDices(msg.sides, msg.amount, { surface, page });
    }
    else if (msg.type === 'set-hourglass') {
        setHourglass(msg.length, { surface, page });
    }
    else if (msg.type === 'reveal-one') {
        revealOne({ surface, page, selection });
    }
});
function revealOne({ surface, page, selection }) {
    const selected = selection[0];
    const elements = (selection.length === 1 && selected.type === 'GROUP') ? selected.children : selection;
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
    outline.resize(width + 20, height + 20);
    outline.x = x - 10;
    outline.y = y - 10;
    pluginElements.push(outline);
    page.appendChild(outline);
}
function setHourglass(length, { surface, page }) {
    return __awaiter(this, void 0, void 0, function* () {
        const shape = figma.createRectangle();
        shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
        const timeText = figma.createText();
        timeText.fontSize = 50;
        timeText.characters = length.toString();
        const hourglass = figma.group([shape, timeText], page);
        hourglass.x = surface.x;
        hourglass.y = surface.y;
        pluginElements.push(hourglass);
        page.appendChild(hourglass);
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
    });
}
function rollDices(sides, amount, { surface, page }) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        for (let i = 0; i < amount; i++) {
            const shape = figma.createRectangle();
            shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
            const text = figma.createText();
            text.fontSize = 64;
            text.characters = randomize(1, sides).toString();
            const dice = figma.group([shape, text], page);
            dice.x = surface.x + (i * (dice.width + 50));
            dice.y = surface.y;
            page.appendChild(dice);
            pluginElements.push(dice);
            nodes.push(dice);
        }
        page.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
        figma.closePlugin();
    });
}
function randomize(min, max) {
    return Math.floor(Math.random() * max) + min;
}
