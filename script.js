let chart; // Variable global para almacenar la instancia del gráfico de Chart.js

// Evento que se dispara cuando la página ha terminado de cargarse
window.onload = function() {
    iniciarAnimaciones(); // Inicia la secuencia de animaciones de la página al cargarse
};

// Función para iniciar las animaciones de elementos de la página con temporizadores
// Esta función se encarga de activar animaciones para varios elementos de manera secuencial.
function iniciarAnimaciones() {
    document.querySelector(".container").classList.add("active"); // Activa la animación del contenedor principal

    // Secuencia de activación de elementos, cada uno con un retardo para generar una animación escalonada
    setTimeout(() => {
        activarElemento("h1", 500, () => { // Activa el título principal después de 500ms
            activarElemento("h2", 500, () => { // Luego activa el subtítulo con un retardo adicional
                activarElemento("#descripcion", 500, () => { // Finalmente, activa la descripción
                    activarFormElements(); // Activa los elementos del formulario una vez completada la secuencia anterior
                });
            });
        });
    }, 500); // Comienza la secuencia con un retardo de 500ms
}

// Función genérica para activar un elemento con una animación y un retardo opcional
// Esta función permite agregar flexibilidad a las animaciones y reutilizar código.
function activarElemento(selector, delay, callback) {
    document.querySelector(selector).classList.add("active"); // Añade la clase 'active' para disparar la animación
    setTimeout(callback, delay); // Ejecuta la siguiente animación después del retardo especificado
}

// Activa los elementos del formulario de manera secuencial
// Itera sobre cada elemento del formulario y aplica un retardo progresivo para dar una sensación de fluidez en la animación
function activarFormElements() {
    const formElements = document.querySelectorAll("form label, form input, form button, form select"); // Selecciona todos los elementos del formulario
    formElements.forEach((element, index) => {
        setTimeout(() => element.classList.add("active"), (index + 1) * 300); // Activa cada elemento con un intervalo de 300ms
    });
}

// Función para validar los campos del formulario y devolver mensajes de error si es necesario
// Este es un punto clave para asegurar que los datos ingresados sean válidos antes de continuar con los cálculos
function validarFormulario() {
    const balanceInicial = parseFloat(document.getElementById('initialBalance').value); // Obtiene el balance inicial
    const deposito = parseFloat(document.getElementById('deposit').value); // Obtiene el depósito
    const tasaInteres = parseFloat(document.getElementById('interestRate').value) / 100; // Convierte la tasa de interés a un valor decimal
    const frecuencia = parseInt(document.getElementById('capitalization').value); // Frecuencia de capitalización (veces por año)
    const duracion = parseInt(document.getElementById('duration').value); // Duración de la inversión en años

    // Validaciones de los campos para asegurar que todos los valores sean válidos y positivos
    if (isNaN(balanceInicial) || balanceInicial <= 0) return "El balance inicial debe ser un número positivo.";
    if (isNaN(deposito) || deposito < 0) return "El depósito debe ser un número positivo.";
    if (isNaN(tasaInteres) || tasaInteres < 0) return "La tasa de interés debe ser un número positivo.";
    if (isNaN(frecuencia) || frecuencia <= 0) return "La frecuencia de capitalización debe ser un número positivo.";
    if (isNaN(duracion) || duracion <= 0) return "La duración debe ser un número positivo mayor que 0.";

    return null; // Si no hay errores, retornamos null indicando que la validación fue exitosa
}

// Manejador para el evento de envío del formulario
// Este bloque asegura que el formulario no se envíe automáticamente y valida los datos antes de continuar
document.getElementById('investmentForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que el formulario se envíe y refresque la página

    // Validar los campos antes de proceder con los cálculos
    const error = validarFormulario();
    if (error) {
        mostrarError(error); // Si hay errores de validación, mostramos el mensaje de error y detenemos el flujo
        return;
    }

    // Si la validación es exitosa, extraemos los valores del formulario
    const balanceInicial = parseFloat(document.getElementById('initialBalance').value);
    const deposito = parseFloat(document.getElementById('deposit').value);
    const tasaInteres = parseFloat(document.getElementById('interestRate').value) / 100;
    const frecuencia = parseInt(document.getElementById('capitalization').value);
    const duracion = parseInt(document.getElementById('duration').value);

    // Calcula los balances anuales utilizando la fórmula del interés compuesto
    const balances = calcularBalanceAnual(balanceInicial, deposito, tasaInteres, frecuencia, duracion);
    const balanceFinal = balances[balances.length - 1]; // Extrae el balance final del array
    
    // Muestra el balance final en el DOM
    document.getElementById('resultado').textContent = `El balance final después de ${duracion} años será de €${balanceFinal.toFixed(2)}.`;

    // Genera y renderiza el gráfico de balances
    crearGrafico(balances, duracion);

    // Muestra el contenedor de resultados, haciéndolo visible
    document.getElementById('resultadoContainer').classList.add('visible');
});

// Función que calcula los balances anuales utilizando la fórmula del interés compuesto
// Esta es la parte central de la lógica financiera del proyecto, donde se aplica el cálculo del interés compuesto
function calcularBalanceAnual(balanceInicial, deposito, tasaInteres, frecuencia, duracion) {
    const balances = [balanceInicial]; // Inicia el array con el balance inicial

    // Itera por cada año y calcula el balance acumulado
    for (let i = 1; i <= duracion; i++) {
        const r_n = tasaInteres / frecuencia; // Calcula la tasa por período (frecuencia de capitalización)
        // Fórmula del interés compuesto con depósitos adicionales
        const balanceAnual = balanceInicial * Math.pow(1 + r_n, frecuencia * i) + deposito * ((Math.pow(1 + r_n, frecuencia * i) - 1) / r_n);
        balances.push(balanceAnual); // Añade el balance anual al array
    }
    return balances; // Devuelve el array con los balances acumulados para cada año
}

// Función que crea y renderiza el gráfico utilizando Chart.js
// Esta función se encarga de tomar los datos calculados y generar un gráfico interactivo
function crearGrafico(balances, duracion) {
    // Genera etiquetas para los años del gráfico (0 hasta duración)
    const labels = Array.from({ length: duracion + 1 }, (_, i) => i.toString());

    // Destruye el gráfico anterior si ya existe, para evitar conflictos
    if (chart) chart.destroy();

    // Configura e inicializa un nuevo gráfico de línea
    const ctx = document.getElementById('resultadoGrafico').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: labels, // Etiquetas para el eje X (años)
            datasets: [{
                label: 'Balance con interés compuesto', // Etiqueta del dataset
                data: balances, // Datos de los balances anuales
                borderColor: 'rgba(54, 162, 235, 1)', // Color de la línea
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo bajo la línea
                pointBackgroundColor: 'rgba(54, 162, 235, 1)', // Color de los puntos en el gráfico
                pointBorderColor: '#fff', // Borde de los puntos
                pointRadius: 4, // Radio de los puntos en el gráfico
                pointHoverRadius: 6, // Radio de los puntos cuando se pasa el ratón
                tension: 0.1, // Tensión para suavizar la curva
                fill: true // Rellena el área bajo la línea
            }]
        },
        options: {
            responsive: true, // Hace que el gráfico sea responsivo
            scales: {
                y: {
                    beginAtZero: true, // El eje Y comienza desde 0
                    ticks: {
                        font: {
                            family: 'HelveticaLight', // Fuente personalizada
                            size: 14 // Tamaño de la fuente de las etiquetas
                        },
                        color: '#333' // Color de las etiquetas del eje Y
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'HelveticaLight', // Fuente personalizada
                            size: 14 // Tamaño de la fuente de las etiquetas
                        },
                        color: '#333' // Color de las etiquetas del eje X
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'HelveticaLight', // Fuente personalizada para las etiquetas de la leyenda
                            size: 14 // Tamaño de la fuente de la leyenda
                        },
                        color: '#333' // Color de las etiquetas de la leyenda
                    }
                },
                tooltip: {
                    displayColors: false, // Oculta el cuadrado de color en el tooltip
                    callbacks: {
                        title: function() {
                            return ''; // No mostrar título en el tooltip
                        },
                        label: function(context) {
                            const balance = context.raw; // Valor del balance en el tooltip
                            return `Balance con interés compuesto: €${balance.toFixed(2)}`; // Muestra el balance formateado
                        }
                    },
                    titleFont: {
                        family: 'HelveticaLight', // Fuente personalizada para el título del tooltip
                        size: 14 // Tamaño de la fuente
                    },
                    bodyFont: {
                        family: 'HelveticaLight', // Fuente personalizada para el cuerpo del tooltip
                        size: 14 // Tamaño de la fuente
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo del tooltip
                    titleColor: '#fff', // Color del título del tooltip
                    bodyColor: '#fff' // Color del cuerpo del tooltip
                }
            }
        }        
    });
}

// Función para mostrar un mensaje de error en el DOM si la validación falla
// Se asegura de que los errores se comuniquen al usuario de manera clara
function mostrarError(mensaje) {
    document.getElementById('resultado').textContent = mensaje; // Inserta el mensaje de error en el DOM
    document.getElementById('resultadoContainer').classList.add('visible'); // Hace visible el contenedor de resultados
}
