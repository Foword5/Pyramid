/** Write the card as a string and not 2 numbers
 * 
 * @param {*} value the value
 * @param {*} color the color
 * @returns the string
 */
function cardToString(value, color){
    let string = "";
    switch(value){
        case 0 : string += "Ace"; break;
        case 10 : string += "Jack"; break;
        case 11 : string += "Queen"; break;
        case 12 : string += "King"; break;
        default : string += value;
    }
    string += " of ";
    switch(color){
        case 0 : string += "diamond"; break;
        case 1 : string += "heart"; break;
        case 2 : string += "club"; break;
        case 3 : string += "spade"; break;
        default : console.error("unknown color"); break;
    }
    return string;
}