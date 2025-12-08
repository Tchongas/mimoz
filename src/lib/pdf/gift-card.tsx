// ============================================
// MIMOZ - Gift Card PDF Template
// ============================================
// Generates a printable PDF gift card using @react-pdf/renderer

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts (using system fonts for now)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

export interface GiftCardPDFData {
  code: string;
  amount: number;
  amountFormatted: string;
  expiresAt: string;
  businessName: string;
  businessSlug: string;
  templateName: string;
  cardColor: string;
  recipientName: string;
  purchaserName?: string;
  message?: string;
  qrCodeDataUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: 32,
    alignItems: 'center',
  },
  cardHeaderLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardHeaderAmount: {
    fontSize: 48,
    fontWeight: 700,
    color: 'white',
  },
  cardHeaderBusiness: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  codeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 600,
    color: 'white',
    letterSpacing: 3,
    fontFamily: 'Courier',
  },
  cardBody: {
    padding: 24,
    backgroundColor: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#0f172a',
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
  },
  messageText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  messageAuthor: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  instructions: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 400,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 10,
    fontWeight: 600,
    color: 'white',
  },
  instructionText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 1.4,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export function GiftCardPDF({ data }: { data: GiftCardPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Gift Card */}
          <View style={styles.card}>
            {/* Header with color */}
            <View style={[styles.cardHeader, { backgroundColor: data.cardColor }]}>
              {/* Decorative circles */}
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              
              <Text style={styles.cardHeaderLabel}>Vale-Presente</Text>
              <Text style={styles.cardHeaderAmount}>{data.amountFormatted}</Text>
              <Text style={styles.cardHeaderBusiness}>{data.businessName}</Text>
              
              {/* Code */}
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{data.code}</Text>
              </View>
            </View>
            
            {/* Body */}
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoLabel}>Para</Text>
                  <Text style={styles.infoValue}>{data.recipientName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.infoLabel}>Válido até</Text>
                  <Text style={styles.infoValue}>{data.expiresAt}</Text>
                </View>
              </View>
              
              {data.purchaserName && (
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <View>
                    <Text style={styles.infoLabel}>De</Text>
                    <Text style={styles.infoValue}>{data.purchaserName}</Text>
                  </View>
                </View>
              )}
              
              {data.message && (
                <View style={[styles.messageBox, { borderLeftColor: data.cardColor }]}>
                  <Text style={styles.messageText}>"{data.message}"</Text>
                  {data.purchaserName && (
                    <Text style={styles.messageAuthor}>— {data.purchaserName}</Text>
                  )}
                </View>
              )}
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Apresente este código no caixa de {data.businessName}
              </Text>
            </View>
          </View>
          
          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Como usar seu vale-presente</Text>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Vá até qualquer unidade {data.businessName}
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Apresente o código {data.code} no caixa
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                O valor será descontado da sua compra. Se sobrar saldo, ele fica disponível para próximas compras.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
