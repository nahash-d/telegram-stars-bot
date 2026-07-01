require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in environment variables');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const PRODUCTS = {
  stars_50: {
    title: 'Пакет 50 Stars',
    description: 'Цифровой товар за 50 Telegram Stars',
    amount: 50,
    payload: 'product_stars_50',
    label: '50 Stars',
  },
  stars_200: {
    title: 'Пакет 200 Stars',
    description: 'Цифровой товар за 200 Telegram Stars',
    amount: 200,
    payload: 'product_stars_200',
    label: '200 Stars',
  },
  stars_500: {
    title: 'Пакет 500 Stars',
    description: 'Цифровой товар за 500 Telegram Stars',
    amount: 500,
    payload: 'product_stars_500',
    label: '500 Stars',
  },
};

function buyKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐ 50 Stars', 'buy_50'),
      Markup.button.callback('⭐ 200 Stars', 'buy_200'),
      Markup.button.callback('⭐ 500 Stars', 'buy_500'),
    ],
  ]);
}

async function sendInvoice(ctx, productKey) {
  const product = PRODUCTS[productKey];

  await ctx.replyWithInvoice({
    title: product.title,
    description: product.description,
    payload: product.payload,
    provider_token: '',
    currency: 'XTR',
    prices: [
      {
        label: product.label,
        amount: product.amount,
      },
    ],
  });
}

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет! Выберите один из пакетов оплаты через Telegram Stars:',
    buyKeyboard()
  );
});

bot.command('buy', async (ctx) => {
  await ctx.reply('Выберите пакет:', buyKeyboard());
});

bot.action('buy_50', async (ctx) => {
  await ctx.answerCbQuery();
  await sendInvoice(ctx, 'stars_50');
});

bot.action('buy_200', async (ctx) => {
  await ctx.answerCbQuery();
  await sendInvoice(ctx, 'stars_200');
});

bot.action('buy_500', async (ctx) => {
  await ctx.answerCbQuery();
  await sendInvoice(ctx, 'stars_500');
});

bot.on('pre_checkout_query', async (ctx) => {
  try {
    await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    console.error('pre_checkout_query error:', error);
  }
});

bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;

  console.log('Payment success:', {
    user_id: ctx.from.id,
    username: ctx.from.username,
    amount: payment.total_amount,
    currency: payment.currency,
    payload: payment.invoice_payload,
    telegram_payment_charge_id: payment.telegram_payment_charge_id,
  });

  await ctx.reply(
    `✅ Оплата прошла успешно!\nСумма: ${payment.total_amount} ${payment.currency}\nСпасибо за покупку.`
  );
});

bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.launch().then(() => {
  console.log('Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
