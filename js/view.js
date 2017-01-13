import rivets from "rivets";
import "./rivets/formatters"; //Set some formatters for rivets

export const view = rivets.bind(document.getElementsByTagName("body")[0]);
export default view;
