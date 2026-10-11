(async () => {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error('US PayPal authentication failed. Check the selected US merchant app credentials.');
  const invoices = await fetch('https://api-m.sandbox.paypal.com/v2/invoicing/invoices?page_size=1', { headers: { Authorization: 'Bearer ' + data.access_token }, signal: AbortSignal.timeout(20000) });
  console.log(JSON.stringify({ authenticated: true, invoicingScope: data.scope?.includes('invoicing'), invoiceReadStatus: invoices.status, payoutsScope: data.scope?.includes('https://uri.paypal.com/payments/payouts'), merchant: process.env.PAYPAL_BUSINESS_EMAIL, separateDatabase: process.env.CREATORPAY_DB_PATH }));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
