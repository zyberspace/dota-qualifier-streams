import rivets from "rivets";

rivets.formatters.twitchUrl = (value, forLink = false) => {
    const partsToTrim = ["http://", "https://", "www.", "go."];
    let goLink = false;

    for (const partToTrim of partsToTrim) {
        if (value.startsWith(partToTrim)) {
            if (partToTrim === "go.") {
                goLink = true;
            }
            value = value.substr(partToTrim.length);
        }
    }

    if (forLink) {
        value = "https://" + (goLink === true ? "go" : "www") + "." + value;
    }

    return value;
}
rivets.formatters.isEmpty = value => !value || value.length === 0;
rivets.formatters.equals = (value1, value2) => value1 === value2;
rivets.formatters.formatText = value => {
    if (value === "") {
        return "&nbsp;";
    }

    //Escape html
    value = value.replace(/[<>]/g, match => {
        return {
          '<': '&lt;',
          '>': '&gt;'
        }[match];
    });

    //Source: https://gist.github.com/jbroadway/2836900#file-slimdown-php-L23-L39
    const rules = [
        [/\[([^\[]+)\]\(([^\)]+)\)/g, "<a href=\"$2\">$1</a>"], // links
        [/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>"],           // bold
        [/(\*|_)(.+?)\1/g, "<em>$2</em>"],                      // emphasis
        [/\~\~(.+?)\~\~/g , "<del>$1</del>"]                    // del
    ];
    for (let rule of rules) {
        value = value.replace(rule[0], rule[1]);
    }

    return value;
}
