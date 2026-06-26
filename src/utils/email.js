/**
 * Email utility — uses EmailJS v4 for order confirmations
 * Configure keys via Admin Panel → Settings → Email
 *
 * EmailJS v4 breaking change: 4th arg must be { publicKey: '...' } not a plain string
 */

export async function sendOrderConfirmation({ order, settings, customerEmail, customerName }) {
  // Pull keys from settings object (flat key→value map from DB)
  const serviceId  = settings?.emailjs_service_id  || ''
  const templateId = settings?.emailjs_template_id || ''
  const publicKey  = settings?.emailjs_public_key  || ''
  const currency   = settings?.currency_symbol     || '$'
  const siteName   = settings?.site_name           || 'VoidEnterprises'
  const adminEmail = settings?.admin_email         || ''

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Not configured — set Service ID, Template ID and Public Key in Admin → Settings → Email')
    return { success: false, error: 'EmailJS credentials not configured' }
  }

  // Safely coerce Supabase numeric strings → numbers before calling .toFixed()
  const subtotal = parseFloat(order.subtotal  ?? 0)
  const tax      = parseFloat(order.tax       ?? 0)
  const total    = parseFloat(order.total     ?? 0)

  // Safely handle items — Supabase returns jsonb as parsed objects
  const items = Array.isArray(order.items) ? order.items : []
  const itemsList = items.length > 0
    ? items.map(i => `${i.name} x${i.quantity} — ${currency}${(parseFloat(i.price) * i.quantity).toFixed(2)}`).join('\n')
    : 'No items'

  const templateParams = {
    to_name:         customerName || 'Customer',
    to_email:        customerEmail || '',
    order_number:    order.order_number || '',
    order_date:      new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    items_list:      itemsList,
    subtotal:        `${currency}${subtotal.toFixed(2)}`,
    tax:             `${currency}${tax.toFixed(2)}`,
    total:           `${currency}${total.toFixed(2)}`,
    payment_method:  order.payment_method || 'N/A',
    roblox_username: order.roblox_username || 'N/A',
    site_name:       siteName,
    support_email:   'support@voidenterprises.xyz',
    // reply_to makes admin replies go to customer
    reply_to:        customerEmail || '',
  }

  try {
    // Dynamic import to avoid SSR issues
    const emailjs = await import('@emailjs/browser')

    // EmailJS v4 requires { publicKey } object as 4th arg — NOT a plain string
    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      { publicKey }           // ← this was the primary bug (was passing string directly)
    )

    console.log('[EmailJS] Sent successfully:', result.status, result.text)
    return { success: true }
  } catch (err) {
    // Provide a clear error message for common EmailJS errors
    let message = err?.text || err?.message || String(err)
    if (message.includes('Invalid public key')) {
      message = 'Invalid EmailJS Public Key — check Admin → Settings → Email'
    } else if (message.includes('The service ID')) {
      message = 'Invalid EmailJS Service ID — check Admin → Settings → Email'
    } else if (message.includes('The template ID')) {
      message = 'Invalid EmailJS Template ID — check Admin → Settings → Email'
    } else if (message.includes('limit rate')) {
      message = 'EmailJS rate limit hit — free plan allows 200 emails/month'
    }
    console.error('[EmailJS] Send failed:', message, err)
    return { success: false, error: message }
  }
}
