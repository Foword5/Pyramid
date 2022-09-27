const Game = require("./game.js").Game;
const Player = require("./player.js").Player;
const getRandomInt = require("./functions").getRandomInt;

const WebSocket = require("ws");
const express = require("express");

const PORT = process.env.PORT || 3000; //The port will automaticly be 3000 on localhost, but if you use a host, like heroku, it might change

const INDEX = '/index.html';//the index of the website, for the client
const FILES = //Any files refered to in the client
    [
        '/clientFunctions.js',
        '/game.js',
        '/client.js',
        '/card.js',
        '/stop.html'
    ];

//We use a String so the server is set in only one command, cause for some reason it doesn't work if it's done on multiple lines ¯\_(ツ)_/¯
var serverSTR = 'express()';

//All external files must be refered in the use of the server before being used in any other files
//We first set all Files and then, any other link will refer to the INDEX variables, the order is important
FILES.forEach((file)=>{
    console.log(`File ${file} loaded`);
    serverSTR +=
    `.use('${file}',function(req, res){
        res.sendFile('${file}', { root: __dirname });
    })`;
})
serverSTR +=
`.use(function(req, res){
    res.sendFile('${INDEX}', { root: __dirname });
})
.listen(${PORT}, () => console.log(\`Listening on ${PORT}\`));`

const server = eval(serverSTR);
const wss = new WebSocket.Server({ server });

//This is where the fun begins

let STATE = "noGame";
let GAME;
let HEIGHT;
let PLAYERS = [];
let nextCard = {line:null,card:null};

wss.on('connection', function connection(ws) {

    ws.send(JSON.stringify({
        type:"startup",
        state:STATE,
        height:HEIGHT
    }));
    console.log("New Client")

    ws.on('message', function message(data) {
        try{
            analyse = JSON.parse(data);
        }catch(e){
            console.log("unrecognized data : \n"+data.data);
            return;
        }
        switch(analyse.type){
            case "createGame":
                HEIGHT = analyse.height;
                STATE = "waiting";
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"startWaiting",
                        height:HEIGHT
                    }))
                });
                console.log("Creating a Game, height : "+HEIGHT);
                break;
            case "cancelGame":
                GAME = null;
                STATE = "noGame";
                PLAYERS = [];
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"gameCanceled"
                    }))
                });
                console.log("Cancelling a Game");
                break;
            case "addPlayer":
                let id;
                do{
                    id= getRandomInt(99999);
                }while(PLAYERS.find(element => element.id == id))
                PLAYERS.push(new Player(id));

                console.log("player "+id+" added")
                console.log(PLAYERS)
                ws.send(JSON.stringify({
                    type:"playerAdded",
                    height:HEIGHT,
                    id:id
                }));
                break;
            case "removePlayer":
                for(let i=0;i<PLAYERS.length;i++){
                    if(PLAYERS[i].id == analyse.id)
                        PLAYERS.splice(i,1);
                }

                console.log("player "+analyse.id+" removed")
                console.log(PLAYERS)
                ws.send(JSON.stringify({
                    type:"playerRemoved",
                    height:HEIGHT
                }));
                break;
            case "startGame":
                STATE="inGame";
                GAME = new Game(PLAYERS.length,HEIGHT);
                GAME.createLevel();
                GAME.createHands();
                GAME.linkHands(PLAYERS);

                nextCard = {
                    line: HEIGHT-1,
                    card: HEIGHT-1
                }

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"gameStarted",
                        hands : GAME.hands
                    }))
                });
                break;
            case "playerReady":
                PLAYERS.find(element => element.id == analyse.id).next = true;
                for(i in PLAYERS){
                    if(!PLAYERS[i].next)
                        return
                }
                for(i in PLAYERS){
                    PLAYERS[i].next = false;
                }
                
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"gameNext",
                        card:GAME.level[nextCard.line][nextCard.card],
                        cardPos: nextCard
                    }))
                });
                
                nextCard.card -=1;
                if(nextCard.card <0){
                    nextCard.line = nextCard.line-1;
                    nextCard.card = nextCard.line
                }
                break;
            case "seeCard" :
                let oldCard = GAME.hands[analyse.id][analyse.card];
                let newCard = GAME.pickCard();
                ws.send(JSON.stringify({
                    type: "seeCard",
                    oldCard: oldCard,
                    newCard: newCard,
                    cardPos: analyse.card
                }))
                GAME.hands[analyse.id][analyse.card] = newCard;
                break;
            case "seeNext" :
                PLAYERS.find(element => element.id == analyse.id).next = true;
                for(i in PLAYERS){
                    if(!PLAYERS[i].next)
                        return
                }

                if(nextCard.line<0){ // if there is no more cards, it's the end
                    wss.clients.forEach((client) => {
                        client.send(JSON.stringify({
                            type:"end"
                        }))
                    });
                    
                    STATE = "noGame";
                    GAME = undefined;
                    HEIGHT = undefined;
                    PLAYERS = [];
                    nextCard = {line:null,card:null};

                    return;
                }

                for(i in PLAYERS){
                    PLAYERS[i].next = false;
                }
                
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"nextCard",
                        card:GAME.level[nextCard.line][nextCard.card],
                        cardPos: nextCard
                    }))
                });
                
                nextCard.card -=1;
                if(nextCard.card <0){
                    nextCard.line = nextCard.line-1;
                    nextCard.card = nextCard.line
                }
                break;
            case "ITS-TIME-TO-STOP":
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        type:"end"
                    }))
                });
                
                STATE = "noGame";
                GAME = undefined;
                HEIGHT = undefined;
                PLAYERS = [];
                nextCard = {line:null,card:null};

                break;
            default: 
                break;
        }
    });
    ws.on('close', function close() {

    });
});
