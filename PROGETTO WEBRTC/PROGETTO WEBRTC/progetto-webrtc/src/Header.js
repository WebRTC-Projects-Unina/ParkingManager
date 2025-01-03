import './Header.css';
import logo from './PROGETTO_DSI.png'

function Header(){
    return (
        <div>
            <div className='header'>
                <h1 className='headText'>DI.P.S Admin Server</h1>
                <img  className="image" src={logo} alt="logo"></img>
            </div>
        </div>
    );
}

export default Header;



