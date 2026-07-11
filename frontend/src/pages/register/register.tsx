import { Link, useNavigate } from "react-router-dom";

// components
import Input from "../../components/common/input/input";
import Button from "../../components/common/button/button";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

// custom hook to login action
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
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

const Register = () => {
  const { register, currentUser, loading, isLoggedIn } = useAuth();
  // STATES
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);

    // Validações básicas antes de enviar ao banco
    if (!email || !password || !name) {
      setUiError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setUiError("A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, name);
      toast.success("Conta criada com sucesso na GlowStack!");
      navigate("/login");
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
        <h1 className="mt-2 text-slate-800 mb-5 font-bold text-5xl text-center">
          Glow
          <span className="bg-linear-to-r from-red-600 bg-slate-800 bg-clip-text text-transparent text-shadow-black">
            Stack
          </span>
        </h1>
        <p className="bg-linear-to-r from-red-600 bg-amber-500 bg-clip-text text-transparent text-shadow-black text-center font-bold text-lg mb-4">
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
        className="w-full max-w-md mt-1 flex flex-col px-2 py-5 rounded-xl bg-white shadow-2xl border border-slate-200"
      >
        <Input
          inputProps={{
            placeholder: "Nome completo",
            required: true,
            name: "name",
            value: name,
            onChange: (e) => setName(e.target.value),
          }}
          labelText="Nome Completo:"
          classNameContainer="p-2"
          labelProps={{ htmlFor: "name" }}
        />
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
          classNameContainer="p-2"
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
          classNameContainer="p-2"
          labelProps={{ htmlFor: "password" }}
        />
        <small className="text-center text-slate-900 text-sm italic pb-2">
          Já possui uma conta?
          <Link
            to="/login"
            className="bg-amber-50 text-amber-500 font-bold px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors duration-300"
          >
            Faça Login.
          </Link>
        </small>
        <Button type="submit" className="transition-transform hover:scale-101">
          {loading || isSubmitting ? "Aguarde..." : "Cadastrar"}
        </Button>
        {uiError && (
          <p className="text-md text-center text-red-600 font-bold p-5">
            {uiError && !isLoggedIn && currentUser === null && <p>{uiError}</p>}
          </p>
        )}
      </form>
    </div>
  );
};

export default Register;
