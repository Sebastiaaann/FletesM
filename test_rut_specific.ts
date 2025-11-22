const validateChileanRut = (rut: string): string | null => {
    if (!rut) return "RUT es requerido";

    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length < 7) return "RUT es muy corto. Formato: 12345678-9";

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return "Formato de RUT inválido. Formato: 12345678-9";

    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const mod = 11 - (sum % 11);
    const expectedDv = mod === 11 ? '0' : mod === 10 ? 'K' : mod.toString();

    console.log(`Body: ${body}, Sum: ${sum}, Mod: ${mod}, Expected DV: ${expectedDv}, Actual DV: ${dv}`);

    if (dv !== expectedDv) {
        return `Dígito Verificador inválido. Debería ser ${expectedDv}`;
    }

    return null;
};

const rut = "20656816-6";
console.log(`Testing ${rut}: ${validateChileanRut(rut)}`);
