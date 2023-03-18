import { Link, useNavigate } from "react-router-dom";

function Login() {
  const history = useNavigate();

  return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <section style={{ marginTop: "10%", marginBottom: "5%" }}>
          <h1>
            <strong> Connectez-vous sur Boogle !</strong>
          </h1>
        </section>
        <div>
          <h1>Se connecter</h1>
        </div>
        <div>
          <span>
            Pas de compte ? <Link to="/register">Pas de problème</Link>
          </span>
        </div>
        <section
          className="login-section"
          style={{ width: "30%" }}
        >
          <fieldset id="fieldset">
            <form
              className="form"
              method="POST"
              onSubmit={(e) => submitForm(e, history)}
            >
              <div className="form-group">
                <label htmlFor="login">Identifiant</label>
                <input
                  type="text"
                  className="form-control"
                  id="login"
                  name="login"
                  aria-describedby="emailHelp"
                  placeholder="Identifiant"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Mot de passe"
                  required
                />
              </div>
              <br />
              <small id="emailHelp" className="form-text text-muted">
                Nous ne partagerons jamais votre mot de passe avec qui que ce
                soit, faites-en de même
              </small>
              <br />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ margin: "auto" }}
              >
                {" "}
                Se connecter{" "}
              </button>
              <input type="hidden" name="action" value="login" />
            </form>
          </fieldset>
        </section>
      </main>
  );
}
async function submitForm(e: any, history: any) {
    e.preventDefault();
    const reponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: e.target.login.value,
        password: e.target.password.value,
      }),
    });
    const data = await reponse.json();
    if (data.status === "success") {
      localStorage.setItem("token", data.token);
      history("/");
    } else {
      
    }
  }

  
export default Login;