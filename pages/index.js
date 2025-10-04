import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const soundToggle = document.getElementById('soundToggle');
    const soundIndicator = document.querySelector('.toggle-circle');

    if (soundToggle && soundIndicator) {
      const isSoundOn = soundToggle.checked;
      if (isSoundOn) {
        soundIndicator.classList.add('translate-x-3');
        document.getElementById('soundIndicator').classList.add('bg-green-500');
      } else {
        soundIndicator.classList.add('translate-x-0');
        document.getElementById('soundIndicator').classList.add('bg-gray-500');
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Sistem Pemrosesan Data OSINT V7</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:," />
      </Head>

      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js" strategy="beforeInteractive" />

      <main className="min-h-screen bg-black text-green-500 font-mono p-8">
        <h1 className="text-2xl md:text-4xl mb-4 text-neon">
          [INIT] OSINT CONSOLE V7
        </h1>
        <div className="border border-green-700 p-4 rounded-md bg-gray-900">
          <p>[$ SYSTEM] Menganalisis protokol keamanan... OK</p>
          <p>[$ SYSTEM] Memuat modul Kriptografi ELINT V4.2...</p>
          <p id="authStatusLine">[$ SYSTEM] Mengautentikasi sistem...</p>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <label htmlFor="soundToggle">Sound:</label>
          <input id="soundToggle" type="checkbox" defaultChecked className="hidden" />
          <div id="soundIndicator" className="w-10 h-6 bg-green-500 rounded-full p-1">
            <div className="toggle-circle w-4 h-4 bg-black rounded-full translate-x-3 transition" />
          </div>
        </div>
      </main>
    </>
  );
}
