import "./Game.css"
import { useState} from "react";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import { useEffect} from "react";

var infoPlayer = ["","",""];
var player = null
var oponent = ["","",""]
var turn = null
var sala = null
var stompClient = null
var tempBoard =["","","","","","","","",""]
const patterns =[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

export let Game = function(){
    var [pl, setPlayer] = useState(infoPlayer[0])
    var [plw, setPlayerw] = useState(infoPlayer[1])
    var [pll, setPlayerl] = useState(infoPlayer[2])
    var [op, setOPlayer] = useState(oponent[0])
    var [opw, setPlayerwo] = useState(oponent[1])
    var [opl, setPlayerlo] = useState(oponent[2])
    var [board, setBoard] = useState(tempBoard)
    const[result,setResult] = useState({winner:"none",state:"none"})

    useEffect(() => {
        getData();
        socketWeb();
        getInfoPlayer();
     }, []);

    useEffect(()=>{
        checkWin();
    },[board])

    useEffect(()=>{
        if(result.state !="none"){
            alert('Game Finished ' + result.winner);
            //llamar una funcion que vea si el winner conside con el player, si si hacer fetch a winner, sino hacer fetch a losser
        }
       
    },[result])


    async function getInfoPlayer(){
        let correo = sessionStorage.getItem("Correo");
        let url2 ='https://peaceful-earth-72357.herokuapp.com/tictac/getUser/'+correo
        let players = await fetch(url2,{
            method: 'GET'
            }).then(response => response.json());
        infoPlayer = [players.name,players.pGanadas,players.pPerdidas];

        stompClient.subscribe('/events/ws/'+sala+player, function(x){
            oponent =  x.body.split(',')
            setPlayer(infoPlayer[0])
            setPlayerw(infoPlayer[1])
            setPlayerl(infoPlayer[2])
            setOPlayer(oponent[0])
            setPlayerwo(oponent[1])
            setPlayerlo(oponent[2])

            if(parseInt(player) == 1){
                stompClient.send('/events/ws/'+sala+2,{},infoPlayer)
            }
        
        })
        if(parseInt(player) == 2){
            stompClient.send('/events/ws/'+sala+1,{},infoPlayer)
        }

        
    }




    async function getData(){
        sala = sessionStorage.getItem("Sala")
        //console.log(sala);
        let url = 'https://peaceful-earth-72357.herokuapp.com/tictac/players/'+sala
        let players = await fetch(url,{
            method: 'GET'
            }).then(response => response.json());
        player = players;
        if(players === 1){
           turn  = true;
        }
        else{
            turn  = false;
        }
    };

    async function socketWeb(){
        let Sock = await new SockJS("https://peaceful-earth-72357.herokuapp.com/tictactoe")
        stompClient = over(Sock);
        stompClient.connect({},function(){
            stompClient.subscribe('/events/ws/'+sala, function(x){
                let y = x.body.split(',').map(function(item) {
                    return parseInt(item, 10);
                });
                turn  = !turn 
                chooseSquare(y[0],y[1])
                //console.log(y)                
           }); 
        });
    };
    

    let chooseSquare = function(player1, square){
        
        setBoard(
            board.map((val,idx)=>{
                if(idx == square && val ==""){
                    tempBoard[square] = player1
                    setBoard(tempBoard)
                    return player1
                }
                return val
            })
        )
        

    }
    let sendMessage = function(pos){
        if(turn){
            stompClient.send('/events/ws/'+sala,{},[player,pos])
        }
        
    }

    const checkWin =() =>{
        patterns.forEach((currPattern) =>{
            const firstPlayer = board[currPattern[0]]
            let foundWinningPattern = true
            if(firstPlayer =="")return;
            currPattern.forEach((idx)=>{
                if(board[idx]!=firstPlayer){
                    foundWinningPattern =false
                }
            })
            if(foundWinningPattern){
                setResult({winner:firstPlayer,state:"won"})

            }
        })
    }

    return(
        <div className="App">
            <div className="board">
                <div className="row">
                    <Square val={board[0]} chooseSquare={()=>sendMessage(0)}/>
                    <Square val={board[1]} chooseSquare={()=>sendMessage(1)}/>
                    <Square val={board[2]} chooseSquare={()=>sendMessage(2)}/>
                </div>
                <div className="row">
                    <Square val={board[3]} chooseSquare={()=>sendMessage(3)}/>
                    <Square val={board[4]} chooseSquare={()=>sendMessage(4)}/>
                    <Square val={board[5]} chooseSquare={()=>sendMessage(5)}/>
                </div>

                <div className="row">
                    <Square val={board[6]} chooseSquare={()=>sendMessage(6)}/>
                    <Square val={board[7]} chooseSquare={()=>sendMessage(7)}/>
                    <Square val={board[8]} chooseSquare={()=>sendMessage(8)}/>
                </div>


            </div>
            <div>
                    <Player jugador={pl} win={plw} lose={pll}/>
                    <Player jugador={op} win={opw} lose={opl}/>
                    
                </div>
        </div>
        



    );

}

let Square = function({val, chooseSquare}){
    return (
        <div className="square" onClick={chooseSquare}>
            {val}
        </div>
    )
}

let Player = function({jugador,win,lose}){
    return (
        <div>
            <br></br>
            <h5>
                No esta{jugador}
            </h5>
            <br></br>
            <h5>
                Hey{win}
            </h5>
            <br></br>
            <h5>
                cargando{lose}
            </h5>
        </div>
    )
}