import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Test endpoint
  const url = new URL(req.url)
  if (url.pathname.endsWith('/test')) {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    return new Response(
      JSON.stringify({ 
        message: 'Edge Function is working',
        hasOpenAIKey: !!openaiApiKey,
        openaiKeyLength: openaiApiKey ? openaiApiKey.length : 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    console.log('Edge Function started')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
    console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    console.log('Parsing request body...')
    const { type, data, prompt, schema } = await req.json()
    console.log('Request type:', type)

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('OpenAI API Key:', openaiApiKey ? 'Found' : 'Missing')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured', details: 'Please set OPENAI_API_KEY in Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare OpenAI request based on type
    let openaiRequest: any = {
      model: 'gpt-4o-mini',
      messages: [],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    }

    // Build system and user messages based on type
    if (type === 'price_optimization') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA fiyat optimizasyonu uzmanı bir AI\'sın. SADECE JSON döndür. Response format: {totalSavings: number, recommendations: [{id: string, productName: string, currentPrice: number, recommendedPrice: number, expectedImpact: "high"|"medium"|"low", rationale: string, estimatedRevenueIncrease: number, riskLevel: "low"|"medium"|"high"}], summary: {averagePriceIncrease: number, expectedRevenueIncrease: number, riskLevel: "low"|"medium"|"high"}}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else if (type === 'supplier_analysis') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA tedarikçi analizi uzmanı bir AI\'sın. SADECE JSON döndür. CRITICAL: "supplierId" ve "supplierName" alanlarında VERİLEN DEĞERLERİ TAM OLARAK kullan. Response format: {analysis: [{supplierId: string (must be exact ID from input), supplierName: string (must be exact name from input), overallScore: number, performance: {reliability: number, quality: number, communication: number, pricing: number, delivery: number}, strengths: string[], weaknesses: string[], recommendations: string[], riskLevel: "low"|"medium"|"high", marketPosition: "leader"|"competitive"|"follower", futureOutlook: "positive"|"stable"|"negative", costOptimization: {currentCost: number, suggestedCost: number, savings: number, negotiationTips: string[]}}]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else if (type === 'shipment_optimization') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA lojistik optimizasyonu uzmanı bir AI\'sın. SADECE JSON döndür. Response format: {totalSavings: number, recommendations: [{id: string, type: "carrier"|"timing"|"packaging"|"route"|"cost", title: string, description: string, currentValue: string|number, recommendedValue: string|number, savings: number, impact: "high"|"medium"|"low", implementation: string, timeline: string, risk: "low"|"medium"|"high"}], summary: {costReduction: number, timeReduction: number, efficiencyGain: number}}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else if (type === 'trend_analysis') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA için trend analisti bir AI\'sın. SADECE JSON döndür. Response format: {trend: "up"|"down"|"stable", forecast: string, insights: string[], monthlyPrediction: [{month: string, predicted: number}]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else if (type === 'inventory_analysis') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA stok yönetimi uzmanı bir AI\'sın. Ürünlerin stok seviyelerini analiz et ve acil aksiyon gerektiren ürünler için uyarılar oluştur. SADECE JSON döndür. CRITICAL: "product" alanında VERİLEN ÜRÜN İSİMLERİNİ TAM OLARAK kullan. "Ürün A", "Ürün B" gibi generic isimler ASLA kullanma! Response format: {alerts: [{product: string (must be exact product name from input), currentStock: number, daysLeft: number, urgency: "critical"|"high"|"medium"|"low", recommendedAction: string, recommendedQuantity: number}]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else if (type === 'marketing_suggestions') {
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen Amazon FBA pazarlama uzmanı bir AI\'sın. Ürünlere özel pazarlama stratejileri öner. SADECE JSON döndür. Response format: {suggestions: [{category: string, suggestions: string[], priority: "high"|"medium"|"low", expectedImpact: string}]}'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    } else {
      // Default chat
      openaiRequest.messages = [
        {
          role: 'system',
          content: 'Sen yardımcı bir AI asistanısın.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(openaiRequest)
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', details: errorData }),
        { status: openaiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('OpenAI response received, parsing...')
    const openaiData = await openaiResponse.json()
    console.log('OpenAI data:', JSON.stringify(openaiData).substring(0, 200))
    
    const content = openaiData.choices[0]?.message?.content
    if (!content) {
      console.error('No content in OpenAI response')
      return new Response(
        JSON.stringify({ error: 'No content in OpenAI response', openaiData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Parsing content...')
    const result = typeof content === 'string' ? JSON.parse(content) : content

    console.log('Returning successful response')
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
