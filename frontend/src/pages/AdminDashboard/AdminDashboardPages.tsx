import React, { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { getAuth } from "firebase/auth";
import { useErrorBoundary } from "react-error-boundary";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  Loader2,
  Package,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  Save,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
} from "lucide-react";

// import components
import { BillingDashboard } from "../../components/BillingDashboard/BillingDashboard";

export const AdminDashboard: React.FC = () => {
  const { products, loading, error, refresh } = useProducts();
  const { formatCurrency } = useCart();
  const { showBoundary } = useErrorBoundary();

  // Estados do CRUD e Interface
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Estados locais para a imagem no modal de edição
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Função Auxiliar de Upload Assíncrono para o Storage
  const uploadImageAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        () => reject("Falha ao subir imagem."),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        },
      );
    });
  };

  // 2. Ação de Exclusão (DELETE)
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Deseja remover este produto do catálogo definitivo?"))
      return;
    setIsSaving(true);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch(
        `http://localhost:3001/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Erro ao deletar produto.");

      showToast("Produto removido com sucesso!");
      refresh();
    } catch (err) {
      showBoundary(err);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Ação de Atualização Completa com Imagem (UPDATE)
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = editingProduct.currentImageUrl;

      // Se o administrador selecionou uma nova foto, faz o upload primeiro
      if (imageFile) {
        finalImageUrl = await uploadImageAsync(imageFile);
      }

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch(
        `http://localhost:3001/admin/products/update/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            price: Math.round(parseFloat(editingProduct.priceInReal) * 100),
            category: editingProduct.category,
            stock: Number(editingProduct.stock),
            imageUrl: finalImageUrl, // Passa a nova URL ou mantém a existente
          }),
        },
      );

      if (!response.ok) throw new Error("Erro ao atualizar produto.");

      showToast("Produto modificado com sucesso!");
      setEditingProduct(null);
      setImageFile(null);
      setUploadProgress(null);
      refresh();
    } catch (err) {
      showBoundary(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Carregando a coleção GlowStack...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md my-8 rounded-xl bg-red-50 p-6 text-center border border-red-200">
        <p className="text-sm font-semibold text-red-800">
          Ops! Algo deu errado.
        </p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-gray-500">
          Nenhum produto de maquiagem cadastrado no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* CABEÇALHO ORIGINAL */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-red-600" /> Painel GlowStack
              Admin
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Controle de inventário e gerenciamento ágil de estoque de
              maquiagens.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refresh()}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar Lista
            </button>
            <button
              onClick={() => (window.location.href = "/admin/new-product")}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-2xs"
            >
              Adicionar Maquiagem
            </button>
          </div>
        </div>

        {/* NOTIFICAÇÃO TOAST */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in z-50">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tabela do CRUD */}
        {/* TABELA ORIGINAL DE CONTROLE DE ESTOQUE */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Maquiagem</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-center">Qtd. Estoque</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {products.map((product) => {
                const isCriticalStock = product.stock <= 3;
                // Coleta de forma segura a primeira imagem do array ou o fallback padrão
                const productThumbnail =
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://unsplash.com";

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Coluna 1: Imagem e Nome */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                        <img
                          src={productThumbnail}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-gray-900 block max-w-60truncate">
                        {product.name}
                      </span>
                    </td>

                    {/* Coluna 2: Categoria Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-pink-50 px-2 py-0.5 text-xs font-bold text-red-700 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </td>

                    {/* Coluna 3: Preço Formatado */}
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Coluna 4: Quantidade e Alerta Dinâmico */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isCriticalStock && product.stock > 0 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        )}
                        <span
                          className={`text-sm font-black ${
                            product.stock === 0
                              ? "text-red-500 line-through"
                              : isCriticalStock
                                ? "text-amber-600"
                                : "text-gray-900"
                          }`}
                        >
                          {product.stock === 0
                            ? "Esgotado"
                            : `${product.stock} un`}
                        </span>
                      </div>
                    </td>

                    {/* Coluna 5: Gatilhos dos Modais (Edit e Delete) */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...product,
                            priceInReal: (product.price / 100).toString(),
                            currentImageUrl: productThumbnail,
                          })
                        }
                        className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg p-1.5 bg-white shadow-2xs transition-colors"
                        title="Editar produto completo"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isSaving}
                        className="inline-flex items-center text-xs font-bold text-red-500 hover:text-red-700 border border-gray-200 rounded-lg p-1.5 bg-white shadow-2xs transition-colors disabled:opacity-50"
                        title="Deletar produto permanentemente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL COMPLETO DE ATUALIZAÇÃO (INCLUI UPLOAD DE FOTO) */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-1.5">
                  <Edit3 className="h-5 w-5 text-red-600" /> Modificar Maquiagem
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setImageFile(null);
                    setUploadProgress(null);
                  }}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Formulário de Edição */}
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Descrição
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    required
                  />
                </div>

                {/* Preço e Estoque em Grid de 2 Colunas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.priceInReal}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceInReal: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Estoque
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                {/* Categoria de Beleza no Modal */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm bg-white outline-none focus:border-red-500"
                  >
                    <option value="labios">Lábios</option>
                    <option value="pele">Pele</option>
                    <option value="olhos">Olhos</option>
                    <option value="skincare">Skincare</option>
                  </select>
                </div>

                {/* Seção de Atualização e Preview de Foto */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Atualizar Imagem
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img
                        src={
                          imageFile
                            ? URL.createObjectURL(imageFile)
                            : editingProduct.currentImageUrl
                        }
                        alt="Preview de Maquiagem"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-1.5 justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer transition-all">
                        <UploadCloud className="h-4 w-4 text-gray-400" />
                        <span>Substituir Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setImageFile(e.target.files?.[0] || null)
                          }
                          className="sr-only"
                        />
                      </label>
                      {imageFile && (
                        <p className="text-[10px] text-red-600 font-bold mt-1 truncate max-w-50">
                          📎 {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO DO STORAGE NO MODAL */}
                {uploadProgress !== null && (
                  <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-3 space-y-1.5 animate-fade-in mt-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-red-700 animate-pulse">
                        {uploadProgress < 100
                          ? "Atualizando foto no storage..."
                          : "Nova foto salva com sucesso! ✨"}
                      </span>
                      <span className="font-black text-pink-600 bg-pink-100/60 px-1.5 py-0.5 rounded-md">
                        {uploadProgress}%
                      </span>
                    </div>

                    {/* Trilha visual da animação */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden shadow-2xs">
                      <div
                        className="bg-linear-to-r from-red-600 to-amber-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Botão de Disparo Administrativo */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex justify-center items-center gap-1 rounded-xl bg-linear-to-r from-red-600 to-amber-500 p-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-100 mt-4 disabled:opacity-50 active:scale-99 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Sincronizando Alterações...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Confirmar e Salvar Alterações
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        <BillingDashboard />
      </div>
    </div>
  );
};
