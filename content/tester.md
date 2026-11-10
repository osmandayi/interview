Aşağıda, tüm başlıkların yer aldığı revize edilmiş ve kopyalamaya hazır eksiksiz çalışma listesini bulabilirsin.

Örnekler, mülakatta THY'nin kendi sistemlerine dair ezberlenmiş bir yanıt gibi durmaması ve her türlü kurumsal projeye uygulanabilirliğini göstermek adına **e-ticaret, yayıncılık (streaming), dijital bankacılık ve kurumsal platformlar** gibi genel teknoloji senaryoları üzerinden güncellendi.

---

# 📚 THY Test Mühendisi Mülakat Hazırlık ve Çalışma Rehberi

## 1. Test Seviyeleri ve Türleri

### 1. Smoke Test (Duman Testi)

* **Kısa Tanım:** Yeni bir yazılım sürümü (build) test ortamına dağıtıldığında, uygulamanın çalışır durumda olup olmadığını ve en kritik temel fonksiyonların ayağa kalkıp kalkmadığını doğrulamak için koşturulan ilk ve en hızlı test paketidir. Amacı, bozuk bir build ile vakit kaybetmemektir.
* **Mülakat Örneği & Akış:** *"Bir e-ticaret uygulamasında yeni sürüm çıktığında; uygulamanın çökmeden açılması, ana sayfanın yüklenmesi ve ürün arama çubuğunun yanıt vermesi kontrol edilir. Eğer arama çubuğu çöküyorsa (Critical Bug), build'i anında reddedip geliştirici ekibe raporlarız ve acil fix çıkana kadar detaylı teste geçmeyiz."*

### 2. Sanity Test (Sağlamlık / Mantık Testi)

* **Kısa Tanım:** Bir hatanın düzeltilmesinden (bug fix) sonra, tüm sistemi test etmek yerine, sadece o hatanın çözüldüğünü ve ilgili modülün mantığının bozulmadığını hızlıca doğrulamak için yapılan dar kapsamlı testtir.
* **Mülakat Örneği & Akış:** *"Bir dijital bankacılık uygulamasında hesap hareketleri filtresinde tarih aralığı hatası düzeltildiyse; tüm uygulamayı regresyona sokmak yerine sadece tarih filtresinin doğru çalışıp çalışmadığını kontrol ederek Sanity test yapmış oluruz."*

### 3. Regression Test (Regresyon / Gerileme Testi)

* **Kısa Tanım:** Sisteme yeni bir özellik eklendiğinde veya altyapı değişikliği yapıldığında; bu değişimlerin önceden sorunsuz çalışan diğer modülleri bozup bozmadığını doğrulamak için yapılan kapsamlı testtir.
* **Mülakat Örneği & Akış:** *"Yayın platformunda kullanıcı profillerine 'Çocuk Modu' kuralı eklendikten sonra; önceden sorunsuz çalışan izleme geçmişi, ödeme yönetimi veya favori listesi gibi kritik akışların olumsuz etkilenmediğini otomasyon script'leri ile doğrulamamız Regresyon testidir."*

### 4. Integration Test (Entegrasyon Testi)

* **Kısa Tanım:** Farklı yazılım modüllerinin, mikroservislerin veya harici sistemlerin (ödeme gateway'leri, 3. parti API'ler) birbiriyle veri alışverişi yaparken doğru ve uyumlu çalışıp çalışmadığını doğrulayan test aşamasıdır.
* **Mülakat Örneği & Akış:** *"Kullanıcı bir pazaryeri uygulamasında sipariş verdiğinde; arayüzün (UI) ödeme servisiyle, ödeme servisinin kargo API'siyle ve faturalama veritabanıyla doğru haberleşip veri aktardığını Entegrasyon testi ile doğrularız."*

### 5. System Test (Sistem Testi)

* **Kısa Tanım:** Tüm modülleri ve entegrasyonları tamamlanmış uygulamanın, uçtan uca (End-to-End) sistem gereksinimlerine ve iş kurallarına tam uygunluk gösterip göstermediğini doğrulamak için yapılan kapsamlı testtir.
* **Mülakat Örneği & Akış:** *"Bir kullanıcının mobil sağlık uygulamasına kaydolması, doktor randevusu araması, randevuyu onaylayıp ödemesini yapması ve reçetesini görüntülemesine kadar giden tüm yaşam döngüsünü canlı ortam simülasyonunda test etmemiz System testidir."*

### 6. Acceptance Test / UAT (Kullanıcı Kabul Testi)

* **Kısa Tanım:** Canlıya (Production) çıkmadan önceki son aşamada, iş birimi veya ürün sahipleri (PO/Operasyon) tarafından, ürünün iş gereksinimlerini ve operasyonel beklentileri karşılayıp karşılamadığının onaylandığı testtir.
* **Mülakat Örneği & Akış:** *"Geliştirilen kupon/indirim modülü QA tarafından doğrulandıktan sonra, Pazarlama ve Satış ekibinin kullanımına açılır. İş birimi kendi gerçek iş senaryolarıyla test edip 'İş kurallarımıza uygundur' onayını verdiğinde UAT tamamlanır."*

### 7. Black-Box / White-Box Test (Kara Kutu / Beyaz Kutu Testleri)

* **Kısa Tanım:**
* **Black-Box:** Kod yapısını ve veritabanını görmeden, sadece arayüz üzerinden girdi verip beklenen çıktıyı gözlemleme testidir.
* **White-Box:** Kaynak kodun iç yapısını ve algoritmaları bilerek (genellikle birim/unit test seviyesinde) kod tabanı üzerinden yapılan testtir.


* **Mülakat Örneği & Akış:** *"Arama kutusuna ürün adı yazıp sonuçları görmek Black-Box testtir. Ancak arkadaki kodda yer alan arama algoritmasını veya string temizleme metodunu inceleyerek test yazmak White-Box testtir."*

### 8. Exploratory Testing (Keşif Testi)

* **Kısa Tanım:** Önceden yazılmış bir test senaryosu olmadan, test mühendisinin tecrübesi ve sezgileriyle sistemi anlık olarak deneyerek uç senaryolardaki (edge-case) hataları bulma sürecidir.
* **Mülakat Örneği & Akış:** *"Ödeme sayfasında 'Satın Al' butonuna tam basarken internet bağlantısını kesip tekrar bağlamak veya tarayıcının geri/ileri tuşlarına art arda basmak gibi senaryo dışı spontane yapılan testlerdir."*

### 9. Fonksiyonel Test (Functional Testing)

* **Kısa Tanım:** Yazılımın teknik özelliklerinden bağımsız olarak "ne yapması gerektiğine" odaklanan ve iş gereksinim dokümanına göre girdilerin doğru çıktıyı üretip üretmediğini doğrulayan temel testtir.
* **Mülakat Örneği & Akış:** *"Giriş yap ekranında 'Şifremi Unuttum' adımı kullanıldığında, kayıtlı e-postaya sıfırlama bağlantısının ulaşıp ulaşmadığını doğrulamak fonksiyonel testtir."*

### 10. Geliştirme Etki Analizi (Impact Analysis) & Etki Testi

* **Kısa Tanım:** Bir yazılım bileşeninde veya API'de yapılan kod değişikliğinin, sistemdeki hangi diğer modülleri ve kanalları (Web, Mobil) etkileyebileceğini önceden haritalandırıp test eforunu riski yüksek alanlara odaklama sürecidir.
* **Mülakat Örneği & Akış:** *"Kullanıcı adres doğrulama servisinde güncelleme yapıldıysa; bu servisi kullanan 'Teslimat Adresi', 'Fatura Oluşturma' ve 'Profilim' ekranlarının etkileneceğini belirleyip test odağını bu alanlara kaydırmamızdır."*

### 11. Etki Analizine Dayalı Regresyon / Smoke Test

* **Kısa Tanım:** Tüm sistemi baştan sona test etmek yerine, etki analizinin işaret ettiği riskli ve değişen alanlara özel olarak daraltılmış otomasyon/smoke paketlerini koşturma stratejisidir.
* **Mülakat Örneği & Akış:** *"Sadece sepet hesaplama servisi güncellendiyse, tüm platformu regresyona sokmak yerine etki analizinin gösterdiği sepet, indirim ve ödeme adımlarını kapsayan 20 senaryoluk daraltılmış bir regresyon paketi koşturarak zaman kazanırız."*

---

## 2. Test Yaşam Döngüsü ve Süreçleri

### 1. Test Planlama (Test Planning)

* **Kısa Tanım:** Projenin başında neyin test edileceğini, kullanılacak kaynakları (cihaz, ortam), test takvimini, kapsamı (In-Scope / Out-of-Scope) ve riskleri belirleyerek yazılı strateji oluşturma sürecidir.
* **Mülakat Örneği & Akış:** *"Yeni bir projede QA olarak 'Bu aşamada sadece Web uygulaması test edilecek, Mobil uygulama kapsam dışıdır (Out-of-Scope)' diyerek sınırları çizeriz ve Jira üzerinde test görevlerini takvimlendiririz."*

### 2. Test Case Yazımı (Test Senaryosu Oluşturma)

* **Kısa Tanım:** Yazılım gereksinimlerine dayanarak bir özelliğin doğrulanması için ön koşulların, adım adım test eylemlerinin ve beklenen çıktının (expected result) yazılı hale getirilmesidir.
* **Mülakat Örneği & Akış:** *"Giriş yap modülü için: Ön Koşul: Kullanıcının kayıtlı olması; Adımlar: 1. E-posta girilir, 2. Şifre girilir, 3. 'Giriş' butonuna basılır; Beklenen Çıktı: Kullanıcı profil sayfasının açılmasıdır."*

### 3. Test Case Execution (Test Senaryolarının Koşumu)

* **Kısa Tanım:** Test ortamına yüklenen özellikleri, hazırlanan test senaryolarına sadık kalarak manuel veya otomasyonla koşturup sonuçlarını (Pass / Fail / Blocked) test yönetim aracına kaydetme aşamasıdır.
* **Mülakat Örneği & Akış:** *"Yeni derleme Staging ortamına geçince test case'leri koşarız. Adım başarıyla tamamlanırsa 'Pass', hata verirse 'Fail' olarak işaretleyip hata kaydı açarız."*

### 4. Defect Life Cycle & Bug Management (Hata Yaşam Döngüsü)

* **Kısa Tanım:** Test sırasında bulunan hatanın raporlanmasından, geliştirici tarafından çözülüp tekrar test edilmesine (re-test) ve kapatılmasına (closed) kadar geçen sürecin yönetilmesidir.
* **Mülakat Örneği & Akış:** *"Bulunan hata Jira'da açılır (Status: New). Developer düzeltip ortama atar (Status: Fixed). Tekrar test edip hatanın düzeldiğini görünce kaydı kapatırız (Status: Closed). Düzelmediyse Re-open yapılır."*

### 5. Severity vs. Priority (Kritiklik vs. Öncelik)

* **Kısa Tanım:**
* **Severity (Kritiklik):** Hatanın teknik olarak sisteme ve koda verdiği zararın büyüklüğüdür (QA belirler).
* **Priority (Öncelik):** İş ve ürün yönetimi açısından hatanın ne kadar acil çözülmesi gerektiğidir (Product Owner belirler).


* **Mülakat Örneği & Akış:** *"Uygulama ana sayfasındaki şirket logosunun bozuk görünmesi Low Severity (sistem çalışır) ancak High Priority'dir (imaj açısından acil düzeltilmeli). Ödeme adımında uygulamanın çökmesi ise hem Critical Severity hem High Priority'dir."*

### 6. UAT (User Acceptance Testing / İş Birimi Kabul Testi) Süreci

* **Kısa Tanım:** QA teknik ve fonksiyonel testleri bitirdikten sonra, sistemin canlıya alınmadan önce iş ekipleri (PO, Finans, Operasyon) tarafından kendi iş senaryolarıyla doğrulanıp onaylandığı süreçtir.
* **Mülakat Örneği & Akış:** *"Fatura modülü geliştirildikten sonra, muhasebe operasyon ekibi UAT ortamında kendi örnek verileriyle işlem yapar ve 'Sistem iş kurallarımıza uygundur' onayını verdiğinde UAT tamamlanır."*

### 7. Sürüm Yönetimi (Release Management) & Test Ortamları

* **Kısa Tanım:** Yazılımın Dev ortamından QA/Staging ortamına ve oradan canlıya (Production) geçiş süreçlerinin ve bu süreçte kullanılan izole ortam yapılandırmalarının yönetilmesidir.
* **Mülakat Örneği & Akış:** *"Sürüm öncesi Staging (Ön-Canlı) ortamında tüm regresyon testleri tamamlanır, kesintiyi önlemek için düşük trafikli saatlerde sürüm canlıya geçirilir ve hemen ardından canlıda Smoke test yapılır."*

---

## 3. Web & Mobil Otomasyon Temelleri

### 1. Playwright

* **Kısa Tanım:** Modern web uygulamalarını test etmek için kullanılan, tarayıcılarla doğrudan WebSocket (CDP) protokolü üzerinden haberleşen, hızlı, kararlı ve paralel koşum odaklı yeni nesil otomasyon aracıdır.
* **Mülakat Örneği & Akış:** *"Dinamik ve asenkron yüklenen web arayüzlerinde Playwright tercih ederim. Otomatik bekleme (Auto-waiting) yeteneği sayesinde elementin tıklanabilir olmasını kendi bekler, bu da flaky testleri önler."*

### 2. Selenium

* **Kısa Tanım:** Tarayıcılardaki kullanıcı eylemlerini (click, sendKeys) otomatize eden, sektörde uzun yıllardır kullanılan standart web otomasyon kütüphanesidir.
* **Mülakat Örneği & Akış:** *"Web projelerinde Selenium WebDriver kullanarak tarayıcı sürücüleri üzerinden test çalıştırırım. Element yüklenme sürelerini yönetmek için explicit wait yapılarını kurgularım."*

### 3. Appium

* **Kısa Tanım:** Mobil uygulamaları (iOS ve Android) otomatize etmek için kullanılan, WebDriver protokolünü temel alan ve farklı platformlarda (XCUITest / UiAutomator2) ortak kodla test yazılmasını sağlayan araçtır.
* **Mülakat Örneği & Akış:** *"Appium, Selenium ile birebir aynı WebDriver mimarisine dayandığı için (element arama, click mantığı aynıdır) temel konseptine tamamen hakimim ve mobil otomasyon projelerine hızla adapte olabilirim."*

### 4. Page Object Model (POM)

* **Kısa Tanım:** Otomasyon projelerinde kod tekrarını önlemek ve bakımı kolaylaştırmak için sayfa elementlerini (locators) ile test senaryolarını birbirinden ayıran tasarım desenidir.
* **Mülakat Örneği & Akış:** *"Her sayfa için bir Page Class (örn: `LoginPage`) oluşturup elementleri ve aksiyonları orada tanımlarım. Test senaryosu sadece bu metodları çağırır; böylece arayüzde bir ID değiştiğinde sadece ilgili Page Class güncellenir."*

### 5. Flaky Test Yönetimi (Kararsız Testler)

* **Kısa Tanım:** Kodda hiçbir değişiklik olmadığı halde ağ gecikmeleri veya DOM'un geç yüklenmesi nedeniyle bazen geçip bazen kalan güvenilmez testlerdir.
* **Mülakat Örneği & Akış:** *"Verilerin API'den asenkron geldiği ekranlarda statik beklemeler (`Thread.sleep`) yerine **Explicit Wait** kullanırım veya network isteklerinin tamamlanmasını bekleyen (networkidle) stratejilerle testi kararlı hale getiririm."*

### 6. Element Lokasyon Stratejileri (Locator Strategies)

* **Kısa Tanım:** Otomasyon script'lerinin web veya mobil arayüzdeki elementleri benzersiz şekilde bulabilmesi için kullanılan ID, Name, CSS Selector, XPath veya Accessibility ID seçicileridir.
* **Mülakat Örneği & Akış:** *"Öncelikli olarak eşsiz ve performanslı olan `ID` veya `Accessibility ID` tercih ederim. Bunlar yoksa dinamik olmayan kararlı CSS Selector'ler kullanırım; kırılgan ve bakımı zor uzun XPath'lerden kaçınırım."*

---

## 4. API & Entegrasyon Testleri

### 1. RESTful API

* **Kısa Tanım:** İstemci ve sunucu arasında veri transferini hafif bir şekilde sağlamak için HTTP metodlarını (GET, POST, PUT, DELETE) ve genellikle JSON formatını kullanan modern mimaridir.
* **Mülakat Örneği & Akış:** *"Arama ekranında kullanıcı filtre seçtiğinde, ön yüz `POST /api/v1/products/search` endpoint'ine JSON gönderir. Dönen HTTP 200 OK yanıtı ve veri yapısı kontrol edilir."*

### 2. SOAP (Simple Object Access Protocol)

* **Kısa Tanım:** Veri transferi için katı kurallarla XML formatını ve WSDL sözleşme yapısını kullanan, yüksek güvenlik ve işlem bütünlüğü sağlayan kurumsal legacy servis protokolüdür.
* **Mülakat Örneği & Akış:** *"Bankacılık veya kurumsal ödeme entegrasyonlarında WSDL dokümanındaki kurallara uygun XML request gönderip, dönen XML response içerisindeki hata kodlarını ve onay bilgilerini doğrularız."*

### 3. Postman (İleri Seviye QA Kullanımı)

* **Kısa Tanım:** API isteklerini oluşturmak, test etmek ve otomatize etmek için kullanılan; içerisinde JavaScript ile assertion (doğrulama) yazılmasına imkan tanıyan API platformudur.
* **Mülakat Örneği & Akış:** *"Postman'de **Environment Variables** ile dinamik token'ları ve ortam adreslerini yönetirim. **Tests** sekmesine JS ile status kodu ve schema doğrulama kodları yazıp, koleksiyonları **Newman** ile CI/CD pipeline'ına bağlarım."*

### 4. HTTP Status Kodları

* **Kısa Tanım:** İstemcinin attığı HTTP isteğine karşılık sunucunun durumunu ve işlemin sonucunu ifade eden 3 haneli yanıt kodlarıdır.
* **Mülakat Örneği & Akış:** *"Test esnasında yanıt kodları doğrulanır:
* **200 OK / 201 Created:** İşlem başarılı.
* **400 Bad Request:** Hatalı/eksik parametre.
* **401 Unauthorized / 403 Forbidden:** Oturum yok veya yetkisiz erişim.
* **404 Not Found:** Endpoint/kaynak bulunamadı.
* **500 Internal Server Error:** Sunucu tarafında hata."*



### 5. Mocking (Servis Simülasyonu)

* **Kısa Tanım:** Test edilecek servisin veya harici sistemin henüz hazır olmadığı durumlarda sahte yanıtlar (fake response) üreterek testlerin kesintisiz devam etmesini sağlama tekniğidir.
* **Mülakat Örneği & Akış:** *"Gerçek ödeme pos servisine gitmek yerine Postman Mock Server veya WireMock kullanarak ödeme servisinin 'Başarılı (200 OK)' yanıtını taklit eder, kendi uygulamamızın akışını test ederiz."*

### 6. Servis-Kanal Etki Testleri (API/Channel Impact Testing)

* **Kısa Tanım:** Arka plandaki bir API'de yapılan değişikliklerin; web, mobil veya kiosk gibi farklı tüketici kanallarında (consumer) kırılmaya yol açıp açmadığının doğrulanmasıdır.
* **Mülakat Örneği & Akış:** *"Ürün detay API'sine yeni bir alan eklendiğinde; bu servisi tüketen hem Mobil uygulamanın hem Web portalının hatasız bir şekilde yeni veriyi render edip etmediğini doğrularız."*

---

## 5. CI/CD & DevOps Entegrasyonu

### 1. Jenkins

* **Kısa Tanım:** Otomasyon projelerini ve test süreçlerini belirli tetikleyicilere veya zamanlamalara göre sunucu üzerinde otomatik koşturan sürekli entegrasyon (CI) sunucusudur.
* **Mülakat Örneği & Akış:** *"Otomasyon testlerimizi Jenkins Pipeline olarak tanımlarız. Her gece saat 02:00'de veya ana koda yeni bir Merge Request açıldığında Jenkins otomatik uyanır, testleri headless modda koşturur."*

### 2. GitLab CI/CD

* **Kısa Tanım:** Kod deposu ile tam entegre çalışan, `.gitlab-ci.yml` dosyası aracılığıyla test ve canlıya alma adımlarını (pipeline stages) yöneten CI/CD aracıdır.
* **Mülakat Örneği & Akış:** *"Bir feature branch'ten master branch'e kod gönderildiğinde pipeline tetiklenir. `test` aşamasında otomasyon testleri çalışır; geçerse deployment'a onay verilir, kalırsa merge engellenir."*

### 3. Pipeline Otomasyon Tetiklemeleri (Pipeline Triggers)

* **Kısa Tanım:** Otomasyon testlerinin ne zaman ve hangi olay gerçekleştiğinde (kod gönderme, zamanlanmış görev, webhook vb.) başlatılacağını belirleyen tetikleme mekanizmalarıdır.
* **Mülakat Örneği & Akış:** *"Üç farklı tetikleme yapısı kullanırız: 1. **Commit Trigger:** Kod birleştirildiğinde koşan Smoke testler. 2. **Scheduled Trigger (CronJob):** Her gece koşan Regresyon testleri. 3. **Post-Deployment Trigger:** Ortama yeni paket yüklendiğinde koşan doğrulama testleri."*

### 4. Allure Raporlama (Allure Report)

* **Kısa Tanım:** Otomasyon testlerinin sonuçlarını, adımlarını, ekran görüntülerini ve hata loglarını görsel ve esnek bir web arayüzünde sunan raporlama kütüphanesidir.
* **Mülakat Örneği & Akış:** *"Test koşumu bittiğinde Allure Report çıktısı üretiriz. Hata alan testin raporunda hatanın oluştuğu andaki ekran görüntüsü (screenshot) ve hata logu yer alır, böylece kök neden analizi (RCA) hızlanır."*

---

## 6. Metodoloji ve Yaklaşımlar

### 1. Agile / Scrum Süreçleri

* **Kısa Tanım:** Yazılım geliştirme sürecini 1-3 haftalık kısa döngülere (Sprint) bölen, esnekliği ve cross-functional ekip çalışmasını esas alan metodolojidir.
* **Mülakat Örneği & Akış:** *"Scrum ekibinde QA olarak **Sprint Planning** sırasında maddelerin eforunu ve test edilebilirliğini değerlendirir, **Daily** toplantılarında test durumunu aktarır, **Retrospective** toplantısında test süreçlerinin iyileştirilmesine katkı sağlarım."*

### 2. BDD (Behavior-Driven Development) & Gherkin Syntax

* **Kısa Tanım:** İş ekipleri ve teknik ekipler arasındaki iletişimi ortak bir dilde buluşturmak için test senaryolarının `Given-When-Then` yapısıyla günlük dilde yazılması yaklaşımıdır.
* **Mülakat Örneği & Akış:** *"Senaryolar Gherkin diliyle yazarız:
* **Given (Ön Koşul):** Kullanıcı sepetim sayfasındadır.
* **When (Eylem):** 'Sepeti Onayla' butonuna basıldığında.
* **Then (Beklenen Sonuç):** Ödeme ekranına yönlendirilmelidir."*



### 3. Risk-Based Testing (Risk Tabanlı Test)

* **Kısa Tanım:** Sınırlı zaman ve kaynak durumunda; sistemin iş açısından en kritik, hata ihtimali en yüksek ve çöktüğünde en büyük zararı verecek modüllerine öncelik vererek test yapma stratejisidir.
* **Mülakat Örneği & Akış:** *"Kısıtlı zamanda statik içerikli yardım/SSS sayfaları yerine; ödeme altyapısı, üyelik ve sipariş oluşturma gibi çöktüğünde doğrudan finansal ve operasyonel kayıp yaratacak kritik modüllere test önceliği veririz."*

### 4. Cucumber

* **Kısa Tanım:** Gherkin diliyle yazılmış `.feature` dosyalarını arkadaki otomasyon kodlarına (Java, JS, Python) bağlayan ve bu senaryoları çalıştırılabilir test koda dönüştüren framework/runner altyapısıdır.
* **Mülakat Örneği & Akış:** *"Cucumber kullanarak `.feature` dosyasındaki `Given-When-Then` adımlarını arkadaki **Step Definitions** sınıflarındaki otomasyon kodlarıyla (Selenium/Playwright) eşleştiririz; böylece iş biriminin okuduğu doküman koşan teste dönüşür."*