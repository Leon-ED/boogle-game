import {Link } from "react-router-dom";

function Register() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <section style={{ marginTop: "10%", marginBottom: "5%" }}>
        <h1><strong>Créez votre compte Boogle !</strong></h1>
      </section>
      <div>
        <h1>S'inscrire</h1>
        <div>
          <span>Un compte ? <Link to="/login">Pas de problème</Link></span>
        </div>
      </div>
      <section className="login-section" style={{ width: "30%" }}>
        <fieldset id="fieldset">
          <form className="form" method="POST" action="controller/auth.php">
            <div className="form-group">
              <label htmlFor="login">Identifiant</label>
              <input type="text" className="form-control" id="login" name="login" aria-describedby="emailHelp" placeholder="Identifiant" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" className="form-control" id="email" name="email" placeholder="email@domaine.tld" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input type="password" className="form-control" id="password" name="password" placeholder="Mot de passe" required />
            </div>
            <div className="form-group">
              <label htmlFor="password_confirm">Confirmer mot de passe</label>
              <input type="password" className="form-control" id="password_confirm" name="password_confirm" placeholder="Mot de passe" required />
            </div>
            <br />
            <small id="emailHelp" className="form-text text-muted">Nous ne partagerons jamais votre mot de passe avec qui que ce soit, faites-en de même</small>
            <br />
            <button type="submit" className="btn btn-primary"> Créer compte </button>
            <input type="hidden" name="action" value="register" />
          </form>
        </fieldset>
      </section>
    </main>
  );
}

export default Register;
