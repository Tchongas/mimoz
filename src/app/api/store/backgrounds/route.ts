// ============================================
// Tapresente - Card Backgrounds API
// ============================================
// GET - Fetch available backgrounds for custom cards

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const category = searchParams.get('category');

    // Get default backgrounds
    let defaultQuery = supabase
      .from('default_card_backgrounds')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (category && category !== 'all') {
      defaultQuery = defaultQuery.eq('category', category);
    }

    const { data: defaultBackgrounds, error: defaultError } = await defaultQuery;

    if (defaultError) {
      console.error('Error fetching default backgrounds:', defaultError);
    }

    // Get business-specific backgrounds if businessId provided
    let businessBackgrounds: any[] = [];
    if (businessId) {
      const { data, error } = await supabase
        .from('custom_card_backgrounds')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        businessBackgrounds = data;
      }
    }

    return NextResponse.json({
      success: true,
      backgrounds: {
        default: defaultBackgrounds || [],
        business: businessBackgrounds,
      },
    });

  } catch (error) {
    console.error('Backgrounds API error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar fundos' },
      { status: 500 }
    );
  }
}
