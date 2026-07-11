import { Link } from 'react-router-dom'

export const ErrorPage = () => {
  return(
    <div className="w-full max-w-xl mx-auto h-90 mt-25 flex flex-col items-center justify-center px-2 py-5 rounded-xl bg-white shadow-2xl border border-slate-200">
      <h1 className="bg-linear-to-r from-red-600 bg-slate-800 bg-clip-text text-transparent text-center mt-3 mb-6 text-shadow-black text-6xl font-bold">404</h1>
      <h1 className="bg-linear-to-r from-red-600 bg-amber-500 bg-clip-text text-transparent text-shadow-black text-center text-3xl font-semibold mb-7">Página não encontrada!</h1>
      <p className="italic text-slate-800 mb-7 font-bold text-xl text-center">Você caiu em uma página que não existe!</p>

      <Link className="bg-amber-50 text-amber-500 font-bold px-2 py-2 rounded-lg hover:bg-amber-100 transition-colors duration-300" to="/">
        Voltar para home
      </Link>
    </div>
  )
}