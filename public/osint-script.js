// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, setPersistence, browserSessionPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mengambil Environment Variable dari Next.js (via globalThis / window)
const firebaseConfig = (() => {
    try {
        // Menggunakan window.FIREBASE_CONFIG_JSON yang disuntikkan di pages/index.js
        const env = window.FIREBASE_CONFIG_JSON || globalThis.FIREBASE_CONFIG_JSON;
        return JSON.parse(env);
    } catch (e) {
        console.error("[$ ERROR] Gagal parsing FIREBASE_CONFIG_JSON:", e);
        return {};
    }
})();


const appId = window.APP_ID || globalThis.APP_ID || 'osint-v7';

// Token ini akan diisi oleh runtime Canvas/Next.js jika tersedia
const initialAuthToken = window.INITIAL_AUTH_TOKEN || globalThis.INITIAL_AUTH_TOKEN || null;

// --- Global State ---
let db;
let auth;
let userId = 'MENUNGGU_AUTENTIKASI';
let isPremium = false;
let isSoundOn = localStorage.getItem('isSoundOn') === 'true';

// JANGAN LUPA GANTI INI DENGAN USER ID ANDA SENDIRI! (Ditemukan di header saat aplikasi dimuat)
const ADMIN_UID = "ADMIN_ID_ANDA_DISINI"; // Ganti dengan UID Admin yang sebenarnya

let unsubscribePremiumStatus = () => { };

// --- Utility Functions ---

/**
 * Mengonversi string HTML menjadi elemen DOM.
 * @param {string} htmlString 
 * @returns {HTMLElement}
 */
function htmlToElement(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}

/**
 * Memutar suara notifikasi sederhana menggunakan Tone.js
 * @param {string} frequency 
 */
function playSound(frequency = "C4") {
    if (!isSoundOn || typeof Tone === 'undefined') return;
    try {
        // Cek dan start context jika belum berjalan
        if (Tone.context.state !== 'running') {
            // Jika belum berjalan, akan dicoba start saat klik pertama (di window.onload)
            return;
        }
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(frequency, "8n");
        setTimeout(() => synth.dispose(), 1000);
    } catch (e) {
        console.warn("Tone.js error, mungkin belum sepenuhnya dimuat:", e);
    }
}

// --- Firebase Initialization and Logic ---

async function initFirebase() {
    console.log("[$ INFO] Memulai inisialisasi Firebase...");
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        await setPersistence(auth, browserSessionPersistence);
        
        // Autentikasi menggunakan token kustom atau anonim
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("[$ SUCCESS] Autentikasi kustom berhasil.");
        } else {
            await signInAnonymously(auth);
            console.log("[$ SUCCESS] Autentikasi anonim berhasil.");
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log(`[$ INFO] User ID terdeteksi: ${userId}`);
                renderUI(); // Render ulang setelah mendapatkan userId
                setupPremiumListener(userId);
            } else {
                console.log("[$ WARNING] Tidak ada pengguna terautentikasi.");
                userId = 'TIDAK_TERAUTENTIKASI';
                renderUI();
            }
        });

    } catch (error) {
        console.error("[$ FATAL ERROR] Kesalahan inisialisasi Firebase:", error);
        document.getElementById('root').innerHTML = `<div class="p-8 text-center text-red-600 bg-red-950 border border-red-500 text-sm">Gagal inisialisasi Firebase. Cek konsol untuk detail error.</div>`;
    }
}

/**
 * Mengatur listener real-time untuk status premium pengguna
 * @param {string} uid 
 */
function setupPremiumListener(uid) {
    // Hentikan listener lama jika ada
    unsubscribePremiumStatus(); 

    const userDocRef = doc(db, "artifacts", appId, "users", uid, "data", "profile");
    
    // Mulai listener baru
    unsubscribePremiumStatus = onSnapshot(userDocRef, (docSnap) => {
        const premiumStatusElement = document.getElementById('premiumStatus');
        const userIdElement = document.getElementById('currentUserId');
        const adminPanel = document.getElementById('adminPanel');
        
        if (docSnap.exists() && docSnap.data().isPremium === true) {
            const wasPremium = isPremium;
            isPremium = true;
            premiumStatusElement.textContent = 'STATUS: PREMIUM AKTIF';
            premiumStatusElement.classList.add('text-green-400', 'shadow-neon-sm'); // Gunakan hijau neon
            premiumStatusElement.classList.remove('text-yellow-400');
            
            if (!wasPremium) {
                playSound("G4"); // Suara jika baru saja menjadi premium
            }

            console.log("[$ INFO] Status Premium Aktif.");
        } else {
            isPremium = false;
            premiumStatusElement.textContent = 'STATUS: Non-Premium (Akses Terbatas)';
            premiumStatusElement.classList.remove('text-green-400', 'shadow-neon-sm');
            premiumStatusElement.classList.add('text-yellow-400');
            console.log("[$ INFO] Status Non-Premium.");
        }

        // Tampilkan UID dan Admin Panel jika sudah siap
        if (userIdElement) userIdElement.textContent = `UID: ${uid}`;
        if (adminPanel) adminPanel.style.display = (uid === ADMIN_UID) ? 'block' : 'none';
        
    }, (error) => {
        console.error("[$ ERROR] Error mendengarkan status premium:", error);
    });
}


// --- UI Rendering and Event Handlers ---

/**
 * Membangun dan merender seluruh antarmuka aplikasi dengan tema terminal.
 */
function renderUI() {
    const root = document.getElementById('root');
    if (!root) return;

    // Bersihkan root sebelum render
    root.innerHTML = '';
    
    const isAdmin = userId === ADMIN_UID;
    
    // Menggunakan gaya terminal: Latar belakang hitam, border hijau neon.
    const uiContent = htmlToElement(`
        <div id="appContainer" class="min-h-screen flex flex-col items-center justify-center p-4">
            
            <!-- Main Terminal Window -->
            <div class="w-full max-w-3xl bg-black border-4 border-green-500 shadow-neon-lg p-6 md:p-10 space-y-6">
                
                <h1 class="text-3xl font-extrabold text-green-400 text-center border-b border-green-700 pb-4 tracking-wider">
                    $ OSINT SYSTEM V7.0
                </h1>

                <!-- User & Status Section (Baris Command) -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-900 border border-green-800 rounded-sm shadow-inner">
                    <div class="space-y-1">
                        <p id="currentUserId" class="text-sm font-mono text-green-300 break-all">
                            UID: ${userId}
                        </p>
                        <p id="premiumStatus" class="text-lg font-bold ${isPremium ? 'text-green-400 shadow-neon-sm' : 'text-yellow-400'}">
                            STATUS: ${isPremium ? 'PREMIUM AKTIF' : 'Non-Premium (Akses Terbatas)'}
                        </p>
                    </div>

                    <!-- Sound Toggle -->
                    <div class="mt-4 md:mt-0 flex items-center space-x-2">
                        <span class="text-sm text-green-500">Audio FX</span>
                        <button id="soundToggle" class="relative inline-flex items-center h-6 w-11 transition-colors focus:outline-none 
                            ${isSoundOn ? 'bg-green-500 shadow-neon-sm' : 'bg-gray-700'}" style="border-radius: 2px;" role="switch" aria-checked="${isSoundOn}">
                            <span id="soundIndicator" class="inline-block w-4 h-4 transform rounded-none bg-green-100 shadow-md transition-transform 
                                ${isSoundOn ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                    </div>
                </div>

                <!-- Main Content (Area Output Terminal) -->
                <div id="mainContent" class="p-6 border-2 border-green-600 bg-gray-950 min-h-[250px] overflow-auto shadow-inner">
                    <pre class="text-green-300 whitespace-pre-wrap">$ system_init_check...</pre>
                    <pre class="text-green-300 whitespace-pre-wrap">$ auth_status: ${userId}</pre>
                    <pre class="text-yellow-400 whitespace-pre-wrap">$ premium_status: ${isPremium ? 'ACCESS_GRANTED' : 'RESTRICTED_MODE'}</pre>
                    <pre class="text-green-200 whitespace-pre-wrap mt-4">> Siap menerima command OSINT...</pre>
                    <!-- Logika dan hasil OSINT akan ditampilkan di area ini -->
                </div>

                <!-- Admin Panel (Hanya ditampilkan untuk ADMIN_UID) -->
                <div id="adminPanel" style="display: ${isAdmin ? 'block' : 'none'};" class="bg-red-950 border-2 border-red-500 p-6 space-y-4 shadow-neon-lg">
                    <h2 class="text-xl font-bold text-red-400 border-b border-red-700 pb-2">ADMIN PANEL: Aktivasi Premium</h2>
                    <input id="targetUidInput" type="text" placeholder="Masukkan UID Target untuk Aktivasi Premium" 
                           class="w-full p-3 border-2 border-red-500 bg-black text-green-400 focus:ring-red-500 focus:border-red-500 rounded-none">
                    <button id="activatePremiumBtn" class="w-full bg-red-800 hover:bg-red-700 text-white font-semibold py-3 transition duration-150 rounded-none border border-red-500 hover:shadow-neon-sm">
                        [ EXECUTE ] Aktifkan Premium
                    </button>
                    <p id="adminStatus" class="text-sm text-center text-yellow-400 font-medium">[ $ INFO ] Siap.</p>
                </div>

            </div>
            
            <p class="mt-4 text-xs text-green-500">[ End of Session ]</p>
        </div>
    `);

    root.appendChild(uiContent);
    
    // Pasang Event Listeners setelah elemen UI ada
    setupEventListeners();
}

/**
 * Mengatur semua event listener untuk interaksi UI
 */
function setupEventListeners() {
    const soundToggle = document.getElementById('soundToggle');
    const soundIndicator = document.getElementById('soundIndicator');

    if (soundToggle && soundIndicator) {
        // Sound Toggle Handler
        soundToggle.onclick = () => {
            isSoundOn = !isSoundOn;
            localStorage.setItem('isSoundOn', isSoundOn);

            // Update UI
            if (isSoundOn) {
                soundIndicator.classList.add('translate-x-6');
                soundIndicator.classList.remove('translate-x-1');
                soundToggle.classList.add('bg-green-500', 'shadow-neon-sm');
                soundToggle.classList.remove('bg-gray-700');
                soundToggle.setAttribute('aria-checked', 'true');
                playSound("C5"); // Test sound
            } else {
                soundIndicator.classList.remove('translate-x-6');
                soundIndicator.classList.add('translate-x-1');
                soundToggle.classList.remove('bg-green-500', 'shadow-neon-sm');
                soundToggle.classList.add('bg-gray-700');
                soundToggle.setAttribute('aria-checked', 'false');
            }
        };
    }
    
    const activatePremiumBtn = document.getElementById('activatePremiumBtn');
    
    if (activatePremiumBtn) {
        // Admin Button Handler
        activatePremiumBtn.addEventListener('click', async () => {
            if (!db || userId !== ADMIN_UID) {
                console.error("[$ FATAL ERROR] Admin panel diakses oleh non-admin atau database belum siap.");
                return;
            }

            const targetUidInput = document.getElementById('targetUidInput');
            const adminStatus = document.getElementById('adminStatus');
            const targetUid = targetUidInput.value.trim();

            if (!targetUid) {
                adminStatus.textContent = `[$ WARNING] Masukkan UID target!`;
                adminStatus.classList.remove('text-green-500', 'text-red-500');
                adminStatus.classList.add('text-yellow-400');
                return;
            }

            adminStatus.textContent = `[$ INFO] Memproses aktivasi untuk ${targetUid.substring(0, 10)}...`;
            adminStatus.classList.remove('text-green-500', 'text-red-500');
            adminStatus.classList.add('text-yellow-400');

            try {
                // Path: /artifacts/{appId}/users/{targetUid}/data/profile
                const targetDocRef = doc(db, "artifacts", appId, "users", targetUid, "data", "profile");
                
                // Menetapkan status premium
                await setDoc(targetDocRef, { 
                    isPremium: true,
                    activatedBy: userId,
                    activatedAt: new Date().toISOString()
                }, { merge: true });

                adminStatus.textContent = `[$ SUCCESS] User ID ${targetUid.substring(0, 10)}... telah diaktifkan! Status Premium diperbarui. Konfirmasi Selesai.`;
                adminStatus.classList.add('text-green-500');
                adminStatus.classList.remove('text-red-500', 'text-yellow-400');
                playSound("A4");

            } catch (error) {
                console.error("ADMIN ERROR activating premium:", error);
                adminStatus.textContent = `[$ FATAL ERROR] Gagal menyimpan ke database. Cek konsol.`;
                adminStatus.classList.remove('text-yellow-400', 'text-green-500');
                adminStatus.classList.add('text-red-500');
                playSound("F3");
            }
        });
    }
}


// --- Initialization on Load ---
window.onload = () => {
    // 1. Inisialisasi Firebase dan Autentikasi
    initFirebase();
    
    // 2. Setup Tone.js AudioContext Resume (Fix for AudioContext Error)
    // AudioContext harus dimulai setelah gesture pengguna (klik).
    // Kita tambahkan listener ke body, dan hapus setelah dipicu.
    document.body.addEventListener('click', () => {
        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
            Tone.start().then(() => {
                console.log("[$ SUCCESS] Tone.js AudioContext berhasil dimulai setelah klik pengguna.");
            }).catch(e => {
                console.error("[$ ERROR] Gagal memulai Tone.js AudioContext:", e);
            });
        }
    }, { once: true });
    
    // 3. Render UI awal (sebelum setupFirebase selesai, untuk menghindari layar kosong)
    // renderUI(); // Dihapus karena sudah dipanggil di initFirebase saat auth state berubah
}
