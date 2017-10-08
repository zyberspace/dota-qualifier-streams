/**
 * Basically RFC7396 except that this allows us to update arrays.
 * Array updates would look like this:
 * JSON to update:
 *   {
 *     "streams": [
 *       {...},
 *       {...}
 *     ]
 *   }
 * Patch:
 *   {
 *     "streams": { <-- notice how this is an object in the patch and not an array
 *       "0": { <-- indexes are keys in the patch
 *         "link": "twitch.tv/newchannel"
 *       },
 *       "2": {...} <-- new indexes to add elements
 *     }
 *   }
 */
export default function mergePatch(target, patch) {
    for (const key in patch) {
        const value = patch[key];

        //Null
        if (value === null) {
            delete target[key];
            continue;
        }

        //Object
        if (typeof value === "object" && !Array.isArray(value)) {
            if (typeof target[key] !== "object") {
                target[key] = {};
            }
            mergePatch(target[key], value);
            continue;
        }

        //Scalar or array
        target[key] = value;
    }

    return target;
}
