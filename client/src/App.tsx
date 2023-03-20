import { useState } from 'react'
import Login from './pages/Login'
import viteLogo from './assets/vite-logo.svg'
import reactLogo from './assets/react-logo.svg'
import NavBar from './components/NavBar'
import Grille from './components/Grille'
import Chat from './components/Chat'


function App() {



  return (
    <>

    <Grille largeur={4} hauteur={4} />
    <Chat />



    </>
  )
}

export default App
