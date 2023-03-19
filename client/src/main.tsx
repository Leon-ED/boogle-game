import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Definitions from './pages/Definitions';
import Error404 from './pages/404';
import './index.css'
import Logout from './actions/Logout';



function Main() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/definitions" element={<Definitions />} />
        <Route path="/definitions/:search" element={<Definitions />} />
        <Route path="*" element={<Error404 />} />
        <Route path="/logout" element={<Logout />}  />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));
