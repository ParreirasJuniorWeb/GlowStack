import { Link, useNavigate } from "react-router-dom";
// components
import Input from "../../components/common/input/input";
import Button from "../../components/common/button/button";
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
// toast hook
import toast from "react-hot-toast";
// custom hook to login action
import { useAuth } from "../../hooks/useAuth";
import { FaSpinner } from "react-icons/fa";

type ErrorComponentProps = {
  msg: string;
};

const ShowErrorComponent = ({
  children,
  duration = 3000,
}: {
  children: ReactNode;
  duration?: number;
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;
  return <>{children}</>;
};

const ErrorComponent = ({ msg }: ErrorComponentProps) => {
  return (
    <div className="mx-auto max-w-md my-8 rounded-xl bg-red-50 p-6 text-center border border-red-200">
      <p className="text-sm font-semibold text-red-800">
        Ops! Algo deu errado.
      </p>
      <p className="mt-1 text-xs text-red-600">{msg}</p>
    </div>
  );
};

const Login = () => {
  // dados do custom hook
  const { login, loginWithGoogle, loading, isLoggedIn } = useAuth();
  // STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novos estados locais para controle de tentativas
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setUiError(null);
    try {
      await loginWithGoogle();
      toast.success("Conectado com sucesso via Google!");
      navigate("/", {replace: true});
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setUiError(
          "A janela de login do Google foi fechada antes da conclusão.",
        );
      } else {
        setUiError("Falha ao autenticar com o Google. Tente novamente.");
      }
    }
  };

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

    if (isLocked) return;

    setIsSubmitting(true);

    try {
      await login(email, password);
      setFailedAttempts(0); // Reseta ao logar com sucesso
      toast.success("Login com sucesso na GlowStack!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      // Controle de tentativas de acesso indevido
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        // Bloqueia localmente após 5 erros seguidos
        if (nextAttempts >= 5) {
          setIsLocked(true);
          setLockCountdown(30); // 30 segundos de penalidade
          setUiError(
            "Muitas tentativas incorretas. Botão de login bloqueado por 30 segundos.",
          );

          const interval = setInterval(() => {
            setLockCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsLocked(false);
                setFailedAttempts(0);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setUiError(
            `E-mail ou senha incorretos. Tentativas restantes: ${5 - nextAttempts}`,
          );
        }
      }
      // Tratamento amigável de erros comuns do Firebase Auth
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setUiError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setUiError("Este e-mail já está sendo utilizado por outra conta.");
      } else if (err.code === "auth/too-many-requests") {
        setUiError(
          "Sua conta foi temporariamente bloqueada devido a muitas tentativas inválidas. Por favor, tente novamente em alguns minutos.",
        );
      } else {
        setUiError(
          "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <FaSpinner className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Carregando a coleção GlowStack...
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

      {(!isLoggedIn || !!uiError) && (
        <ShowErrorComponent>
          {uiError && <ErrorComponent msg={uiError} />}
        </ShowErrorComponent>
      )}

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
        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Ou continue com
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-99 transition-all duration-150"
          >
            {/* SVG Oficial da Logo do Google */}
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              xmlns="http://w3.org"
            >
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path
                  d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1l3.12,2.42c1.84,-1.7 2.89,-4.2 2.89,-7.12c0,-0.41 -0.04,-0.81 -0.11,-1.2z"
                  fill="#4285F4"
                />
                <path
                  d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.08l-3.12,-2.42c-0.87,0.59 -1.98,0.94 -3.42,0.94c-2.63,0 -4.85,-1.77 -5.64,-4.15L2.24,15.2c1.55,3.08 4.74,5.3 8.47,5.3z"
                  fill="#34A853"
                />
                <path
                  d="M6.36,12.79c-0.21,-0.63 -0.33,-1.3 -0.33,-2c0,-0.7 0.12,-1.37 0.33,-2L2.24,5.6c-0.78,1.55 -1.22,3.3 -1.22,5.15c0,1.85 0.44,3.6 1.22,5.15l4.12,-3.11z"
                  fill="#FBBC05"
                />
                <path
                  d="M12,5.48c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,2.9 14.29,2.3 12,2.3C8.27,2.3 5.08,4.52 3.53,7.6L7.65,10.71c0.79,-2.38 3.01,-4.15 5.64,-4.15z"
                  fill="#EA4335"
                />
              </g>
            </svg>
            <span>Entrar com o Google</span>
          </button>
        </div>
        <small className="text-center mt-2 text-slate-900 text-sm italic">
          Esqueceu sua senha.{" "}
          <button
            onClick={() => navigate("/forgotUserPassword")}
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
        <Button
          type="submit"
          className="transition-transform hover:scale-101"
          disabled={isSubmitting || isLocked}
        >
          {loading || isSubmitting ? "Aguarde..." : "Entrar na Loja"}
          {isLocked && `Bloqueado (${lockCountdown}s)`}
        </Button>
        {uiError && (
          <p className="text-md text-center text-red-600 font-bold p-5">
            {uiError && !isLoggedIn && uiError}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
