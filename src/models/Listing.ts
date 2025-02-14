import mongoose from 'mongoose';

export interface IListing {
  userId: string;
  tip: 'taşıyıcı' | 'mal_sahibi';
  nereden: string;
  nereye: string;
  detay: string;
  arac?: {
    tip: string;
    kapasite: string;
    ozellikler: string[];
    kasaTipi: string;
    frigoSicaklik?: string;
    tasmaOlcusu?: string;
    lashingKapasitesi?: string;
    rampaYuksekligi?: string;
    ekOzellikler: string[];
  };
  yukBilgisi?: {
    tip: string;
    miktar: string;
    gereklilikler: string[];
    uzunluk?: string;
    genislik?: string;
    yukseklik?: string;
    agirlik?: string;
    paketlemeTipi?: string;
    tehlikeliMadde: boolean;
    unKodu?: string;
    sicaklikIhtiyaci?: string;
    ozelTasimaGereklilikleri: string[];
  };
  iletisim: string;
  fiyat: {
    miktar: number;
    birim: string;
  };
  yuklemeTarihi: Date;
  teslimatTarihi: Date;
  durum: 'aktif' | 'eşleşti' | 'tamamlandı' | 'iptal';
  createdAt: Date;
  eslesmisKullanici?: string;
  eslesmeTarihi?: Date;
  tamamlanmaTarihi?: Date;
  basvuranlar: string[]; // Başvuran kullanıcıların ID'leri
}

const listingSchema = new mongoose.Schema<IListing>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  tip: {
    type: String,
    required: true,
    enum: ['taşıyıcı', 'mal_sahibi']
  },
  nereden: {
    type: String,
    required: true
  },
  nereye: {
    type: String,
    required: true
  },
  detay: {
    type: String,
    required: true
  },
  arac: {
    tip: String,
    kapasite: String,
    ozellikler: [String],
    kasaTipi: String,
    frigoSicaklik: String,
    tasmaOlcusu: String,
    lashingKapasitesi: String,
    rampaYuksekligi: String,
    ekOzellikler: [String]
  },
  yukBilgisi: {
    tip: String,
    miktar: String,
    gereklilikler: [String],
    uzunluk: String,
    genislik: String,
    yukseklik: String,
    agirlik: String,
    paketlemeTipi: String,
    tehlikeliMadde: Boolean,
    unKodu: String,
    sicaklikIhtiyaci: String,
    ozelTasimaGereklilikleri: [String]
  },
  iletisim: {
    type: String,
    required: true
  },
  fiyat: {
    miktar: {
      type: Number,
      required: true
    },
    birim: {
      type: String,
      required: true,
      default: 'TL'
    }
  },
  yuklemeTarihi: {
    type: Date,
    required: true
  },
  teslimatTarihi: {
    type: Date,
    required: true
  },
  durum: {
    type: String,
    required: true,
    enum: ['aktif', 'eşleşti', 'tamamlandı', 'iptal'],
    default: 'aktif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  eslesmisKullanici: {
    type: String,
    ref: 'User'
  },
  eslesmeTarihi: Date,
  tamamlanmaTarihi: Date,
  basvuranlar: [{
    type: String,
    ref: 'User'
  }]
});

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', listingSchema); 