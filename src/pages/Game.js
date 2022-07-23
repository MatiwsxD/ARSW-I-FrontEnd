import "./Game.css"
import { useState } from "react";
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { useEffect } from "react";
import { hasUnreliableEmptyValue } from "@testing-library/user-event/dist/utils";

var infoPlayer = ["", "", ""];
var player = null
var oponent = ["", "", ""]
var turn = null
var sala = null
var stompClient = null
var tempBoard = ["", "", "", "", "", "", "", "", ""]
const patterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

export let Game = function () {
    var [pl, setPlayer] = useState(infoPlayer[0])
    var [plw, setPlayerw] = useState(infoPlayer[1])
    var [pll, setPlayerl] = useState(infoPlayer[2])
    var [op, setOPlayer] = useState(oponent[0])
    var [opw, setPlayerwo] = useState(oponent[1])
    var [opl, setPlayerlo] = useState(oponent[2])
    var [board, setBoard] = useState(tempBoard)
    const [result, setResult] = useState({ winner: "none", state: "none" })

    useEffect(() => {
        getData();
        socketWeb();
        setTimeout(function () {
            getInfoPlayer();
        }, 1500);



    }, []);

    useEffect(() => {
        checkIfTie();
        checkWin();
    }, [board])

    useEffect(() => {
        if (result.state != "none") {
            let ganador = ""
            if (player == result.winner) {
                ganador = infoPlayer[0]
            }
            else {
                ganador = oponent[0]
            }
            alert('Juego terminado, ganador: ' + ganador);
            //llamar una funcion que vea si el winner conside con el player, si si hacer fetch a winner, sino hacer fetch a losser
            turn = false;
            if (result.winner == player) {
                putWinner("Winner")
            }
            else {
                putWinner("Loser")
            }
            resetRoom()


        }

    }, [result])

    /**
     * It sends a POST request to the server to reset the room
     */
    function resetRoom() {
        let url = "https://peaceful-earth-72357.herokuapp.com/tictac/resetRoom/" + sala
        fetch(url, {
            method: 'POST'
        })

    }
    /**
     * It sends a POST request to a server with the email of the user and the action they took.
     * @param accion - is the action that the user is doing, in this case, it's a win.
     */
    function putWinner(accion) {
        let correo = sessionStorage.getItem("Correo");
        let url = "https://peaceful-earth-72357.herokuapp.com/tictac/" + accion + "/" + correo
        fetch(url, {
            method: 'POST'
        })
    }


    /**
     * It sends the information of the player to the server, and then the server sends it to the other
     * player.
     */
    async function getInfoPlayer() {
        let correo = sessionStorage.getItem("Correo");
        let url2 = 'https://peaceful-earth-72357.herokuapp.com/tictac/getUser/' + correo
        let players = await fetch(url2, {
            method: 'GET'
        }).then(response => response.json());
        infoPlayer = [players.name, players.pGanadas, players.pPerdidas];

        stompClient.subscribe('/events/ws/' + sala + player, function (x) {
            oponent = x.body.split(',')
            setPlayer(infoPlayer[0])
            setPlayerw(infoPlayer[1])
            setPlayerl(infoPlayer[2])
            setOPlayer(oponent[0])
            setPlayerwo(oponent[1])
            setPlayerlo(oponent[2])

            if (parseInt(player) == 1) {
                stompClient.send('/events/ws/' + sala + 2, {}, infoPlayer)
            }

        })
        if (parseInt(player) == 2) {
            stompClient.send('/events/ws/' + sala + 1, {}, infoPlayer)
        }


    }


    /**
     * It gets the data from the server and sets the turn variable to true or false depending on the number
     * of players in the room.
     */
    async function getData() {
        sala = sessionStorage.getItem("Sala")
        //console.log(sala);
        let url = 'https://peaceful-earth-72357.herokuapp.com/tictac/players/' + sala
        let players = await fetch(url, {
            method: 'GET'
        }).then(response => response.json());
        player = players;
        if (players === 1) {
            turn = true;
        }
        else {
            turn = false;
        }

    };

    /**
     * It connects to a websocket server, subscribes to a channel, and when it receives a message, it calls
     * the chooseSquare function.
     * 
     * The chooseSquare function is defined in the same file, and it's a bit long, so I'll just paste the
     * relevant part:
     * @returns a promise.
     */
    async function socketWeb() {
        let Sock = await new SockJS("https://peaceful-earth-72357.herokuapp.com/tictactoe")
        stompClient = over(Sock);
        stompClient.connect({}, function () {
            stompClient.subscribe('/events/ws/' + sala, function (x) {
                let y = x.body.split(',').map(function (item) {
                    return parseInt(item, 10);
                });
                turn = !turn
                chooseSquare(y[0], y[1])
                //console.log(y)                
            });
        });

    };


    /**
     * It takes a player and a square, and if the square is empty, it sets the square to the player.
     * @param player1 - the player who's turn it is
     * @param square - the square that the player clicked on
     */
    let chooseSquare = function (player1, square) {

        setBoard(
            board.map((val, idx) => {
                if (idx == square && val == "") {
                    tempBoard[square] = player1
                    setBoard(tempBoard)
                    return player1
                }
                return val
            })
        )


    }
    /**
     * If it's my turn, send a message to the server with my player number and the position I clicked on.
     * @param pos - position of the cell
     */
    let sendMessage = function (pos) {
        if (turn) {
            stompClient.send('/events/ws/' + sala, {}, [player, pos])
        }

    }

    /**
     * It checks if the current player has won the game by checking if the current player has a winning
     * pattern.
     */
    const checkWin = () => {
        patterns.forEach((currPattern) => {
            const firstPlayer = board[currPattern[0]]
            let foundWinningPattern = true
            if (firstPlayer == "") return;
            currPattern.forEach((idx) => {
                if (board[idx] != firstPlayer) {
                    foundWinningPattern = false
                }
            })
            if (foundWinningPattern) {
                setResult({ winner: firstPlayer, state: "won" })

            }
        })
    }
    const checkIfTie =() =>{
        let filled = true;
        board.forEach((square) =>{
            if(square ==""){
                filled = false
            }
        })
        if (filled){
            setResult({winner: "Ninguno", state: "Empate"});
        }
    };

    return (
        <div className="App">
            <div className="board">
                <div className="row">
                    <Square val={board[0]} chooseSquare={() => sendMessage(0)} />
                    <Square val={board[1]} chooseSquare={() => sendMessage(1)} />
                    <Square val={board[2]} chooseSquare={() => sendMessage(2)} />
                </div>
                <div className="row">
                    <Square val={board[3]} chooseSquare={() => sendMessage(3)} />
                    <Square val={board[4]} chooseSquare={() => sendMessage(4)} />
                    <Square val={board[5]} chooseSquare={() => sendMessage(5)} />
                </div>

                <div className="row">
                    <Square val={board[6]} chooseSquare={() => sendMessage(6)} />
                    <Square val={board[7]} chooseSquare={() => sendMessage(7)} />
                    <Square val={board[8]} chooseSquare={() => sendMessage(8)} />
                </div>


            </div>
            <div>
                <Player jugador={pl} win={plw} lose={pll} />
                <Player jugador={op} win={opw} lose={opl} />

            </div>
        </div>




    );

}

let Square = function ({ val, chooseSquare }) {
    return (
        <div className="square" onClick={chooseSquare}>
            {val}
        </div>
    )
}

let Player = function ({ jugador, win, lose }) {
    return (
        <div>
            <br></br>
            <h5>
                Nick: {jugador}
            </h5>
            <br></br>
            <h5>
                Partidas ganadas: {win}
            </h5>
            <br></br>
            <h5>
                Partidas perdidas: {lose}
            </h5>
        </div>
    )
}