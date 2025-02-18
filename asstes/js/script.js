let chartInstance = null; // Variable global para almacenar el gráfico

async function convertir() {
    const monto = document.getElementById("monto").value;
    const moneda = document.getElementById("moneda").value;
    const resultado = document.getElementById("resultado");

    if (!monto || monto <= 0) {
        resultado.textContent = "Por favor, ingrese un monto válido.";
        return;
    }

    try {
        const respuesta = await fetch("https://mindicador.cl/api");
        if (!respuesta.ok) throw new Error("Error al obtener los datos de la API");

        const datos = await respuesta.json();
        console.log("Datos obtenidos:", datos);

        let tasaCambio = datos[moneda]?.valor;
        if (!tasaCambio) throw new Error("Moneda no encontrada en la API");

        let conversion = (monto / tasaCambio).toFixed(2);
        resultado.textContent = `${monto} CLP equivale a ${conversion} ${moneda.toUpperCase()}`;

        obtenerHistorial(moneda);
    } catch (error) {
        resultado.textContent = "Error al obtener los datos.";
        console.error(error);
    }
}

async function obtenerHistorial(moneda) {
    try {
        const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!respuesta.ok) throw new Error("Error al obtener el historial de la API");

        const datos = await respuesta.json();
        console.log("Historial obtenido:", datos);

        let fechas = datos.serie.slice(0, 10).map(d => d.fecha.split("T")[0]);
        let valores = datos.serie.slice(0, 10).map(d => d.valor);

        // Si ya existe un gráfico, lo destruimos antes de crear uno nuevo
        if (chartInstance) {
            chartInstance.destroy();
        }

        let ctx = document.getElementById("historialChart").getContext("2d");
        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: fechas.reverse(),
                datasets: [{
                    label: `Valor de ${moneda} en los últimos 10 días`,
                    data: valores.reverse(),
                    borderColor: "blue",
                    fill: false
                }]
            }
        });
    } catch (error) {
        console.error("Error al obtener el historial:", error);
    }
}