// Email utility — uses EmailJS for order confirmations
// Configure via Admin Panel → Settings → Email

export async function sendOrderConfirmation({ order, settings, customerEmail, customerName }) {
  const serviceId = settings?.emailjs_service_id
  const templateId = settings?.emailjs_template_id
  const publicKey = settings?.emailjs_public_key

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured. Set up in Admin → Settings → Email.')
    return { success: false, error: 'EmailJS not configured' }
  }

  const itemsList = order.items.map(i => `${i.name} x${i.quantity} — ${settings.currency_symbol}${(i.price * i.quantity).toFixed(2)}`).join('\n')

  const templateParams = {
    to_name: customerName || 'Customer',
    to_email: customerEmail,
    order_number: order.order_number,
    order_date: new Date(order.created_at || Date.now()).toLocaleDateString(),
    items_list: itemsList,
    subtotal: `${settings.currency_symbol}${order.subtotal?.toFixed(2)}`,
    tax: `${settings.currency_symbol}${(order.tax || 0).toFixed(2)}`,
    total: `${settings.currency_symbol}${order.total?.toFixed(2)}`,
    payment_method: order.payment_method || 'N/A',
    roblox_username: order.roblox_username || 'N/A',
    site_name: settings.site_name || 'RobloxShop',
    admin_email: settings.admin_email || '',
  }

  try {
    const { default: emailjs } = await import('@emailjs/browser')
    await emailjs.send(serviceId, templateId, templateParams, publicKey)
    return { success: true }
  } catch (err) {
    console.error('Email send failed:', err)
    return { success: false, error: err.message }
  }
}
