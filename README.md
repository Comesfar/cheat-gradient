# 🌈 CheatGradient

<div align="center">

![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)
![Manifest](https://img.shields.io/badge/Chrome_Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-XenForo%202.x-orange.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Release-success.svg?style=for-the-badge)

**CheatGlobal ve tüm XenForo forumlarında rengarenk, akıcı gradyanlı ve gökkuşağı efektli yazılar oluşturmanızı sağlayan açık kaynaklı Chromium tarayıcı eklentisi.**

[Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım Rehberi](#-kullanım-rehberi) • [Hazır Paletler](#-hazır-renk-paletleri) • [Ekran Görüntüleri](#-ekran-görüntüleri)

</div>

---

## ✦ Genel Bakış

**CheatGradient**, XenForo altyapısını kullanan forumlarda (başta CheatGlobal olmak üzere) konu başlıklarınızı, duyurularınızı ve profil imzalarınızı harf harf veya kelime kelime rengarenk yapmanızı sağlar.

Forumun zengin metin editörüne (Froala) doğrudan entegre olur. Metni yapıştırdığınız anda seçtiğiniz renk paletiyle otomatik olarak renklendirip **doğrudan mesaj alanına yazar**.

---

## ✨ Özellikler

- **⚡ Yapıştır ve Anında Yazdır:** Editördeki `🌈` butonuna basıp metninizi yapıştırdığınız an (`Ctrl + V`), metin anında seçtiğiniz gradyana dönüştürülüp forum mesaj kutusuna yazılır.
- **🌈 İki Farklı Geçiş Modu:**
  - **Karakter Bazlı (Akıcı Gradyan):** Harften harfe pürüzsüz RGB interpolasyonu (Cyberpunk / Neon başlıklar için).
  - **Kelime Bazlı (Blok Renkler):** Her kelimeye sırayla farklı renk ataması (İmza ve teşekkür metinleri için).
- **🎨 Zengin Hazır Palet Koleksiyonu:** Cyberpunk, CG Vibe, Gökkuşağı, Sunset, Altın/Gold, Neon Mor, Buz & Ateş, Venom.
- **🛠️ Özel Renk Paleti:** 2 ile 7 arasında dilediğiniz renk durağını ekleyip çıkarabilir, kendi özel renk geçişinizi tasarlayabilirsiniz.
- **✨ Akıllı Seçim Rozeti:** Editörde fareyle bir metni seçtiğiniz anda üzerinde beliren **"🌈 Gradyan Yap"** butonuna basarak metni anında dönüştürebilirsiniz.
- **🛡️ Optimize XenForo BBCode:** Boşlukları ziyan etmeyen, karakter sınırını doldurmayan temiz ve hafif `[COLOR=#HEX]` çıktısı üretir.
- **🌐 Bağımsız Web Sürümü (`generator.html`):** Eklenti kurmadan da doğrudan herhangi bir tarayıcıda çift tıklanarak kullanılabilir.

---

## 🎨 Hazır Renk Paletleri

| Palet Adı | Renk Geçişi | Önizleme Hissi |
| :--- | :--- | :--- |
| **Cyberpunk** | `#FF007F` → `#7928CA` → `#00F0FF` | Neon Pembe, Mor ve Camgöbeği |
| **CG Vibe** | `#FF2A55` → `#FFAA00` → `#00FFCC` | CheatGlobal Turuncusu & Turkuaz |
| **Gökkuşağı** | `#FF0055` → `#FFAA00` → `#00FF66` → `#00C3FF` → `#A855F7` | 5 Renkli Canlı Rainbow |
| **Sunset** | `#FF416C` → `#FF4B2B` | Sıcak Günbatımı & Ateş |
| **Altın / Gold** | `#FFD700` → `#F59F00` → `#E65100` | Parlak VIP Altın Sarısı |
| **Neon Mor** | `#D946EF` → `#8B5CF6` → `#3B82F6` | Fütüristik Mor & Mavi Sis |
| **Buz & Ateş** | `#00F5D4` → `#7B2CBF` → `#F72585` | Soğuk Turkuazdan Canlı Fuşyaya |
| **Venom** | `#00FF87` → `#60EFFF` | Parlak Matrix Yeşili & Açık Mavi |

---

## 🚀 Kurulum

Eklentiyi Chromium tabanlı tüm tarayıcılarda (Google Chrome, Brave, Microsoft Edge, Opera vb.) kullanabilirsiniz:

1. Bu depoyu indirin (`Code` → `Download ZIP` veya `git clone`).
2. ZIP dosyasını klasöre çıkartın.
3. Tarayıcınızın eklentiler sayfasını açın:
   - **Google Chrome / Brave:** `chrome://extensions`
   - **Microsoft Edge:** `edge://extensions`
4. Sayfanın sağ üst köşesindeki **"Geliştirici modu" (Developer mode)** anahtarını aktif hale getirin.
5. Sol üstteki **"Paketlenmemiş öğe yükle" (Load unpacked)** butonuna tıklayın.
6. İndirdiğiniz `cheat-gradient` klasörünü seçin.
7. Kurulum tamamlandı! Tarayıcı araç çubuğunuzda ve CheatGlobal editöründe `🌈` ikonu belirecektir.

---

## 📖 Kullanım Rehberi

### Yöntem 1: Forum Editöründen Doğrudan Kullanım (En Hızlı)
1. CheatGlobal'da herhangi bir konunun veya yorumun yazma alanına gelin.
2. Editör araç çubuğundaki **🌈** butonuna tıklayın.
3. Açılan popup kutusuna metninizi `Ctrl + V` ile yapıştırın.
4. Metniniz otomatik olarak renklendirilip mesaj alanına eklenecektir!

### Yöntem 2: Yazılmış Metni Seçerek Renklendirme
1. Editörde renklendirmek istediğiniz cümleyi fareyle seçin.
2. Üzerinde beliren **"🌈 Gradyan Yap"** butonuna tıklayın.
3. İstediğiniz renk paletini seçip **"✨ Editöre Yazdır"** butonuna tıklayın.

### Yöntem 3: Tarayıcı Menüsünden / Bağımsız
1. Tarayıcı simgelerinden **CheatGradient** simgesine tıklayın.
2. Metninizi yazın, renklerinizi seçin ve **"BBCode Kopyala"** butonuna basın.
3. Foruma gidip dilediğiniz yere yapıştırın.

---

## 📂 Dosya Yapısı

```
cheat-gradient/
├── manifest.json              # Chrome Manifest V3 konfigürasyonu
├── generator.html             # Bağımsız web tarayıcı arayüzü
├── icons/                     # 16, 48, 128px eklenti ikonları
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # Eklenti butonuna tıklandığında açılan arayüz
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                   # CheatGlobal editörüne entegre olan içerik scriptleri
│   ├── content.js
│   └── content.css
├── background/                # Arka plan servis çalışanı ve sağ tık menüsü
│   └── service_worker.js
├── LICENSE                    # MIT Lisansı
└── README.md                  # Proje dökümantasyonu
```

---

## 🤝 Katkıda Bulunma

Hata bildirimleri, yeni renk paleti önerileri ve katkılar için Pull Request açabilirsiniz!

1. Bu depoyu Fork'layın (`Fork`).
2. Kendi özellik dalınızı oluşturun (`git checkout -b feature/YeniPalet`).
3. Değişikliklerinizi commit'leyin (`git commit -m 'Yeni renk paleti eklendi'`).
4. Dalınıza push yapın (`git push origin feature/YeniPalet`).
5. Bir Pull Request açın.

---

## 📜 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

<div align="center">

Made with ❤ for the **CheatGlobal Community**

</div>
