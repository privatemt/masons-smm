import Image from "next/image";
import { messages } from "../../i18n/messages";
import LanguageSelector from "./components/LanguageSelector";
import InteractiveForm from "./components/InteractiveForm";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages[locale as keyof typeof messages];
    for (const k of keys) value = value?.[k];
    return value || key;
  };

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Тёмный контейнер с округлением и обрезкой содержимого */}
      <div className="absolute inset-4 bg-[#131212] rounded-tl-[40px] rounded-tr-[40px] rounded-bl-[40px] rounded-br-[40px] lg:rounded-br-[400px] overflow-hidden lg:overflow-hidden overflow-y-auto z-10">
      <div className="lg:hidden bg-[#131212] text-white p-6 text-center relative z-20">
        <div className="flex flex-col-reverse items-center space-y-4">
          {/* Логотип */}
          <div className="w-230 h-230">
            <Image
              src="/logo.png"
              alt="MASONS PARTNERS Logo"
              width={230}
              height={230}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="absolute bottom-0 left-[-50px] w-[200px] h-[200px] lg:w-[400px] lg:h-[400px] z-[55]">
            <Image
              src="/triangle-right.png"
              alt="Triangle Left Bottom Large"
              width={400}
              height={400}
              className="w-full h-full object-contain opacity-80 transform -rotate-[-30deg] scale-110"
              priority
            />
          </div>
          
          {/* 2. Средний треугольник справа от первой строки (контурный) */}
          <div className="absolute top-0 right-8 w-[125px] h-[125px] lg:w-[250px] lg:h-[250px] z-[55]">
            <Image
              src="/triangle-left.png"
              alt="Triangle Right Top Outline"
              width={250}
              height={250}
              className="w-full h-full object-contain opacity-60 transform rotate-90 scale-90"
              priority
            />
          </div>
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {t("common.title")}
            </h1>
            <h2 className="text-lg font-semibold text-white/90 leading-tight">
              {t("common.title2")}
            </h2>
          </div>
        </div>
      </div>

        {/* Сетка на фоне */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="relative z-10 flex lg:flex-row h-full p-8 text-white">
          {/* Левая колонка: форма */}
          <div className="w-full lg:w-1/4 flex items-baseline lg:items-center justify-center lg:justify-start mb-8 lg:mb-0">
            <div className="w-full max-w-md">
              <div className="border-none h-full lg:h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold text-center mb-2 text-white flex-shrink-0">
                  {t("form.title")}
                </h2>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <InteractiveForm 
                    messages={messages[locale as keyof typeof messages]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка: заголовок - скрываем на мобильных */}
          <div className="hidden lg:flex w-full lg:w-1/2 lg:w-[60%] flex-col items-start justify-between relative h-full p-8 overflow-hidden">
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mt-8 lg:mt-16">
              {t("common.title")} <br/>
              {t("common.title2")}
            </h1>
            
            {/* Декоративные треугольники как на скриншоте - только 4 штуки */}
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* 1. Большой треугольник слева внизу (заполненный) */}
              <div className="absolute bottom-0 left-[-50px] w-[200px] h-[200px] lg:w-[400px] lg:h-[400px] z-[55]">
                <Image
                  src="/triangle-left.png"
                  alt="Triangle Left Bottom Large"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain opacity-80 transform -rotate-[-30deg] scale-110"
                  priority
                />
              </div>
              
              {/* 2. Средний треугольник справа от первой строки (контурный) */}
              <div className="absolute top-0 right-8 w-[125px] h-[125px] lg:w-[250px] lg:h-[250px] z-[55]">
                <Image
                  src="/triangle-right.png"
                  alt="Triangle Right Top Outline"
                  width={250}
                  height={250}
                  className="w-full h-full object-contain opacity-60 transform rotate-90 scale-90"
                  priority
                />
              </div>
              
              {/* 3. Маленький треугольник справа вверху (заполненный) */}
              <div className="absolute top-60 left-60 w-[90px] h-[90px] lg:w-[180px] lg:h-[180px] z-[55]">
                <Image
                  src="/triangle-right.png"
                  alt="Triangle Right Top Small"
                  width={180}
                  height={180}
                  className="w-full h-full object-contain transform -rotate-[150deg]"
                  priority
                />
              </div>
              
              {/* 4. Средний треугольник слева по центру (полупрозрачный) */}
              <div className="absolute top-80 right-0 w-[50px] h-[50px] lg:w-[100px] lg:h-[100px] z-[55]">
                <Image
                  src="/triangle-left.png"
                  alt="Triangle Left Center"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain opacity-100 transform rotate-90 scale-95"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Логотип поверх всего блока, вне overflow-hidden - только для десктопа */}
      <div className="hidden lg:block pointer-events-none select-none absolute bottom-0 right-8 w-[200px] h-[200px] lg:w-[420px] lg:h-[420px] z-[60]">
        <Image
          src="/logo.png"
          alt="MASONS PARTNERS Logo"
          width={420}
          height={420}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Переключатель языка */}
      <div className="absolute top-4 right-4 z-[70]">
        <LanguageSelector currentLocale={locale} />
      </div>
    </div>
  );
}
