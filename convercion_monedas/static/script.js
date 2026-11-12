// Lista de monedas populares y oficiales (ISO 4217)
const currencies = [
    { code: "USD", name: "Dólar estadounidense" },
    { code: "EUR", name: "Euro" },
    { code: "MXN", name: "Peso mexicano" },
    { code: "KRW", name: "Won surcoreano" },
    { code: "JPY", name: "Yen japonés" },
    { code: "GBP", name: "Libra esterlina" },
    { code: "CNY", name: "Yuan chino" },
    { code: "CAD", name: "Dólar canadiense" },
    { code: "AUD", name: "Dólar australiano" },
    { code: "CHF", name: "Franco suizo" },
    { code: "BRL", name: "Real brasileño" },
    { code: "INR", name: "Rupia india" },
    { code: "ARS", name: "Peso argentino" },
    { code: "CLP", name: "Peso chileno" },
    { code: "COP", name: "Peso colombiano" },
    { code: "PEN", name: "Sol peruano" },
    { code: "RUB", name: "Rublo ruso" },
    { code: "TRY", name: "Lira turca" },
    { code: "ZAR", name: "Rand sudafricano" },
    { code: "SEK", name: "Corona sueca" },
    { code: "NOK", name: "Corona noruega" },
    { code: "DKK", name: "Corona danesa" },
    { code: "PLN", name: "Zloty polaco" },
    { code: "SGD", name: "Dólar de Singapur" },
    { code: "HKD", name: "Dólar de Hong Kong" },
    { code: "NZD", name: "Dólar neozelandés" },
    { code: "THB", name: "Baht tailandés" },
    { code: "IDR", name: "Rupia indonesia" },
    { code: "PHP", name: "Peso filipino" },
    { code: "VND", name: "Dong vietnamita" },
    { code: "AED", name: "Dírham de EAU" },
    { code: "SAR", name: "Riyal saudí" },
    { code: "ILS", name: "Nuevo séquel israelí" },
    { code: "EGP", name: "Libra egipcia" },
    { code: "NGN", name: "Naira nigeriana" }
];

const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swapBtn');
const resultSection = document.getElementById('resultSection');
const errorMsg = document.getElementById('errorMsg');

// Llenar selects
function populateSelects() {
    currencies.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.code;
        opt1.textContent = `${c.code} — ${c.name}`;
        fromSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = c.code;
        opt2.textContent = `${c.code} — ${c.name}`;
        toSelect.appendChild(opt2);
    });
    fromSelect.value = 'MXN';
    toSelect.value = 'USD';
}

populateSelects();

// Navegación simple
function showSection(section) {
    document.getElementById('section-home').style.display = section === 'about' ? 'none' : 'block';
    document.getElementById('section-about').style.display = section === 'about' ? 'block' : 'none';

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section || (section === 'converter' && btn.dataset.section === 'home')) {
            btn.classList.add('active');
        }
    });

    if (section === 'converter' || section === 'home') {
        document.querySelector('[data-section="home"]').classList.add('active');
    }
}

// Intercambiar monedas
swapBtn.addEventListener('click', () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
});

// Convertir
convertBtn.addEventListener('click', convertCurrency);
amountInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') convertCurrency();
});

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    errorMsg.classList.remove('visible');
    resultSection.classList.remove('visible');

    if (!amount || amount <= 0) {
        showError('Ingresa una cantidad válida mayor a cero.');
        return;
    }
    if (from === to) {
        showError('Selecciona dos monedas diferentes.');
        return;
    }

    convertBtn.disabled = true;
    convertBtn.innerHTML = '<span class="loading"></span> Convirtiendo...';

    try {
        // API gratuita sin clave (exchangerate.fun)
        const res = await fetch(`https://api.exchangerate.fun/latest?base=${from}`);
        if (!res.ok) throw new Error('No se pudo obtener la tasa de cambio');

        const data = await res.json();
        const rate = data.rates[to];

        if (!rate) throw new Error('Moneda no disponible en este momento');

        const converted = amount * rate;
        const inverseRate = 1 / rate;

        // Mostrar resultado
        document.getElementById('resultAmount').innerHTML = 
            `${formatNumber(converted)} <span>${to}</span>`;
        
        document.getElementById('resultRate').textContent = 
            `1 ${from} = ${formatNumber(rate)} ${to}  ·  1 ${to} = ${formatNumber(inverseRate)} ${from}`;

        // Desviación / fuerza relativa
        let deviationText, className, note;

        if (rate > 1) {
            const pct = ((rate - 1) / 1) * 100;
            deviationText = `${from} es más fuerte: se necesitan ${formatNumber(rate)} ${to} por cada 1 ${from}`;
            className = 'positive';
            note = `La moneda de origen (${from}) tiene mayor poder adquisitivo relativo. Diferencia aproximada respecto a la paridad 1:1: +${pct.toFixed(1)}% en unidades de ${to}.`;
        } else if (rate < 1) {
            const pct = ((1 - rate) / rate) * 100;
            deviationText = `${to} es más fuerte: se necesitan ${formatNumber(inverseRate)} ${from} por cada 1 ${to}`;
            className = 'negative';
            note = `La moneda de destino (${to}) tiene mayor poder adquisitivo relativo. Diferencia aproximada respecto a la paridad 1:1: la moneda ${from} está más débil en aproximadamente ${pct.toFixed(1)}%.`;
        } else {
            deviationText = 'Paridad aproximada 1:1';
            className = 'neutral';
            note = 'Las dos monedas tienen un valor muy similar en este momento.';
        }

        const devEl = document.getElementById('deviationValue');
        devEl.textContent = deviationText;
        devEl.className = 'deviation-value ' + className;
        document.getElementById('deviationNote').textContent = note;

        document.getElementById('lastUpdate').textContent = 
            `Tasa de referencia del ${data.date || 'día actual'} · Fuente: exchangerate.fun`;

        resultSection.classList.add('visible');

    } catch (err) {
        console.error(err);
        showError('No se pudo completar la conversión. Verifica tu conexión e inténtalo de nuevo.');
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convertir';
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return num.toLocaleString('es-MX', { maximumFractionDigits: 2 });
    } else if (num >= 1) {
        return num.toLocaleString('es-MX', { maximumFractionDigits: 4 });
    } else {
        return num.toLocaleString('es-MX', { maximumFractionDigits: 6 });
    }
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
}

// Convertir al cargar con valores por defecto
window.addEventListener('load', () => {
    setTimeout(convertCurrency, 400);
});