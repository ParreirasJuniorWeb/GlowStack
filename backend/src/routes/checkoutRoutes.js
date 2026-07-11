import "dotenv/config"; // 👈 Adicione este import no topo de cada arquivo de rotas que usa o Stripe
import { Router } from "express";
import { db } from "../config/firebaseAdmin.js";
import { stripe } from "../config/stripe.js"; // 👈 Importa a instância já configurada e segura

const router = Router();

router.post("/create-checkout-session", async (req, res) => {
  const { userId, items, couponCode } = req.body;

  // 🔥 ADICIONE ESTA LINHA PARA INSPECIONAR NO TERMINAL DO NODE:
  console.log(
    `🎫 Tentando aplicar o cupom no checkout: "${couponCode}" para o usuário ${userId}`,
  );

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Dados de requisição inválidos ou incompletos." });
  }

  try {
    const lineItems = [];

    for (const item of items) {
      const productRef = db.collection("products").doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({
          message: `Produto com ID ${item.productId} não foi encontrado.`,
        });
      }

      const productData = productDoc.data();

      if (productData.stock < item.quantity) {
        return res.status(400).json({
          message: `Estoque insuficiente para o produto: ${productData.name}. Restam apenas ${productData.stock} unidades.`,
        });
      }

      lineItems.push({
        price: productData.stripePriceId,
        quantity: item.quantity,
      });
    }

    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      // 🔥 ADICIONE ESTA LINHA: Habilita a caixinha de cupons oficial na tela do Stripe Checkout
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ["BR"] },
      metadata: { userId },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    };

    if (couponCode) {
      sessionConfig.discounts = [
        {
          coupon: couponCode.trim().toUpperCase(), // O código deve existir igual no painel do Stripe
        },
      ];
    }

    // 4. Cria a sessão com as configurações injetadas dinamicamente
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Erro no checkout com cupom:", error);
    // Se o cupom não existir no painel do Stripe, a API deles retornará um erro específico
    if (error.message.includes("No such coupon")) {
      return res.status(400).json({
        message: "O cupom informado é inválido no gateway de pagamento.",
      });
    }
    return res.status(500).json({
      message: "Erro interno do servidor ao processar o pagamento.",
    });
  }
  // } catch (error) {
  //   // ADICIONE ESSA LINHA PARA VER O ERRO EXATO NO TERMINAL DO NODE:
  //   console.error('❌ ERRO DETALHADO NO BACKEND:', error);

  //   return res.status(500).json({ message: 'Erro interno do servidor ao processar o pagamento.', error: error.message });
  // }
});

export default router;
