import { Link, redirect } from 'react-router-dom';



function NavBar(props: any) {
    return (
        <nav>
            <Link to="/" className="left" style={{color:"var(--black)"}}>
                <img src="/logo.png" alt="Boogle Logo" width="100" height="100" />
                    <h1>oogle - Le jeu </h1>
            </Link>
            <div className="flex-row right">
            <h3><Link to="definitions/">Dictionnaire</Link></h3>

            {!props.connecte &&
            <>                <h3><Link to="account">Inscription</Link></h3>
                <h3><Link  to="/login">Connexion</Link></h3>
                </>
            }{
                props.connecte &&
                <>
                <h3><Link to="account"> Mon compte</Link></h3>
                <h3><Link className="logout" to="/logout">Deconnexion</Link></h3>
                </>
            }

            </div>
        </nav>
    );




}


export default NavBar;
