// ============================================
// MIMOZ - Store Customization API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';

/**
 * PATCH /api/business/store-customization
 * Update store customization settings for the current business
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    // Determine which business to update
    let businessId = user.businessId;
    
    // Admins can update any business by passing business_id
    if (user.role === 'ADMIN' && body.business_id) {
      businessId = body.business_id;
    } else if (user.role !== 'BUSINESS_OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    } else if (!businessId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma empresa' },
        { status: 403 }
      );
    }

    // Define allowed fields for store customization
    const allowedFields = [
      // Header
      'header_bg_color',
      'header_text_color',
      'header_style',
      'show_header_contact',
      'logo_link_url',
      
      // Hero
      'hero_title',
      'hero_subtitle',
      'hero_bg_type',
      'hero_bg_color',
      'hero_bg_gradient_start',
      'hero_bg_gradient_end',
      'hero_bg_image_url',
      'hero_text_color',
      'hero_overlay_opacity',
      'hero_cta_text',
      'hero_cta_color',
      'show_hero_section',
      
      // Products
      'products_title',
      'products_bg_color',
      'products_layout',
      'products_columns',
      'show_product_description',
      'card_style',
      
      // Features
      'show_features_section',
      'features_title',
      'features_bg_color',
      'feature_1_icon',
      'feature_1_title',
      'feature_1_description',
      'feature_2_icon',
      'feature_2_title',
      'feature_2_description',
      'feature_3_icon',
      'feature_3_title',
      'feature_3_description',
      
      // Testimonials
      'show_testimonials_section',
      'testimonials_title',
      'testimonials_bg_color',
      
      // Footer
      'footer_bg_color',
      'footer_text_color',
      'footer_text',
      'show_footer_contact',
      'show_footer_social',
      'social_facebook',
      'social_instagram',
      'social_whatsapp',
      'whatsapp_number',
      
      // General
      'page_bg_color',
      'font_family',
      'border_radius',
      'favicon_url',
      'og_image_url',
      'meta_title',
      'meta_description',
    ];

    // Filter to only allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Validate some fields
    if (updateData.hero_overlay_opacity !== undefined) {
      const opacity = Number(updateData.hero_overlay_opacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 100) {
        return NextResponse.json(
          { error: 'Opacidade deve ser entre 0 e 100' },
          { status: 400 }
        );
      }
    }

    if (updateData.products_columns !== undefined) {
      const columns = Number(updateData.products_columns);
      if (isNaN(columns) || columns < 1 || columns > 4) {
        return NextResponse.json(
          { error: 'Número de colunas deve ser entre 1 e 4' },
          { status: 400 }
        );
      }
    }

    // Update the business
    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      console.error('Error updating store customization:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar configurações' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Configurações da loja atualizadas com sucesso' 
    });
  } catch (error) {
    console.error('Store customization error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
