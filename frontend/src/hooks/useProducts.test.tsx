import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "./useProducts";

const mockFindAllProducts = vi.fn();

vi.mock("../services/productsService", () => ({
  findAllProducts: () => mockFindAllProducts(),
}));

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar produtos com sucesso", async () => {
    mockFindAllProducts.mockResolvedValue([
      { id: "1", name: "Batom Ruby", price: 5000 },
    ]);

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("deve setar erro quando serviço falhar", async () => {
    mockFindAllProducts.mockRejectedValue(new Error("Falha de rede"));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(0);
    expect(result.current.error).toBe("Falha de rede");
  });
});
