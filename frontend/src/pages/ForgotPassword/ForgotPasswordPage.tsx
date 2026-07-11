import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [uiError, setUiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);

    if (!email) {
      setUiError('Por favor, digite o seu e-mail.');
      toast.error('Por favor, digite o seu e-mail.');
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      // Tratamento de erros comuns do Firebase Auth
      if (err.code === 'auth/user-not-found') {
        setUiError('Não encontramos nenhuma conta cadastrada com este e-mail.');
        toast.error('Não encontramos nenhuma conta cadastrada com este e-mail.');
      } else if (err.code === 'auth/invalid-email') {
        setUiError('O formato do e-mail digitado é inválido.');
        toast.error('O formato do e-mail digitado é inválido');
      } else {
        setUiError('Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.');
        toast.error('Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-tr from-rose-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/login')}
          className="cursor-pointer flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-red-600 transition-colors uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o Login</span>
        </button>

        {/* Cenário de Sucesso */}
        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Verifique seu e-mail</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Enviamos um link de redefinição de senha para <span className="font-semibold text-gray-900">{email}</span>. Acesse sua caixa de entrada e siga as instruções para criar sua nova senha.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full rounded-xl bg-gray-950 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all"
            >
              Ir para a tela de Login
            </button>
          </div>
        ) : (
          /* Formulário de Envio */
          <>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight text-gray-900">
                Recuperar Senha
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Digite o e-mail da sua conta GlowStack para receber o link de redefinição.
              </p>
            </div>

            {uiError && (
              <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500 text-sm text-red-700 font-medium">
                {uiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">E-mail Cadastrado</label>
                <div className="pointer-events-none absolute bottom-3 left-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="seuemail@exemplo.com"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer flex w-full justify-center items-center rounded-xl bg-linear-to-r from-red-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-amber-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando link...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
