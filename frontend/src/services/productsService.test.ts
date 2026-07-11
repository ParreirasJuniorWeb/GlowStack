import { describe, it, expect, vi, beforeEach } from "vitest";

const {
    mockGetDocs,
    mockGetDoc,
    mockCollection,
    mockDoc,
    mockQuery,
    mockOrderBy,
} = vi.hoisted(() => ({
    mockGetDocs: vi.fn(),
    mockGetDoc: vi.fn(),
    mockCollection: vi.fn(),
    mockDoc: vi.fn(),
    mockQuery: vi.fn(),
    mockOrderBy: vi.fn(),
}));

vi.mock("./firebaseConnection", () => ({
    db: {},
}));

vi.mock("firebase/firestore", () => ({
    collection: (...args: unknown[]) => mockCollection(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    query: (...args: unknown[]) => mockQuery(...args),
    orderBy: (...args: unknown[]) => mockOrderBy(...args),
}));

import { findAllProducts, findProductById } from "./productsService";

describe("productsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCollection.mockReturnValue("productsRef");
        mockOrderBy.mockReturnValue("createdAtDesc");
        mockQuery.mockReturnValue("queryRef");
        mockDoc.mockReturnValue("docRef");
    });

    it("findAllProducts deve retornar lista mapeada de produtos", async () => {
        mockGetDocs.mockResolvedValue({
            docs: [
                { id: "p1", data: () => ({ name: "Batom", price: 5000 }) },
                { id: "p2", data: () => ({ name: "Base", price: 9000 }) },
            ],
        });

        const result = await findAllProducts();

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ id: "p1", name: "Batom" });
        expect(mockGetDocs).toHaveBeenCalled();
    });

    it("findAllProducts deve lançar erro amigável quando falhar", async () => {
        mockGetDocs.mockRejectedValue(new Error("firestore down"));

        await expect(findAllProducts()).rejects.toThrow(
            "Não foi possível carregar os produtos de maquiagem.",
        );
    });

    it("findProductById deve retornar produto quando existe", async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            id: "p1",
            data: () => ({ name: "Paleta Glam", price: 15000 }),
        });

        const result = await findProductById("p1");

        expect(result).toMatchObject({ id: "p1", name: "Paleta Glam" });
    });

    it("findProductById deve lançar erro quando produto não existe", async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => false,
        });

        await expect(findProductById("inexistente")).rejects.toThrow(
            "Produto não encontrado.",
        );
    });
});
