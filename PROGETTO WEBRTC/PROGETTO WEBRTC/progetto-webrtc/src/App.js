import logo from './logo.svg';
import './App.css';
import Posti from './Posti.js';
import Header from './Header.js';
import { Toaster } from 'react-hot-toast';



function App() {
  return (
    <>
      <Header />
      <Posti />
      <Toaster position="bottom/right" />
    </>
  );
}

export default App;
