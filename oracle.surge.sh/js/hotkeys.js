import { menuHotkey as obsMenuHotkey } from "./obs";

const keysPressed = [];
const hotkeys = [
    obsMenuHotkey
];

document.addEventListener("keydown", event => {
    const keyPressed = event.key;
    for (const hotkey of hotkeys) {
        if (hotkey.requiredKeys.includes(keyPressed)) {
            event.preventDefault();
            if (event.repeat) {
                return;
            }

            keysPressed.push(keyPressed);

            const allKeysPressed = hotkey.requiredKeys.every(requiredKey => keysPressed.includes(requiredKey));
            if (allKeysPressed) {
                hotkey.call.apply(hotkey);
            }
        }
    }
});

document.addEventListener("keyup", event => {
    const index = keysPressed.indexOf(event.key);
    if (index >= 0) {
        keysPressed.splice(index, 1);
    }
});

//Disable hotkeys on inputs
const inputs = document.getElementsByTagName("input");
for (const input of inputs) {
    input.addEventListener("keydown", event => {
        event.stopPropagation();
    });
}
