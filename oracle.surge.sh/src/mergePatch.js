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
 *
 * Deleting array values works by setting them to `null` in the patch (just as RFC7396 does for objects).
 * We then `delete` the values in the target array which sets them to `undefined`.
 * As last step all array values which are `undefined` get simply filtered out so they are finally removed.
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

            //If target[key] is an array, filter undefined (aka removed with ´delete`) values
            if (Array.isArray(target[key])) {
                target[key] = target[key].filter(value => value !== undefined);
            }

            continue;
        }

        //Scalar or array
        target[key] = value;
    }

    return target;
}
