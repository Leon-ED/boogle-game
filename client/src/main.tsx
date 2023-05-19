import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import {ConnectedNavBar,NavBar} from './components/NavBar'

import Login from './pages/Login';
import Register from './pages/Register';
import Definitions from './pages/Definitions';
import Error404 from './pages/404';
import './index.css'
import Logout from './actions/Logout';
import { BACKEND_URL } from './env';
import { Lobby } from './pages/Lobby';


function Main() {
  const [loggedIn, setLoggedIn] = React.useState(false);


  React.useEffect(() => {
    fetch(BACKEND_URL + "/auth/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
      }),
    }).then((response) => {
      return response.json();
    }
    ).then((data) => {
      if (data.status === "success") {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    }
    );
  }, []);


  return (
    <BrowserRouter>
      {loggedIn && <ConnectedNavBar />}
      {!loggedIn && <NavBar />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/definitions" element={<Definitions />} />
        <Route path="/definitions/:search" element={<Definitions />} />
        <Route path="/create" element={<Lobby />} />
        <Route path="/join/:id" element={<Lobby />} />
        <Route path="*" element={<Error404 />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));
