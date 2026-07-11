import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  ArrowLeft,
  PlusCircle,
  UploadCloud,
  Loader2,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

// 1. Definição do Schema de Validação com Zod
const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  description: z
    .string()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
  priceInReal: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Insira um preço válido e maior que zero.",
    }),
  stock: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "O estoque não pode ser negativo.",
    }),
  category: z.enum(["labios", "pele", "olhos", "skincare"], {
    message: "Selecione uma categoria válida.",
  }),
});

// Inferência do tipo TypeScript baseado no Schema do Zod
type ProductFormData = z.infer<typeof productSchema>;

export const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  // Estados do Formulário
  // Estados de Upload de Imagem e Envio
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  // Inicialização do React Hook Form integrado ao Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "labios",
      stock: "10",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageError(null);
    }
  };

  // Função auxiliar para fazer o upload do arquivo para o Firebase Storage
  const uploadImageAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      // Define um nome único usando timestamp para evitar sobreposição de arquivos
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error(error);
          reject("Falha ao subir imagem para o Storage.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        },
      );
    });
  };

  // Disparo da submissão validada
  const onSubmit = async (data: ProductFormData) => {
    setUiError(null);

    if (!imageFile) {
      setImageError("A imagem do produto é obrigatória.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImageAsync(imageFile);
      const priceInCents = Math.round(parseFloat(data.priceInReal) * 100);

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      if (!token) throw new Error("Sessão administrativa não identificada.");

      const response = await fetch("http://localhost:3001/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: priceInCents,
          imageUrl,
          category: data.category,
          stock: Number(data.stock),
        }),
      });

      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.message || "Erro ao salvar produto.");

      toast.success("Produto cadastrado com sucesso no ecossistema GlowStack!");
      handleFormReset();
      navigate("/admin");
    } catch (err: any) {
      setUiError(err.message || "Ocorreu um erro ao processar o cadastro.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Lógica de Reset Completo do Formulário e Estados Locais
  const handleFormReset = () => {
    reset(); // Reseta os campos monitorados pelo React Hook Form
    setImageFile(null);
    setImageError(null);
    setUiError(null);
    setUploadProgress(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl bg-white rounded-2xl border border-gray-100 p-8 shadow-xl">
        {/* Topo / Voltar */}
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-red-600 transition-colors uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o Painel</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-red-600" /> Novo Produto Glam
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre maquiagens integrando automaticamente o estoque com o
            catálogo do Stripe.
          </p>
        </div>

        {uiError && (
          <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 text-sm text-red-700 font-medium mb-6">
            {uiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Nome da Maquiagem
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full rounded-xl border py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-1 ${
                  errors.name
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:amber-pink-500 focus:ring-amber-500"
                }`}
                placeholder="Ex: Batom Matte Velvet - Nude Luxo"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Descrição Detalhada
              </label>
              <textarea
                rows={3}
                {...register("description")}
                className={`w-full rounded-xl border py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-1 ${
                  errors.description
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                }`}
                placeholder="Explique os benefícios e acabamento do produto..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />{" "}
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Preço em Real */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("priceInReal")}
                className={`w-full rounded-xl border py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-1 ${
                  errors.priceInReal
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                }`}
                placeholder="0.00"
              />
              {errors.priceInReal && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />{" "}
                  {errors.priceInReal.message}
                </p>
              )}
            </div>

            {/* Estoque Inicial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Estoque Inicial
              </label>
              <input
                type="number"
                min="0"
                {...register("stock")}
                className={`w-full rounded-xl border py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-1 ${
                  errors.stock
                    ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />{" "}
                  {errors.stock.message}
                </p>
              )}
            </div>

            {/* Categoria de Beleza */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Categoria de Beleza
              </label>
              <select
                {...register("category")}
                className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm text-gray-900 bg-white outline-none transition-all focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              >
                <option value="labios">Lábios</option>
                <option value="pele">Pele</option>
                <option value="olhos">Olhos</option>
                <option value="skincare">Skincare</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />{" "}
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Upload de Imagem Contêiner */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Foto do Produto
              </label>
              <div
                className={`flex justify-center rounded-xl border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  imageError
                    ? "border-red-300 bg-red-50/10"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-12 w-12 ${imageError ? "text-red-400" : "text-gray-400"}`}
                  />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-semibold text-pink-600 hover:text-pink-500 focus-within:outline-none">
                      <span>Selecionar Arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG ou WEBP de até 5MB
                  </p>
                  {imageFile && (
                    <p className="text-xs font-bold mt-2 bg-pink-50 text-red-700 px-2.5 py-1 rounded-md inline-block">
                      📎 {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
              {imageError && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> {imageError}
                </p>
              )}
            </div>
          </div>

          {/* Barra de Progresso Real do Storage */}
          {uploadProgress !== null && (
            <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-4 space-y-2骨 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-pink-700 animate-pulse">
                  {uploadProgress < 100
                    ? "Enviando imagem para o catálogo..."
                    : "Imagem processada com sucesso! ✨"}
                </span>
                <span className="font-black text-pink-600 bg-pink-100/60 px-2 py-0.5 rounded-md">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-2xs">
                <div
                  className="bg-linear-to-r from-pink-600 to-rose-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botões de Ação Final da Página */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleFormReset}
              disabled={isSubmitting}
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 transition-all sm:w-1/3"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Limpar Tudo
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center rounded-xl bg-linear-to-r from-red-600 to-amber-500 px-4 py-3.5 text-sm font-semibold text-white hover:from-red-700 hover:to-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-pink-100"
            >
              {isSubmitting? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando com Stripe & Firebase...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Cadastrar Maquiagem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
