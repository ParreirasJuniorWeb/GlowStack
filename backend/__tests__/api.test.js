import request from "supertest";
import { jest } from "@jest/globals";
import { createApp } from "../src/appFactory.js";

const buildDbMock = () => {
  const productsMap = new Map();
  const ordersSetCalls = [];
  const cartDeleteCalls = [];

  const makeProductDocRef = (id) => ({
    id,
    get: async () => {
      const data = productsMap.get(id);
      if (!data) return { exists: false, data: () => null };
      return { exists: true, id, data: () => data };
    },
  });

  const db = {
    __setProduct: (id, data) => productsMap.set(id, data),
    __ordersSetCalls: ordersSetCalls,
    __cartDeleteCalls: cartDeleteCalls,
    collection: (name) => {
      if (name === "products") {
        return {
          doc: (id) => makeProductDocRef(id),
          where: () => ({
            get: async () => ({
              empty: false,
              docs: [
                {
                  id: "prod-1",
                  data: () => ({
                    name: "Batom Ruby",
                    stock: 10,
                    stripePriceId: "price_123",
                    images: ["thumb.jpg"],
                  }),
                  ref: { id: "prod-1" },
                },
              ],
            }),
          }),
        };
      }

      if (name === "orders") {
        return {
          doc: () => ({ id: "order-1" }),
        };
      }

      if (name === "carts") {
        return {
          doc: (id) => ({ id }),
        };
      }

      return {
        doc: () => ({ id: "unknown" }),
      };
    },
    runTransaction: async (fn) => {
      const transaction = {
        update: jest.fn(),
        set: (ref, data) => ordersSetCalls.push({ ref, data }),
        delete: (ref) => cartDeleteCalls.push(ref),
      };
      await fn(transaction);
    },
  };

  return db;
};

const buildStripeMock = () => ({
  webhooks: {
    constructEvent: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
      listLineItems: jest.fn(),
    },
  },
});

describe("GlowStack API", () => {
  test("POST /create-checkout-session -> 400 com payload inválido", async () => {
    const dbMock = buildDbMock();
    const stripeMock = buildStripeMock();
    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app).post("/create-checkout-session").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Dados de requisição inválidos/i);
  });

  test("POST /create-checkout-session -> 404 quando produto não existe", async () => {
    const dbMock = buildDbMock();
    const stripeMock = buildStripeMock();
    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({
        userId: "user-1",
        items: [{ productId: "inexistente", quantity: 1 }],
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/não foi encontrado/i);
  });

  test("POST /create-checkout-session -> 400 quando estoque insuficiente", async () => {
    const dbMock = buildDbMock();
    dbMock.__setProduct("prod-low", {
      name: "Base Glow",
      stock: 1,
      stripePriceId: "price_low",
    });

    const stripeMock = buildStripeMock();
    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({
        userId: "user-1",
        items: [{ productId: "prod-low", quantity: 2 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Estoque insuficiente/i);
  });

  test("POST /create-checkout-session -> 200 com URL de checkout", async () => {
    const dbMock = buildDbMock();
    dbMock.__setProduct("prod-ok", {
      name: "Pó Translúcido",
      stock: 5,
      stripePriceId: "price_ok",
    });

    const stripeMock = buildStripeMock();
    stripeMock.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session/test",
    });

    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({
        userId: "user-1",
        items: [{ productId: "prod-ok", quantity: 1 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.url).toContain("checkout.stripe.com");
  });

  test("POST /webhook -> 400 com assinatura inválida", async () => {
    const dbMock = buildDbMock();
    const stripeMock = buildStripeMock();
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app)
      .post("/webhook")
      .set("stripe-signature", "bad-signature")
      .set("Content-Type", "application/json")
      .send("{}");

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Webhook Error/i);
  });

  test("POST /webhook -> 200 quando evento é aceito", async () => {
    const dbMock = buildDbMock();
    const stripeMock = buildStripeMock();

    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          amount_total: 12990,
          metadata: { userId: "user-1" },
          shipping_details: {
            address: {
              city: "São Paulo",
              country: "BR",
              line1: "Rua Teste, 123",
              postal_code: "01000-000",
              state: "SP",
            },
          },
        },
      },
    });

    stripeMock.checkout.sessions.listLineItems.mockResolvedValue({
      data: [
        {
          price: { id: "price_123" },
          quantity: 1,
          amount_total: 12990,
        },
      ],
    });

    const app = createApp({ db: dbMock, stripe: stripeMock });

    const res = await request(app)
      .post("/webhook")
      .set("stripe-signature", "valid-signature")
      .set("Content-Type", "application/json")
      .send("{}");

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
