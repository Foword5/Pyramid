module.exports = {
    /** Returns a random integer between 0 and the max
     * 
     * @param {*} max the max value
     * @returns the random number
     */
    getRandomInt : function getRandomInt(max) {
        if(max <= 0) return null;
        return Math.floor(Math.random() * max);
    },

    /** Sleep for a given tile
     * 
     * @param {*} delay  the time to sleep, in millisecond
     */
    sleep : function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }
};