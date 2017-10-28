/**
 * RFC7396 but we also generate patches for arrays.
 * See `mergePatch.js` in `oracle.surge.sh` for more information.
 */
module.exports = function generatePatch(oldData, newData) {
    const patch = {};

    const joinedKeys = new Set(Object.keys(oldData).concat(Object.keys(newData)));

    for (const key of joinedKeys) {
        const oldValue = oldData[key] || null;
        const newValue = newData[key] || null;

        //When existing object or array
        if (oldValue !== null && newValue !== null && typeof newValue === "object") {
            const subPatch = generatePatch(oldValue, newValue);
            if (Object.keys(subPatch).length !== 0) {
                patch[key] = subPatch;
            }
            continue;
        }

        //When scalar value or null
        if (oldValue !== newValue) {
            patch[key] = newValue;
        }
    }

    return patch;
};
