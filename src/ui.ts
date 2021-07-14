import './ui.css'
const _window = window;

onmessage = (event) => {
    if (event.data.pluginMessage === 'hourglass-stop') {
        var to_speak = new SpeechSynthesisUtterance('Stop!');
        to_speak.volume = 1;
        _window.speechSynthesis.speak(to_speak);
    }
}

document.getElementById('reveal').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'reveal-one' } }, '*')
}

document.getElementById('roll').onclick = () => {
    const diceSides = [];
    document.getElementsByName('dice-sides').forEach(c => diceSides.push(c));
    const diceAmount = document.getElementById('dice-amount');
    const diceSide = diceSides.find(c => c.checked);

    const sides = parseInt(diceSide.value);
    const amount = parseInt((diceAmount as any).value);

    parent.postMessage({ pluginMessage: { type: 'roll-dice', sides, amount } }, '*')
}

document.getElementById('hourglass').onclick = () => {
    const hourglassLengths = [];
    document.getElementsByName('hourglass-length').forEach(c => hourglassLengths.push(c));
    const hourglassLength = hourglassLengths.find(c => c.checked);

    const length = parseInt(hourglassLength.value);

    parent.postMessage({ pluginMessage: { type: 'set-hourglass', length } }, '*')
}
