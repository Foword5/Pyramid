module.exports = {
    /**
     * the class to represent every player
     */
    Player : class Player {
        /** the constructor of the player
         * 
         * @param {*} id the id of the player
         */
        constructor(id){
            this.id = id; // we keep the id in case of deconnection
            this.next = false;
        }
    }
};