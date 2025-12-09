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
      'hero_cta_url',
      'show_hero_section',
      
      // Header/Footer visibility
      'show_header',
      'show_footer',
      
      // Products
      'products_title',
      'products_subtitle',
      'products_bg_color',
      'products_layout',
      'products_columns',
      'show_product_description',
      'card_style',
      'products_section_enabled',
      
      // Section 1 (Intro/About)
      'section1_enabled',
      'section1_title',
      'section1_subtitle',
      'section1_content',
      'section1_bg_color',
      'section1_text_color',
      'section1_layout',
      'section1_image_url',
      'section1_cta_text',
      'section1_cta_url',
      'section1_cta_color',
      
      // Section 2 (Benefits/Features)
      'section2_enabled',
      'section2_type',
      'section2_title',
      'section2_subtitle',
      'section2_bg_color',
      'section2_text_color',
      'section2_item1_icon',
      'section2_item1_title',
      'section2_item1_description',
      'section2_item2_icon',
      'section2_item2_title',
      'section2_item2_description',
      'section2_item3_icon',
      'section2_item3_title',
      'section2_item3_description',
      'section2_item4_icon',
      'section2_item4_title',
      'section2_item4_description',
      
      // Section 3 (Additional content)
      'section3_enabled',
      'section3_type',
      'section3_title',
      'section3_subtitle',
      'section3_content',
      'section3_bg_color',
      'section3_text_color',
      'section3_image_url',
      'section3_cta_text',
      'section3_cta_url',
      
      // CTA Banner
      'cta_banner_enabled',
      'cta_banner_title',
      'cta_banner_subtitle',
      'cta_banner_button_text',
      'cta_banner_button_url',
      'cta_banner_bg_color',
      'cta_banner_text_color',
      
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
      
      // Custom gift cards
      'custom_cards_enabled',
      'custom_cards_min_amount_cents',
      'custom_cards_max_amount_cents',
      'custom_cards_preset_amounts',
      'custom_cards_allow_custom_amount',
      'custom_cards_section_title',
      'custom_cards_section_subtitle',
      'hide_template_cards',
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
