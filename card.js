module.exports = {
    /**
     * the card class represent a card in the game, it's deck, color and value
     */
    Card : class Card{
        /** Constructor of the card
         * 
         * @param {*} deck 
         * @param {*} value 
         * @param {*} color 
         */
        constructor(deck,color,value){
            this.deck = deck;
            this.value = value;
            this.color = color;
        }

        /** Get the value of the card, as a string for the 11,12 and 13
         * 
         * @returns the value of the card
         */
        getValue(){
            if(this.value > 0 && this.value <= 10) return this.value
            else
                switch(this.value){
                    case 0 : return "Ace"; break;
                    case 10 : return "Jack"; break;
                    case 11 : return "Queen"; break;
                    case 12 : return "King"; break;
                    default : return null;
                }
        }

        /** Return the color as a String
         * 
         * @returns the color
         */
        getColor(){
            switch(this.color){
                case 0 : return "diamond"; break;
                case 1 : return "heart"; break;
                case 2 : return "club"; break;
                case 3 : return "spade"; break;
                default : return null; break;
            }
        }

        /** Get the card as a String
         * 
         * @returns the card as a String
         */
        toString(){
            return this.getValue()+" of "+this.getColor();
        }
    }
};