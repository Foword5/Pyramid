window.onload = init;

function init(){
    body = document.getElementsByTagName('main')[0];
}

let STATE="connecting";
let ID = null;
let HEIGHT = null;

let message = {};
let body;

//connect to the server
var HOST = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(HOST);

ws.onmessage = (data) => {
    try{
        data = JSON.parse(data.data);
    }catch(e){
        console.error("unrecognized data : \n"+data.data);
        return;
    }
    switch(data.type){
        case "startup":
            STATE = data.state;
            switch(STATE){
                case "noGame" : //no game as been setted up
                    noGameInit();
                    break;
                case "waiting" : //a game as been setted up but waiting for players
                    HEIGHT = data.height;
                    waitingInit(false);
                    break;
                case "inGame" : //a game is launched
                    cantJoinInit();
                    break;
            }
            break;
        case "startWaiting":
            STATE = "waiting";
            HEIGHT = data.height;
            waitingInit(false);
            break;
        case "gameCanceled":
            STATE = "noGame";
            console.log("game canceled");
            noGameInit();
            break;
        case "playerAdded":
            ID = data.id;
            waitingInit(true);
            break;
        case "playerRemoved":
            ID = null;
            waitingInit(false);
            break;
        case "gameStarted":
            if(ID){
                STATE = "inGame";
                inPreGameInit(data.hands[ID]);
            }else
                cantJoinInit();
            break;
        case "gameNext":
            inGameInit(data.card);
            break;
        case "seeCard":
            alert("The card was : \n"+cardToString(data.oldCard.value,data.oldCard.color));
            alert("/!\\ careful ! \n we're now going to show you your new card");
            alert("your new card "+data.cardPos+" is : \n"+cardToString(data.newCard.value,data.newCard.color));
            break;
        case "nextCard":
            document.getElementById("line"+data.cardPos.line+"col"+data.cardPos.card).innerHTML = 
            cardToString(data.card.value,data.card.color)+" | ";
            document.getElementById("seeNextCard").innerHTML = 
            "<button id='nextCard'>Next Card</button>";
            document.getElementById("nextCard").addEventListener("click", ()=> {
                document.getElementById("seeNextCard").innerHTML = "Waiting for the other players...";
                ws.send(JSON.stringify({
                    type:"seeNext",
                    id:ID
                }))
            });
            break;
        case "end" :
            alert("This is the end of the game, thanks for playing !");
            STATE = "noGame";
            noGameInit();
            break;
        default: break;
    }
}

console.log("connecting...");

function noGameInit(){
    body.innerHTML=`
        <label for='height'>Height of the pyramid : </label>
        <input type='number' id='height' value="4"></input><br />
        <button id='submit'>Create Room</button>
    `;
    document.getElementById("submit").addEventListener("click", ()=> {
        let height = document.getElementById("height").value;
        if(height > 0){
            message = {
                type:"createGame",
                height:height
            }
            ws.send(JSON.stringify(message));
        }
    });
}

function waitingInit(joined){
    body.innerHTML = `
        <h2>Pyramid of height ${HEIGHT}</h2>
    `;

    if(joined)
        body.innerHTML += `
            Joined as ${ID}<br />
            <button id="leave">leave the game</button>
            <button id="start">start the game</button>
        `;
    else
        body.innerHTML += `
            <button id="join">join the game</button>
        `;
    
    
    body.innerHTML += `
        <br /><button id="cancel">Cancel</button>
    `;
    document.getElementById("cancel").addEventListener("click", ()=> {
        ws.send(JSON.stringify({
            type:"cancelGame"
        }))
    });

    if(joined){
        document.getElementById("leave").addEventListener("click", ()=> {
            ws.send(JSON.stringify({
                type:"removePlayer",
                id:ID
            }))
        });
        document.getElementById("start").addEventListener("click", ()=> {
            ws.send(JSON.stringify({
                type:"startGame"
            }))
        });
    }else
    document.getElementById("join").addEventListener("click", ()=> {
        console.log("joinning the game");
        ws.send(JSON.stringify({
            type:"addPlayer"
        }))
    });
}

function inPreGameInit(hand){
    body.innerHTML = "";

    for(let i=0;i<4;i++){
        body.innerHTML += cardToString(hand[i].value,hand[i].color) + " | ";
    }

    body.innerHTML += "<br /><button id='next'>Next</button>";

    document.getElementById("next").addEventListener("click", ()=> {
        ws.send(JSON.stringify({
            type:"playerReady",
            id:ID
        }))
        readyGameInit();
    });
}

function readyGameInit(){
    body.innerHTML = "<h2>waiting for other players</h2>";
}

function inGameInit(firstCard){
    body.innerHTML = "";
    for(let i=0;i<HEIGHT;i++){
        for(let j=0;j<=i;j++){
            if(i==HEIGHT-1 && j==i) body.innerHTML += cardToString(firstCard.value,firstCard.color);
            else body.innerHTML += "<span id='line"+i+"col"+j+"'> O </span>";
        }
        body.innerHTML += "<br />";
    } 

    body.innerHTML += "<br />";

    for(let i=0;i<4;i++){
        body.innerHTML += "<button id='see"+i+"'>Voir carte "+(parseInt(i)+1)+"</button>";
    }

    body.innerHTML += "<div id='seeNextCard'><button id='nextCard'>Next Card</button></div>";
    document.getElementById("nextCard").addEventListener("click", ()=> {
        document.getElementById("seeNextCard").innerHTML = "Waiting for the other players...";
        ws.send(JSON.stringify({
            type:"seeNext",
            id:ID
        }))
    });

    for(let i=0;i<4;i++){
        document.getElementById("see"+i).addEventListener("click", ()=> {
            ws.send(JSON.stringify({
                type:"seeCard",
                id:ID,
                card:i
            }))
        });
    }
}

function cantJoinInit(){
    body.innerHTML = `
    <h1>A game is already being played, reload the page later</h1>
    <h2>If this is a mistake go to <a href='/stop.html'>Emergency stop</a><h2>
    `;
    ws = null;
}