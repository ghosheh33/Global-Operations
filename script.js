const translations = {
    ar: {
        title: "العمليات العالمية",
        selectCountry: "حدد دولة",
        nickname: "اللقب",
        loading: "جلب البيانات المباشرة...",
        error: "عذراً، البيانات غير متوفرة لهذه المنطقة.",
        time: "الوقت الآن",
        geo: "جغرافيا وسكان",
        capital: "العاصمة",
        region: "الإقليم",
        pop: "التعداد السكاني",
        area: "المساحة",
        lang: "اللغات الرسمية",
        tz: "المنطقة الزمنية",
        climate: "المناخ",
        eco: "اقتصاد وبنية تحتية",
        currency: "العملة الرسمية",
        gdp: "الناتج المحلي",
        phone: "رمز الاتصال",
        tld: "نطاق الإنترنت",
        driving: "اتجاه السير",
        pol: "سياسة وسياحة",
        gov: "نظام الحكم",
        indep: "تاريخ الاستقلال",
        landmark: "أشهر معلم سياحي",
        notAvailable: "غير متوفر",
        rightSide: "اليمين",
        leftSide: "اليسار"
    },
    en: {
        title: "Global Operations",
        selectCountry: "Select a Country",
        nickname: "Nickname",
        loading: "Fetching live data...",
        error: "Sorry, data is unavailable for this region.",
        time: "Current Time",
        geo: "Geography & Population",
        capital: "Capital",
        region: "Region",
        pop: "Population",
        area: "Area",
        lang: "Official Languages",
        tz: "Timezone",
        climate: "Climate",
        eco: "Economy & Infrastructure",
        currency: "Currency",
        gdp: "GDP",
        phone: "Calling Code",
        tld: "Internet TLD",
        driving: "Driving Side",
        pol: "Politics & Tourism",
        gov: "Government",
        indep: "Independence",
        landmark: "Famous Landmark",
        notAvailable: "N/A",
        rightSide: "Right",
        leftSide: "Left"
    }
};

const localCountryData = {
    "JO": { 
        nickname: { ar: "مملكة النشامى", en: "Kingdom of Hashemites" }, 
        gdp: { ar: "48 مليار $", en: "$48 Billion" }, 
        climate: { ar: "متوسطي / صحراوي", en: "Mediterranean / Desert" }, 
        landmark: { ar: "البتراء (المدينة الوردية)", en: "Petra" }, 
        gov: { ar: "ملكي دستوري", en: "Constitutional Monarchy" }, 
        indep: { ar: "1946", en: "1946" } 
    },
    "SA": { 
        nickname: { ar: "بلاد الحرمين", en: "Land of the Two Holy Mosques" }, 
        gdp: { ar: "1.1 تريليون $", en: "$1.1 Trillion" }, 
        climate: { ar: "صحراوي حار", en: "Hot Desert" }, 
        landmark: { ar: "الكعبة المشرفة", en: "Kaaba" }, 
        gov: { ar: "ملكي مطلق", en: "Absolute Monarchy" }, 
        indep: { ar: "1932", en: "1932" } 
    },
    "EG": { 
        nickname: { ar: "أم الدنيا", en: "Mother of the World" }, 
        gdp: { ar: "476 مليار $", en: "$476 Billion" }, 
        climate: { ar: "صحراوي معتدل", en: "Moderate Desert" }, 
        landmark: { ar: "أهرامات الجيزة", en: "Giza Pyramids" }, 
        gov: { ar: "جمهوري رئاسي", en: "Presidential Republic" }, 
        indep: { ar: "1922", en: "1922" } 
    },
    "AE": { 
        nickname: { ar: "زايد الخير", en: "Zayed's Goodness" }, 
        gdp: { ar: "509 مليار $", en: "$509 Billion" }, 
        climate: { ar: "صحراوي حار", en: "Hot Desert" }, 
        landmark: { ar: "برج خليفة", en: "Burj Khalifa" }, 
        gov: { ar: "ملكي اتحادي", en: "Federal Monarchy" }, 
        indep: { ar: "1971", en: "1971" } 
    },
    "PS": { 
        nickname: { ar: "أرض الأنبياء", en: "Land of Prophets" }, 
        gdp: { ar: "18 مليار $", en: "$18 Billion" }, 
        climate: { ar: "متوسطي", en: "Mediterranean" }, 
        landmark: { ar: "المسجد الأقصى", en: "Al-Aqsa Mosque" }, 
        gov: { ar: "جمهوري", en: "Republic" }, 
        indep: { ar: "1988 (إعلان)", en: "1988 (Declaration)" } 
    }
};

const ui = {
    panel: document.getElementById('country-info-panel'),
    loading: document.getElementById('loading-state'),
    data: document.getElementById('data-state'),
    error: document.getElementById('error-state'),
    btnRotate: document.getElementById('btn-rotate'),
    btnTheme: document.getElementById('btn-theme'),
    btnLang: document.getElementById('btn-lang')
};

let isRotating = true, isDayMode = false, timeInterval = null;
let currentLang = localStorage.getItem('lang') || 'ar';
let activeGeoData = null;

// --- Language Management ---
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    ui.btnLang.innerText = lang === 'ar' ? 'EN' : 'AR';

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });

    if (activeGeoData && ui.panel.classList.contains('visible')) {
        fetchCountry(activeGeoData);
    }
}

ui.btnLang.addEventListener('click', () => {
    applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

// --- Keyboard Shortcut (Accessibility) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
});

function closePanel() {
    ui.panel.classList.remove('visible');
    activeGeoData = null;
    if(timeInterval) clearInterval(timeInterval);
}

// --- Initialize 3D Globe ---
const globeContainer = document.getElementById('globe-container');
const world = Globe()(globeContainer)
    .polygonAltitude(0.01)
    .polygonCapColor(() => 'rgba(255, 255, 255, 0.0)')
    .polygonSideColor(() => 'rgba(0, 200, 255, 0.1)')
    .polygonStrokeColor(() => 'rgba(100, 150, 250, 0.3)')
    .onPolygonHover(hoverD => {
        world.polygonAltitude(d => d === hoverD ? 0.04 : 0.01)
             .polygonCapColor(d => d === hoverD ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.0)');
    })
    .onPolygonClick(({ properties: d }) => fetchCountry(d));

// --- Local Storage Theme Setup ---
function applyTheme(dayMode) {
    isDayMode = dayMode;
    document.body.classList.toggle('day-mode', isDayMode);
    world.globeImageUrl(isDayMode ? '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg' : '//unpkg.com/three-globe/example/img/earth-night.jpg');
    world.backgroundImageUrl(isDayMode ? '' : '//unpkg.com/three-globe/example/img/night-sky.png');
    localStorage.setItem('theme', isDayMode ? 'day' : 'night');
}

// Execute initial settings
applyTheme(localStorage.getItem('theme') === 'day');
applyLanguage(currentLang);

ui.btnTheme.addEventListener('click', () => applyTheme(!isDayMode));

// Load Polygons Map
fetch('//unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
    .then(res => res.json()).then(countries => world.polygonsData(countries.features));

// Globe Controls Setup
world.controls().autoRotate = isRotating;
world.controls().autoRotateSpeed = 0.5;
world.camera().position.z = 250;
window.addEventListener('resize', () => { world.width(window.innerWidth); world.height(window.innerHeight); });

ui.btnRotate.addEventListener('click', () => {
    isRotating = !isRotating; world.controls().autoRotate = isRotating;
    ui.btnRotate.style.color = isRotating ? 'var(--text-color)' : 'var(--accent)';
});

// Auto-focus on User Location
fetch('https://api.country.is/')
    .then(res => res.json())
    .then(async data => {
        const userCountryCode = data.country;
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${userCountryCode}`);
        if (res.ok) {
            const countryData = (await res.json())[0];
            if (countryData && countryData.latlng) {
                world.pointOfView({ lat: countryData.latlng[0], lng: countryData.latlng[1], altitude: 1.5 }, 3000);
            }
        }
    })
    .catch(err => console.log('GEO fetch skipped'));

// --- Real Time Clock Logic ---
function updateRealTime(utcOffsetStr) {
    const timeEl = document.getElementById('c-time');
    if(!utcOffsetStr || utcOffsetStr === 'UTC') utcOffsetStr = 'UTC+00:00';
    
    let sign = 1, hours = 0, minutes = 0;
    const match = utcOffsetStr.match(/([+-])(\d{2}):(\d{2})/);
    if (match) { sign = match[1] === '+' ? 1 : -1; hours = parseInt(match[2]); minutes = parseInt(match[3]); }
    
    function calcTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const countryDate = new Date(utc + (3600000 * sign * hours) + (60000 * sign * minutes));
        timeEl.innerText = countryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', hour12: true });
    }
    
    calcTime();
    if(timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(calcTime, 1000);
}

// --- Fetch & Populate Target Country Data ---
async function fetchCountry(geoData) {
    activeGeoData = geoData;
    
    ui.panel.classList.add('visible'); ui.loading.classList.remove('hidden'); ui.data.classList.add('hidden'); ui.error.classList.add('hidden');
    if(timeInterval) clearInterval(timeInterval);
    
    ui.panel.querySelector('.panel-content').scrollTop = 0;
    try {
        const countryCode = geoData.ISO_A2 !== '-99' ? geoData.ISO_A2 : geoData.ADMIN;
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!res.ok) throw new Error();
        
        const c = (await res.json())[0];
        const t = translations[currentLang];
        
        const local = localCountryData[countryCode] || { 
            nickname: { ar: t.notAvailable, en: t.notAvailable }, 
            gdp: { ar: t.notAvailable, en: t.notAvailable }, 
            climate: { ar: t.notAvailable, en: t.notAvailable }, 
            landmark: { ar: t.notAvailable, en: t.notAvailable }, 
            gov: { ar: t.notAvailable, en: t.notAvailable }, 
            indep: { ar: t.notAvailable, en: t.notAvailable } 
        };

        // Identity
        const apiNameAr = c.translations?.ara?.common;
        const apiNameEn = c.name.common;
        document.getElementById('c-name').innerText = currentLang === 'ar' ? (apiNameAr || apiNameEn) : apiNameEn;
        document.getElementById('c-nickname').innerText = local.nickname[currentLang];
        document.getElementById('c-flag').src = c.flags.svg;
        
        const emblem = document.getElementById('c-emblem');
        if (c.coatOfArms?.svg) { emblem.src = c.coatOfArms.svg; emblem.style.display = 'block'; } 
        else { emblem.style.display = 'none'; }
        
        // Geography & Time
        document.getElementById('c-capital').innerText = c.capital?.[0] || t.notAvailable;
        document.getElementById('c-area').innerText = new Intl.NumberFormat().format(c.area) + (currentLang === 'ar' ? ' كم²' : ' km²');
        document.getElementById('c-region').innerText = `${c.region} (${c.subregion || ''})`;
        
        const tz = c.timezones?.[0] || 'UTC';
        document.getElementById('c-timezone').innerText = tz;
        updateRealTime(tz);
        
        // Population & Culture
        document.getElementById('c-pop').innerText = new Intl.NumberFormat().format(c.population);
        document.getElementById('c-lang').innerText = c.languages ? Object.values(c.languages).join('، ') : t.notAvailable;
        
        // Tech & Logistics
        const currStr = c.currencies ? Object.values(c.currencies).map(cu => `${cu.name} (${cu.symbol||''})`).join(', ') : t.notAvailable;
        document.getElementById('c-currency').innerText = currStr;
        
        let phone = t.notAvailable;
        if(c.idd && c.idd.root) phone = c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : '');
        document.getElementById('c-phone').innerText = phone;
        
        document.getElementById('c-tld').innerText = c.tld?.[0] || t.notAvailable;
        
        const driveSide = c.car?.side;
        document.getElementById('c-driving').innerText = driveSide === 'right' ? t.rightSide : (driveSide === 'left' ? t.leftSide : t.notAvailable);
        
        // Local Static Data
        document.getElementById('c-gdp').innerText = local.gdp[currentLang];
        document.getElementById('c-gov').innerText = local.gov[currentLang];
        document.getElementById('c-indep').innerText = local.indep[currentLang];
        document.getElementById('c-climate').innerText = local.climate[currentLang];
        document.getElementById('c-landmark').innerText = local.landmark[currentLang];
        
        ui.loading.classList.add('hidden'); ui.data.classList.remove('hidden');
    } catch (e) {
        ui.loading.classList.add('hidden'); ui.error.classList.remove('hidden');
    }
}