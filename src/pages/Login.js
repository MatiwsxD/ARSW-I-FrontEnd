import React, {useState} from 'react';
import logo from './logo.png'
//import Login1 from './Login1.css'
import { useNavigate } from 'react-router-dom';

export let Login = function(){
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let  navigate = useNavigate();


  let register=function(){
      navigate('/')
  }
  let login = async()=>{
    
    let url = 'https://peaceful-earth-72357.herokuapp.com/tictac/login/'+email+'/'+password
    let data = await fetch(url,{
      method: 'GET'
    }).then(response => response.json());
    if(data){
      navigate('/room')
      sessionStorage.setItem("Correo",email);
    }
    else{
      alert("Contraseña o correo incorrectos")
    }
  }
    

    
    return(
    <div className="App">
    <img src={logo} className="logo" alt="Business view - Reports" />
    <div className="form" >
      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input type="email" name="email" placeholder="nome@email.com.br" onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input type="password" name="password" onChange={e=>setPassword(e.target.value)}/>
      </div>
      <button className="primary" onClick={login}>Iniciar sesion</button>
    </div>
    <button className="secondary" onClick={register}>
      Registrar
    </button>
  </div>)
}   