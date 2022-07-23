import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "./Room.css"

export let Room = function(){
    let [room, setRoom] = useState('');
    let  navigate = useNavigate();

    let buttonClick = async(x)=>{
        let url = 'https://peaceful-earth-72357.herokuapp.com/tictac/createRoom/'+x
        let data = await fetch(url,{
            method: 'GET'
          }).then(response => response.json());
          //console.log(data);
          if(data){
            sessionStorage.setItem("Sala",x);
            navigate("/game")
            window.location.reload(false);
          }
          else{
            alert("La sala esta llena")
          }
        
        
    }

    return(
        <div>
            <center>
            <div>
            <label htmlFor="text_Sala">Digite aqui el nombre de la sala a la cual desea entrar</label>
            <br/>
            <input type="text" name="input_Room" onChange={e=>setRoom(e.target.value)}/>
            <br/>
            <button className="buttonRoom" onClick={() => buttonClick(room)}>Unirse a sala</button>
            <br/>
            </div>
            <div>
                    <li> <button className='BotonSala' onClick={() => buttonClick("A")}>Sala A</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("B")}>Sala B</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("C")}>Sala C</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("D")}>Sala D</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("E")}>Sala E</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("F")}>Sala F</button></li>
                    <li> <button className='BotonSala' onClick={() => buttonClick("G")}>Sala G</button></li>
            </div>
            </center>

        </div>

    )
}