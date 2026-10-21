// Funcion para quitar las tildes para uarlo en la búsqueda de texto
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function createCell(tag, content, className) {
  const cell = document.createElement(tag);
  cell.classList.add(`td-${className}`);
  cell.innerHTML = content;
  return cell;
}

function addTooltip(cell) {
  cell.title = cell.innerText;
}

function createCheckbox(area, competencia, etapa, nivel, indicador) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('form-check-input');
  checkbox.classList.add('indicator-checkbox');
  checkbox.setAttribute('data-area', area.area);
  checkbox.setAttribute('data-area-titulo', area.titulo);
  checkbox.setAttribute('data-competencia', competencia.competencia);
  checkbox.setAttribute('data-competencia-titulo', competencia.titulo);
  checkbox.setAttribute('data-etapa', etapa.etapa);
  checkbox.setAttribute('data-etapa-titulo', etapa.titulo);
  checkbox.setAttribute('data-nivel', nivel.nivel);
  checkbox.setAttribute('data-indicador', indicador.indicador);
  checkbox.setAttribute('data-indicador-titulo', indicador.titulo);
  checkbox.setAttribute(
    'name',
    `${competencia.competencia}.${nivel.nivel}.${indicador.indicador}`
  );
  checkbox.setAttribute(
    'id',
    `${competencia.competencia}.${nivel.nivel}.${indicador.indicador}`
  );

  return checkbox;
}

function createLabel(indicador) {
  const label = document.createElement('label');
  label.classList.add('form-check-label');
  label.innerHTML = `<strong>${indicador.indicador}.</strong> ${indicador.titulo}`;
  return label;
}

function filterLevel(nivel) {
  const levelChecks = {
    A1: 'check-a1',
    A2: 'check-a2',
    B1: 'check-b1',
    B2: 'check-b2',
    C1: 'check-c1',
    C2: 'check-c2',
  };
  const levelCheck = levelChecks[nivel.nivel];
  return levelCheck && !document.getElementById(levelCheck).checked;
}

function handleTextSearch(area, competencia, etapa, nivel, indicador) {
  const text = removeDiacritics(
    document.getElementById('search').value.toLowerCase()
  );
  if (text === '') return false;
  const texts = [
    area.titulo,
    competencia.titulo,
    etapa.etapa,
    etapa.titulo,
    nivel.nivel,
    nivel.titulo,
    indicador.titulo,
    nivel.afirmaciones_desempeño,
    nivel.ejemplos.join(','),
  ]
    .join(' ')
    .toLowerCase();

  // Busca la cadena de texto en los textos combinados
  return !removeDiacritics(texts).includes(text);
}

function createRow(area, competencia, etapa, nivel, indicador, lastCells) {
  const row = document.createElement('tr');

  // Crea celdas
  const areaCell = createCell(
    'td',
    `<strong>${area.area}.</strong> ${area.titulo}`,
    'area'
  );
  const competenciaCell = createCell(
    'td',
    `<strong>${competencia.competencia}.</strong> ${competencia.titulo}`,
    'competencia'
  );
  const etapaCell = createCell(
    'td',
    `<strong>${etapa.etapa}.</strong> ${etapa.titulo}`,
    'etapa'
  );
  const nivelCell = createCell(
    'td',
    `<strong>${nivel.nivel}.</strong> ${nivel.titulo}`,
    'nivel'
  );
  const indicadorCell = document.createElement('td');
  const desempenoCell = createCell(
    'td',
    nivel.afirmaciones_desempeño +
      '<br /><strong>Ejemplos:</strong><br /><ul><li>' +
      nivel.ejemplos.join('</li><li>') +
      '</li></ul>',
    'desempeno'
  );

  // Añade clases
  etapaCell.classList.add('d-none', 'd-md-table-cell');
  desempenoCell.classList.add('d-none', 'd-md-table-cell');

  // Agregamos el color de fondo a la fila dependiendo del área
  row.classList.add(`area${area.area}`);

  // Agrega tooltips
  [areaCell, competenciaCell, etapaCell, nivelCell].forEach(cell =>
    addTooltip(cell)
  );

  // Construye la celda del indicador
  const label = createLabel(indicador);
  const checkbox = createCheckbox(area, competencia, etapa, nivel, indicador);
  label.prepend(checkbox);
  indicadorCell.append(label);

  // Comprueba y fusiona celdas si el contenido es el mismo que el de la fila anterior
  [areaCell, competenciaCell, etapaCell, nivelCell, desempenoCell].forEach(
    (cell, index) => {
      const lastCell = lastCells[index];

      // Agregamos la celda del indicador justo antes del índice 4 (desmpenoCell)
      if (index === 4) {
        row.appendChild(indicadorCell);
      }

      if (lastCell && lastCell.textContent === cell.textContent) {
        lastCell.rowSpan++;
        cell.style.display = 'none';
      } else {
        row.appendChild(cell);
        lastCells[index] = cell; // Actualiza lastCells para la siguiente iteración
      }
    }
  );

  return row;
}

let data;
let tableBody;

function fillTable(data) {
  // Limpiar las filas existentes, excepto la primera (thead)
  const rows = document.querySelectorAll('#mrcdd-table tbody tr');
  rows.forEach(row => row.remove());


  // Obtener el cuerpo de la tabla
  const tableBody = document.querySelector('#table-body');

  // Inicializar las últimas celdas para la gestión de rowspan
  const lastCells = [];

  // Iterar sobre los datos y crear las filas
  for (const area of data) {
    for (const competencia of area.competencias) {
      for (const etapa of competencia.etapas) {
        for (const nivel of etapa.niveles) {
          // Filtrar por nivel
          if (filterLevel(nivel)) continue;

          for (const indicador of nivel.indicadores_logro) {
            // Manejar la búsqueda de texto
            if (handleTextSearch(area, competencia, etapa, nivel, indicador)) {
              continue;
            }

            // Crear una nueva fila
            const row = createRow(
              area,
              competencia,
              etapa,
              nivel,
              indicador,
              lastCells
            );

            // Añadir la fila al cuerpo de la tabla
            tableBody.appendChild(row);
          }
        }
      }
    }
  }


  // Función para obtener el valor de un parámetro específico de la URL
  function getParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  // Obtener el valor del parámetro 's'
  var paramValue = getParameterByName('c');

  // Verificar si el parámetro existe
  if (paramValue) {
      // Separar los valores
      var valuesToCheck = paramValue.split('|');

      // Marcar los checkboxes correspondientes
      valuesToCheck.forEach(function(value) {
          var checkbox = document.querySelector('input[type="checkbox"][name="' + value + '"]');
          if (checkbox) {
              checkbox.checked = true;
          }
      });
  }

}

function loadData(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(dataYaml => {
      // Assuming the YAML content is directly convertible to the required JavaScript object
      data = jsyaml.load(dataYaml).marco_referencia_competencia_digital_docente;
      callback(data);
    })
    .catch(error => {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
    });
}

// Cargando datos del yml:
loadData('mrcdd.yml?v=1792554736', fillTable);

// Mostrar el modal
const generarBtn = document.querySelector('.btn-generar');
generarBtn.addEventListener('click', () => {
  generarTexto();

  // Muestra el modal
  const generarModal = new bootstrap.Modal(document.getElementById('generarModal'));
  generarModal.show();

});


const resetBtn = document.querySelector('.btn-reset');
resetBtn.addEventListener('click', () => {

  // Código JavaScript para desmarcar todos los checkbox con nombres de clase específicos
  const checkboxes = document.querySelectorAll('.form-check-input.indicator-checkbox');
  checkboxes.forEach(checkbox => {
      checkbox.checked = false;
  });

  // Eliminar los parámetros GET de la URL
  const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.pushState({path: url}, '', url);

});


const shareBtn = document.querySelector('.btn-share');
shareBtn.addEventListener('click', () => {


  // Recopilar los valores de los checkboxes marcados
  var checkedValues = [];
  document.querySelectorAll('.indicator-checkbox').forEach(function(checkbox) {
      if (checkbox.checked) {
          checkedValues.push(checkbox.name);
      }
  });

  // Construir la URL
  var url = window.location.href.split('?')[0] + '?c=' + checkedValues.join('|');

  // Copiar la URL al portapapeles
  // Actualizar el atributo data-clipboard-text del botón con la URL
  document.getElementById('copyUrlButton').setAttribute('data-clipboard-text', url);

  // Inicializar y mostrar el toast
  const myToastEl = document.getElementById('toast');
  const myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
  myToast.show();

});


// Obtener los checkboxes marcados y generar el texto para el modal
function generarTexto() {
  // Crear un objeto que contenga las áreas, competencias e indicadores seleccionados
  const selectedData = {};

  // Recorrer los checkboxes seleccionados
  const checkedCheckboxes = document.querySelectorAll(
    'input.indicator-checkbox[type="checkbox"]:checked'
  );
  checkedCheckboxes.forEach(checkbox => {
    const indicador = checkbox.getAttribute('data-indicador');
    const indicadorData = checkbox.getAttribute('data-indicador-titulo');
    const nivel = checkbox.getAttribute('data-nivel');
    const competencia = checkbox.getAttribute('data-competencia');
    const competenciaData = checkbox.getAttribute('data-competencia-titulo');
    const area = checkbox.getAttribute('data-area');
    const areaData = checkbox.getAttribute('data-area-titulo');

    // Agregar el área, competencia y desempeño al objeto
    if (!Object.prototype.hasOwnProperty.call(selectedData, areaData)) {
      selectedData[areaData] = {};
    }
    if (
      !Object.prototype.hasOwnProperty.call(
        selectedData[areaData],
        competenciaData
      )
    ) {
      selectedData[areaData][competenciaData] = {};
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        selectedData[areaData][competenciaData],
        nivel
      )
    ) {
      selectedData[areaData][competenciaData][nivel] = [];
    }

    selectedData[areaData][competenciaData][nivel].push({
      area,
      areaData,
      competencia,
      competenciaData,
      nivel,
      indicador,
      indicadorData,
    });
  });

  // Limpiamos las filas de la tabla resumen (la vamos a ir rellenando ahora)
  const cells = document.querySelectorAll('td.cell-r0');
  cells.forEach(cell => cell.textContent = '');

  // Utilizar el objeto creado para generar el texto deseado
  let texto = '';
  for (const area in selectedData) {
    texto += `<h6>Área de ${area}</h6>`;
    const competencias = selectedData[area];
    texto += '<ul>';
    for (const competencia in competencias) {
      const niveles = competencias[competencia];
      for (const vNivel in niveles) {
        const nivel = niveles[vNivel];

        // siempre va haber al menos un nivel seleccionado
        texto += '<li>';
        texto += `<span style="font-weight:bold;">${nivel[0].nivel} de la competencia ${nivel[0].competencia}.</span> ${competencia} porque contribuye a trabajar `;

        // Asignamos el valor en la tabla resumen
        const cell = document.querySelector(`.a${nivel[0].area}c${nivel[0].competencia[2]}`);
        if (cell) {
            cell.textContent = vNivel;
        }

        if (nivel.length == 1) {
          texto += `<span style="font-weight:bold;"> con el indicador ${nivel[0].indicador}.</span> ${nivel[0].indicadorData}.`;
        } else {
          texto +=
            '<span style="font-weight:bold;"> con los indicadores </span>';
          let i = 0;
          for (const indicador of nivel) {
            let ending = '';
            if (i === nivel.length - 1) {
              texto += ' y ';
              ending = '.';
            } else if (i > 0) {
              texto += '; ';
            }

            texto += `<span style="font-weight:bold;">${indicador.indicador}.</span> ${indicador.indicadorData}${ending}`;
            i += 1;
          }
        }
      }
      texto += '</li>';
    }
    texto += '</ul>';
  }

  const modalBody = document.querySelector('.resume-text');
  modalBody.innerHTML = texto;

  // Clonar y actualizar la tabla resumen
  const resumenTable = document.getElementById('resumen').cloneNode(true);
  document.querySelector('.resume-table').innerHTML = '';
  document.querySelector('.resume-table').appendChild(resumenTable);
}

new ClipboardJS('.btn-primary');
// Inicializar Clipboard.js en el botón
new ClipboardJS('#copyUrlButton');

// Muestra el modal si estamos en un movil
document.addEventListener('DOMContentLoaded', function () {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    const mobileWarningModal = new bootstrap.Modal(
      document.getElementById('mobileWarningModal')
    );
    mobileWarningModal.show();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  // Descargar botón
  const downloadButton = document.getElementById('download-button');
  downloadButton.addEventListener('click', function () {
    html2canvas(document.getElementById('resumen'), {
      scale: 1.5,
      width: document.querySelector('.resume-table').offsetWidth,
      height: document.querySelector('.resume-table').offsetHeight,
    }).then(function (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'tabla_resume.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Evento de búsqueda de texto
  const searchBox = document.getElementById('search');
  searchBox.addEventListener('keyup', function () {
    fillTable(data, tableBody);
  });

  // Cambio en los checkboxes de filtro
  const checkboxes = document.querySelectorAll('.check-filter');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      fillTable(data, tableBody);
    });
  });
});
