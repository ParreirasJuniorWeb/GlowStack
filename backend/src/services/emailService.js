import 'dotenv/config'; // 👈 Adicione este import no topo de cada arquivo de rotas
import nodemailer from 'nodemailer';

// Configuração do transportador SMTP (Substitua com suas credenciais de produção ou de testes)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io', // Exemplo com Mailtrap para testes
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Função para formatar centavos em Real (BRL) dentro do Node
const formatBRL = (valueInCents) => {
  return (valueInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const sendOrderConfirmationEmail = async (customerEmail, customerName, orderData) => {
  // Monta as linhas da tabela de produtos dinamicamente
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-b: 1px solid #f3f4f6; text-align: left;">
        <span style="font-weight: 700; color: #111827; font-size: 14px;">${item.name}</span>
        <br />
        <span style="color: #6b7280; font-size: 12px;">Qtd: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-b: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">
        ${formatBRL(item.priceAtPurchase * item.quantity)}
      </td>
    </tr>
  `).join('');

  // Template HTML do E-mail customizado com a identidade visual da GlowStack
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Seu pedido na GlowStack foi confirmado! ✨</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #f3f4f6;">
        
        <!-- Topo / Branding -->
        <div style="background: linear-gradient(to right, #db2777, #f43f5e); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.05em;">Glow<span style="opacity: 0.8;">Stack</span></h1>
          <p style="color: #ffe4e6; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Sua melhor versão, em um clique.</p>
        </div>

        <!-- Corpo do E-mail -->
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 20px; font-weight: 800;">Olá, ${customerName}! 👋</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
            Excelentes escolhas! O seu pagamento foi confirmado pelo Stripe e já estamos preparando o seu pacote de maquiagens com muito carinho. Segue abaixo o resumo da sua compra:
          </p>

          <!-- Tabela de Produtos -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="padding-bottom: 8px; border-b: 2px solid #e5e7eb; text-align: left; color: #9ca3af; font-size: 11px; text-transform: uppercase; font-weight: 700;">Produtos</th>
                <th style="padding-bottom: 8px; border-b: 2px solid #e5e7eb; text-align: right; color: #9ca3af; font-size: 11px; text-transform: uppercase; font-weight: 700;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totalizador -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: 700; color: #374151;">Valor Total Pago:</span>
              <span style="font-size: 18px; font-weight: 900; color: #db2777; text-align: right; display: block; width: 100%;">${formatBRL(orderData.totalAmount)}</span>
            </div>
          </div>

          <!-- Endereço de Entrega -->
          <div style="margin-bottom: 32px;">
            <h4 style="color: #111827; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Endereço de Entrega</h4>
            <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">
              ${orderData.shippingAddress.line1}<br />
              ${orderData.shippingAddress.city} - ${orderData.shippingAddress.state}<br />
              CEP: ${orderData.shippingAddress.postalCode}
            </p>
          </div>

          <!-- Botão de Ação -->
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; background: linear-gradient(to right, #db2777, #f43f5e); color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.2);">
              Acompanhar Meus Pedidos
            </a>
          </div>
        </div>

        <!-- Rodapé -->
        <div style="background-color: #f9fafb; border-t: 1px solid #f3f4f6; padding: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            Este é um e-mail automático enviado pela GlowStack Ltd.<br />
            Precisa de ajuda com suas maquiagens? Entre em contato via suporte@glowstack.com
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"GlowStack Maquiagens" <nao-responda@glowstack.com>',
      to: customerEmail,
      subject: 'Seu pedido de beleza está confirmado! ✨🛍️',
      html: emailHtml,
    });
    console.log(`✉️ E-mail de confirmação enviado com sucesso para: ${customerEmail}`);
  } catch (error) {
    console.error('❌ Falha ao disparar e-mail de confirmação:', error);
    // Não barramos a execução do webhook se o e-mail falhar, para manter a integridade do pedido
  }
};
