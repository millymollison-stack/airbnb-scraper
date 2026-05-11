
const Stripe = require("stripe");
const stripe = new Stripe("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");
async function main() {
  const plans = [
    { name: "Starter Plan - $10/month", amount: 1000, nickname: "starter", planKey: "starter" },
    { name: "Professional Plan - $30/month", amount: 3000, nickname: "pro", planKey: "pro" },
    { name: "Agency Plan - $150/month", amount: 15000, nickname: "agency", planKey: "agency" },
  ];
  for (const p of plans) {
    const prod = await stripe.products.create({ name: p.name, metadata: { planKey: p.planKey } });
    const price = await stripe.prices.create({
      unit_amount: p.amount,
      currency: "usd",
      recurring: { interval: "month" },
      product: prod.id,
    });
    console.log(p.planKey + ": " + price.id);
  }
}
main().catch(e => console.error("ERROR:", e.message));
