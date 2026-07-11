import { Link, useNavigate } from "react-router-dom";
// components
import Input from "../../components/common/input/input";
import Button from "../../components/common/button/button";
import { useState, type FormEvent } from "react";
// toast hook
import toast from "react-hot-toast";
// custom hook to login action
import { useAuth } from "../../hooks/useAuth";

type ErrorComponentProps = {
  msg: string;
};

const ErrorComponent = ({ msg }: ErrorComponentProps) => {
  return (
    <p className="bg-linear-to-r from-red-600 bg-amber-500 bg-clip-text text-transparent text-shadow-black text-center font-bold text-lg border border-red-500 rounded-lg p-2 mt-2 mb-2">
      {msg}
    </p>
  );
};

const Login = () => {
  // dados do custom hook
  const { login, loading, isLoggedIn, resetPassword } = useAuth();
  // STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);

    // Validações básicas antes de enviar ao banco
    if (!email || !password) {
      setUiError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setUiError("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Login com sucesso na GlowStack!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      // Tratamento amigável de erros comuns do Firebase Auth
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setUiError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setUiError("Este e-mail já está sendo utilizado por outra conta.");
      } else {
        setUiError(
          "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if(!email) {
      toast.error("Informe um e-mail váildo no campo do formulário 'E-mail'.")
      return;
    };
    await resetPassword(email);
    toast.success(`Um e-mail de redefinição de senha foi enviado para ${email}.`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-red-600 animate-pulse">
          Carregando GlowStack...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl items-center justify-center h-full mx-auto px-2">
      <Link to="/">
        <h1 className="mt-3 text-slate-800 mb-7 font-bold text-5xl text-center">
          Glow
          <span className="bg-linear-to-r from-red-600 bg-slate-800 bg-clip-text text-transparent text-shadow-black">
            Stack
          </span>
        </h1>
        <p className="bg-linear-to-r from-red-600 bg-amber-500 bg-clip-text text-transparent text-shadow-black text-center font-bold text-lg">
          Beleza em um clique.
        </p>
      </Link>

      {!isLoggedIn || !!uiError && <ErrorComponent msg={uiError as string} />}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mt-8 flex flex-col px-2 py-5 rounded-xl bg-white shadow-2xl border border-slate-200"
      >
        <Input
          inputProps={{
            type: "email",
            placeholder: "E-mail",
            required: true,
            name: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
          labelText="E-mail:"
          classNameContainer="p-3"
          labelProps={{ htmlFor: "email" }}
        />
        <Input
          inputProps={{
            type: "password",
            placeholder: "Senha",
            required: true,
            name: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
          }}
          labelText="Senha:"
          classNameContainer="p-3"
          labelProps={{ htmlFor: "password" }}
        />
        <small className="text-center mt-2 text-slate-900 text-sm italic">
          Esqueceu sua senha.{" "}
          <button
            onClick={() => handleForgotPassword(email)}
            type="button"
            className="cursor-pointer bg-amber-50 text-amber-500 font-bold px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors duration-300"
          >
            Clique aqui
          </button>
        </small>
        <small className="text-center p-2 text-slate-900 text-sm italic">
          Ainda não possui uma conta?
          <Link
            to="/register"
            className="bg-amber-50 text-amber-500 font-bold px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors duration-300"
          >
            Cadastre-se.
          </Link>
        </small>
        <Button type="submit" className="transition-transform hover:scale-101">
          {loading || isSubmitting ? "Aguarde..." : "Cadastrar"}
        </Button>
        {uiError && (
          <p className="text-md text-center text-red-600 font-bold p-5">
            {uiError && !isLoggedIn && (
              <p>{uiError}</p>
            )}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
