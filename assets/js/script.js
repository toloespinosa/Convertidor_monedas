let currentChart = null;
document.getElementById('cantidad').addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
        document.getElementById('convertir').click();
    }
});

document.getElementById('convertir').addEventListener('click', async function() {
    const cantidad = document.getElementById('cantidad').value;
    const moneda = document.getElementById('moneda').value;
    const resultadoDiv = document.getElementById('resultado');

    if (isNaN(cantidad) || cantidad === '') {
        alert('Debes ingresar solo números');
        return;
    }
    
    async function getmoneda() {
        try {
            const response = await fetch('https://mindicador.cl/api');
            const data = await response.json();
            const valorMoneda = data[moneda].valor;
            const conversion = (cantidad / valorMoneda).toFixed(2);
            
            resultadoDiv.innerHTML = `${cantidad} CLP son ${conversion} ${moneda.toUpperCase()}`;

            mostrarHistorial(data[moneda].codigo);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            resultadoDiv.innerHTML = 'Error al obtener los datos de la moneda.';
        }
    };

    await getmoneda();
});

async function mostrarHistorial(moneda) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        
        const data = await response.json();
        const labels = data.serie.slice(0, 10).map(item => item.fecha.split('T')[0]);
        const valores = data.serie.slice(0, 10).map(item => item.valor);

        labels.reverse();
        valores.reverse();
        
        if (currentChart) {
            currentChart.destroy(); 
        }
        
        const ctx = document.getElementById('historial').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Valor del ${moneda.toUpperCase()} en los últimos 10 días`,
                    data: valores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    
                    x: {
                        title: {
                            display: false,
                            text: 'Fecha'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al mostrar el historial:', error);
    }
}
