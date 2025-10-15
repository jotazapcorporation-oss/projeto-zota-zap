import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      console.error('Missing userId in request')
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching subscription info for userId:', userId)

    // Get webhook credentials from secrets
    const username = Deno.env.get('WEBHOOK_USERNAME')
    const password = Deno.env.get('WEBHOOK_PASSWORD')

    if (!username || !password) {
      console.error('Missing webhook credentials')
      return new Response(
        JSON.stringify({ error: 'Webhook credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Basic Auth credentials
    const credentials = btoa(`${username}:${password}`)
    console.log('Calling webhook with credentials')

    // Call the external webhook
    const response = await fetch('https://webhook.jzap.net/webhook/assinatura/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        userId: userId
      })
    })

    console.log('Webhook response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook error response:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription info from webhook', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Webhook response data:', JSON.stringify(data))

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-subscription-info function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
