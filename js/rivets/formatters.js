import rivets from "rivets";

rivets.formatters.https = value => "https://" + value;
rivets.formatters.equals = (value1, value2) => value1 === value2;
