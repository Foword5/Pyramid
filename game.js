const { Card } = require("./card.js");
const { Player } = require("./player.js");
const { getRandomInt } = require("./functions.js");

module.exports = {
    /**
     * Class representing the game
     * 
     * level is the pyramid of card itself
     * hands is the json object representing the hands of the different players
     */
    Game : class Game {
        /** The constructor of the game
         * 
         * @param {*} nbrPlayers the number of players
         * @param {*} height the height of the pyramid
         */
        constructor(nbrPlayers,height){
            this.nbrPlayers = parseInt(nbrPlayers);
            this.height = parseInt(height);

            this.level = {}; // We create a json object where every line is represented by a list of card
            this.hands = {}; // We create a json object where every player is represented by an id and a hand of card

            let minimumCards = (this.height*(this.height-1))/2; // the minimum of cards is the pyramide plus 1 quarter of it times the number of players
            minimumCards += minimumCards/4*this.nbrPlayers; 
            this.pick = Array.from(Array((~~(minimumCards/52)+1)*52).keys());
            for(let i=0;i<this.pick.length;i++){ // We exchange the value for the card object
                let cardNumber = this.pick[i]; 
                this.pick[i] = new Card(~~(cardNumber/52),~~((cardNumber%52)/13),cardNumber%13);
            }

            this.originalPick = this.pick;
        }
        /**
         * Create the pyramid using the data given by the constructor
         */
        createLevel() {
            for(let i=0;i<this.height;i++){
                let currentLevel = [];
                for(let j=0;j<=i;j++){
                    currentLevel.push(this.pickCard());
                }
                this.level[i] = currentLevel;
            }
            this.originalPick = this.pick;
        }

        /** 
         * Create the hands of the players
         */
        createHands(){
            for(let i=0;i<this.nbrPlayers;i++){
                let currentHand = [];
                for(let j=0;j<4;j++){
                    currentHand.push(this.pickCard());
                }
                this.hands[i] = currentHand;
            }
        }

        /** To link the hands and the ids of the players
         * 
         * @param {*} players the list of players
         */
        linkHands(players){
            for(let i=0;i<this.nbrPlayers;i++){
                this.hands[players[i].id] = this.hands[i];
                delete this.hands[i];
            }
        }

        /** Pick a card and remove it from the pick
         * 
         * @returns the card
         */
        pickCard(){
            let cardPos = getRandomInt(this.pick.length);
            let card = this.pick[cardPos];
            this.pick.splice(cardPos,1);
            if(this.pick.length <= 0) this.pick = this.originalPick;
            return card
        }

        /** 
         * Draw the pyramid in the console
         */
         drawLevel() {
            for(let i=0;i<this.height;i++){
                let line = this.level[i];
                let lineString = "";
                line.forEach(card => {
                    lineString += card.toString()+" | ";
                })
                console.log(lineString);
            };
        }
    }
};