import logo from './logo.svg';
import './App.css';
import Posti from './Posti.js';
import Header from './Header.js';
import { Toaster } from 'react-hot-toast';
import Gates from './Gates.js';



function App() {
  return (
    <>
      <Header />
      <Posti />
      <Gates />
      <Toaster position="bottom/left" />
    </>
  );
}

export default App;
