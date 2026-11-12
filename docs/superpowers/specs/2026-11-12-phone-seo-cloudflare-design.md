# Z Grup İnşaat Telefon, SEO/GEO ve Cloudflare Tasarımı

## Amaç

Mevcut UI, içerik düzeni, görseller, renkler ve firma bilgileri korunacak. Telefon iletişimi tek numarada birleşecek, mevcut SEO/GEO altyapısı gerçek site verileriyle genişletilecek ve uygulama Cloudflare Workers üzerinde çalıştırılacak.

## Kapsam

### Telefon ve WhatsApp

- Görünen tek telefon: `+90 532 449 94 55`
- Telefon bağlantısı: `tel:+905324499455`
- WhatsApp bağlantısı: `https://wa.me/905324499455`
- İkincil telefon değeri boş olacak; ikincil telefon gösteren UI dalları kaldırılacak.
- Navbar, mobil menü, Hero, CTA, footer, iletişim alanı, sabit WhatsApp düğmesi ve yapılandırılmış veriler aynı numarayı kullanacak.
- Görünen telefon metinleri `whitespace-nowrap` ile satır bölünmesine karşı korunacak.
- Admin formundaki mevcut veri modeli korunacak; yeni ikincil iletişim alanı eklenmeyecek.

### SEO ve GEO

- Mevcut canonical, robots, sitemap, Open Graph ve Twitter metadata yapısı korunup eksikleri tamamlanacak.
- `Organization` ve `LocalBusiness` firma şemaları yalnız mevcut firma ayarlarını kullanacak.
- `Service`, `BreadcrumbList`, `FAQPage`, proje ve filo JSON-LD şemaları yalnız sayfada bulunan gerçek içerikten üretilecek.
- Yorum, puan, koordinat, açık adres veya yeni proje verisi üretilmeyecek.
- `/llms.txt` kısa site indeksi; `/llms-full.txt` mevcut hizmet, proje ve filo içeriğinin ayrıntılı metin görünümü olacak.
- `OAI-SearchBot` ve `OAI-AdsBot` robots kurallarında açıkça izinli olacak.
- Admin ve API yolları genel tarayıcılara kapalı kalacak.

### Cloudflare Workers

- Next.js dinamik route ve API desteği için OpenNext Cloudflare Workers adaptörü kullanılacak.
- Worker adı mevcut paket adıyla uyumlu `zgrupinsaat` olacak.
- Mevcut ortam değişkenleri veya secret değerleri dosyaya yazılmayacak; `.env`, `.dev.vars` ve kullanıcı dosyaları değiştirilmeyecek.
- Gerekli Cloudflare yapılandırma dosyaları repo içinde tutulacak.

## Doğrulama

- Eski telefon ve WhatsApp numaraları kaynakta taranacak.
- Lint, test ve production build çalıştırılacak.
- Cloudflare deploy sonrası `/`, `/api/health`, `/robots.txt`, `/sitemap.xml` ve `/llms.txt` HTTP `200` vermeli.
- Canlı HTML ve ilgili metin uçlarında eski telefon ile eski WhatsApp numarası bulunmamalı.
- UI değişmediği kaynak diff'i ve sayfa kontrolleriyle doğrulanacak.

## Git

- Önceden var olan `.gitignore` ve `data/admin-issue-status.json` değişiklikleri stage edilmeyecek.
- Uygulama değişiklikleri anlamlı tek commit ile `main` dalına pushlanacak.
