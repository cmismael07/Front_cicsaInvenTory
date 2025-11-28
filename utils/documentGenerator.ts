

import { Usuario, Equipo } from '../types';
import Swal from 'sweetalert2';

/**
 * Genera el documento de asignación (Carta Responsiva + Anexo 1)
 */
export const generateAssignmentDocument = (usuario: Usuario, equipo: Equipo) => {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    Swal.fire({
      title: 'Ventana Emergente Bloqueada',
      text: 'Por favor permite las ventanas emergentes (pop-ups) para ver el documento de asignación.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return;
  }

  const today = new Date();
  const fechaAsignacion = `${today.getDate()} de ${today.toLocaleString('es-ES', { month: 'long' })} del ${today.getFullYear()}`;
  const fechaCorta = today.toLocaleDateString('es-ES');

  const serieCargador = equipo.serie_cargador || 'N/A';
  const observacionesEquipo = equipo.observaciones || 'Sin observaciones';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Documentos de Asignación</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; color: #000; margin: 0; }
          
          .page-break { page-break-after: always; }
          .text-center { text-align: center; }
          .text-justify { text-align: justify; }
          .text-bold { font-weight: bold; }
          .mb-2 { margin-bottom: 10px; }
          .mb-4 { margin-bottom: 20px; }
          
          /* --- ANEXO 1 STYLES --- */
          .anexo-container { padding: 10px; }
          .anexo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .logo-img { max-height: 60px; width: auto; } 
          .anexo-label { font-weight: bold; font-size: 10pt; margin-top: 10px; text-align: right;}
          .anexo-title { text-align: center; font-weight: bold; text-decoration: underline; margin: 20px 0; font-size: 11pt; text-transform: uppercase; }
          .anexo-footer { margin-top: 60px; }
          .signature-line { border-top: 1px solid #000; width: 250px; padding-top: 5px; font-weight: bold; margin-bottom: 5px;}

          /* --- CARTA RESPONSIVA STYLES --- */
          .responsiva-container { padding: 10px; }
          
          table.header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table.header-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: middle; }
          .header-logo-cell { width: 20%; }
          .header-title-cell { width: 50%; font-weight: bold; font-size: 11pt; }
          .header-info-cell { width: 30%; font-size: 9pt; text-align: left; }

          table.eq-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt; }
          table.eq-table th { border: 1px solid #000; background-color: #f0f0f0; padding: 5px; font-weight: bold; text-align: center; }
          table.eq-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: top; }

          .responsiva-section-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
          ul.responsiva-list { padding-left: 20px; margin: 5px 0 15px 0; }
          ul.responsiva-list li { margin-bottom: 4px; text-align: justify; }

          .footer-note { font-size: 8pt; text-align: center; margin-top: 40px; font-style: italic; }
        </style>
      </head>
      <body>
        
        <!-- ================= PAGE 1: CARTA RESPONSIVA ================= -->
        <div class="responsiva-container">
          <table class="header-table">
            <tr>
              <td class="header-logo-cell">
                 <img src="/logoAnexoCarso.png" style="max-width:100px; max-height:50px;" alt="Logo" />
              </td>
              <td class="header-title-cell">
                SISTEMA DE GESTIÓN<br>
                PROCISA ECUADOR S.A<br><br>
                <span style="font-weight:normal; font-size:10pt;">FORMATO PARA CARTA RESPONSIVA DE EQUIPO</span>
              </td>
              <td class="header-info-cell">
                <strong>Código:</strong> FR-SI-12<br>
                <strong>Fecha de Emisión:</strong> ${fechaCorta}<br>
                <strong>Página 1 de 1</strong>
              </td>
            </tr>
          </table>

          <p class="text-justify mb-4" style="font-size: 9pt;">
            Recibí el siguiente equipo de cómputo propiedad de PROCISA ECUADOR S.A. para su uso durante la jornada laboral y actividades competentes a mi trabajo, dentro y fuera de las instalaciones de la empresa.
          </p>

          <table class="eq-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Descripción</th>
                <th>No. De Serie</th>
                <th>Cargador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${equipo.tipo_nombre}</td>
                <td>
                  ${equipo.marca} ${equipo.modelo}<br>
                  <span style="font-size:8pt; color:#333;">${observacionesEquipo}</span>
                </td>
                <td>${equipo.numero_serie}</td>
                <td>${serieCargador}</td>
              </tr>
            </tbody>
          </table>

          <div class="mb-4" style="font-size: 9pt;">
            Con la presente el usuario: <strong>${usuario.nombre_completo}</strong> con No. de empleado: <strong>${usuario.numero_empleado || 'S/N'}</strong><br>
            Perteneciente al área de: <strong>${usuario.departamento_nombre || 'General'}</strong> se responsabiliza de su correcto uso y cuidado. Además de aplicar las siguientes recomendaciones:
          </div>

          <div class="responsiva-section-title">Para equipos de cómputo</div>
          <ul class="responsiva-list">
            <li>Cuidar el uso del equipo en lugares públicos, bloqueando la sesión cuando esté desatendido.</li>
            <li>Antes de ingresar a un dispositivo de almacenamiento deberá ser analizado por el antivirus, el cual en ningún caso se podrá desactivar.</li>
            <li>Se deberá utilizar ONEDRIVE para respaldar la información.</li>
            <li>Se deberá minimizar la conexión en redes públicas o inseguras.</li>
            <li>El equipo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
            <li>Está prohibida la instalación de cualquier software gratuito o de origen desconocido.</li>
            <li>La información que sea procesada en el equipo deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
            <li>Será necesario que el mantenimiento del equipo sea solicitado al área de Tecnología.</li>
          </ul>

          <div class="responsiva-section-title">Otros activos</div>
          <ul class="responsiva-list">
            <li>Cuidar el uso del activo en lugares públicos.</li>
            <li>El activo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
            <li>En el caso de activos que procesen o almacenen información deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
          </ul>

          <div class="anexo-footer">
             <div style="border-top: 1px solid #000; width: 250px; padding-top: 5px; margin-top:40px;"></div>
             <div class="text-bold">${usuario.nombre_completo}</div>
             <div>${usuario.departamento_nombre || ''}</div>
          </div>
          <div class="footer-note">COPIA NO CONTROLADA UNA VEZ IMPRESA</div>
        </div>

        <div class="page-break"></div>

        <!-- ================= PAGE 2: ANEXO 1 ================= -->
        <div class="anexo-container">
          <div class="anexo-header">
            <img src="/logoAnexoCarso.png" class="logo-img" alt="Logo" onerror="this.style.display='none';" />
            <div class="anexo-label">Anexo 1</div>
          </div>

          <div class="anexo-title">
            CARTA DE NO INCLUSION DE SOFTWARE<br>
            DECLARACION DEL EMPLEADO
          </div>

          <div class="mb-4">Guayaquil., ${fechaAsignacion}</div>
          <div class="mb-4 text-bold">Sr./ Sra./ Srita.: ${usuario.nombre_completo}</div>
          <div class="text-justify">
            <p>PRESENTE.</p>
            <p>Con motivo de los conocimientos de que usted dispone en materia de uso de equipo y programas de cómputo y en virtud de que esta empresa posee su propio equipo y frecuentemente adquiere ó desarrolla programas y material diverso de cómputo, a los cuales usted tiene ó puede llegar a tener acceso en el desempeño de sus funciones dentro de la empresa, hacemos de su conocimiento lo siguiente:</p>
            <p>1. Las leyes de la materia y los tratados internacionales prohíben el uso de los programas de cómputo y de cualquier información al respecto, sin el consentimiento de su legítimo propietario ó licenciatario.</p>
            <p>2. Lo anterior implica que usted deberá utilizar única y exclusivamente los equipos y programas de cómputo que la empresa proporcione para el desempeño de sus funciones dentro de la misma empresa.</p>
            <p>3. En consecuencia, deberá usted abstenerse de utilizar y/o ingresar a las instalaciones y/o equipo de cómputo de la empresa programas de cómputo propiedad de terceros que no hayan sido adquiridos por la empresa, así como copiar al equipo de cómputo de la Empresa, archivos no utilizables en el desempeño de sus funciones, por ejemplo: protectores de pantalla, mp3, videojuegos, fotografías, etc.</p>
            <p>4. Asimismo, deberá usted abstenerse de copiar y sustraer cualquier programa adquirido ó desarrollado por la empresa, ya que estos son propiedad exclusiva de la misma.</p>
            <p>5.- Deberá mantener estricta confidencialidad de la información de la Empresa que en el desempeño de sus funciones conozca y en ningún caso y bajo ningún concepto podrá usted divulgarla.</p>
            <p>6. Igualmente, le está prohibido permitir que terceras personas realicen las conductas anteriores ó tengan acceso, de cualquier manera, al equipo de programas de propiedad de la empresa.</p>
            <p>7. La contravención de estas disposiciones será causa de rescisión al contrato de trabajo celebrado entre la empresa y usted, sin que tal medida le exonere de la responsabilidad personal en que llegará a incurrir de acuerdo con las leyes y tratados internacionales aplicables.</p>
          </div>
          <div class="anexo-footer">
            <div class="signature-line">Nombre y Firma de Conformidad</div>
            <div>${usuario.nombre_completo}</div>
            <div>${usuario.departamento_nombre || 'Departamento no asignado'}</div>
          </div>
        </div>

        <script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>
      </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Genera la Orden de Servicio (Mantenimiento)
 */
export const generateServiceOrder = (
    equipo: Equipo, 
    formData: { tipo: string, proveedor: string, descripcion: string, costo: number }
) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      Swal.fire('Ventana Bloqueada', 'Habilita pop-ups.', 'warning');
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES');
    const isCorrective = formData.tipo === 'Correctivo';
    
    // Checkmarks
    const chkNormal = '☐';
    const chkUrgente = '☐'; // Could be logic driven
    const chkInterno = '☐';
    const chkExterno = '☑'; // Assuming provider implies external often, but logic can vary
    const chkCorr = isCorrective ? '☑' : '☐';
    const chkPrev = !isCorrective ? '☑' : '☐';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Orden de Servicio</title>
        <style>
          @page { size: A4 portrait; margin: 1cm; }
          body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          td, th { border: 2px solid #000; padding: 3px 5px; vertical-align: middle; }
          .no-border { border: none !important; }
          .bold { font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .header-title { font-size: 16px; font-weight: bold; text-align: center; border: none; }
          
          /* Header Layout */
          .header-container { display: flex; border: 2px solid #000; margin-bottom: 2px; }
          .logo-box { width: 150px; padding: 5px; border-right: 2px solid #000; display: flex; align-items: center; justify-content: center; }
          .title-box { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; }
          
          .info-table td { border: none; padding: 2px 5px; }
          .info-section { border: 2px solid #000; padding: 2px; margin-bottom: 2px; }
          
          .section-header { background-color: #ddd; font-weight: bold; text-align: center; padding: 2px; border: 2px solid #000; border-bottom: none; }
          
          .input-line { border-bottom: 1px solid #000; display: inline-block; min-width: 50px; }
          
          .grid-table th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
          .grid-table td { height: 15px; }
          
          .blue-header { background-color: #3b82f6; color: white; font-weight: bold; text-align: center; border: 1px solid #000; }
          .blue-row td { border: 1px solid #000; }
          
          .footer-section { margin-top: 10px; border: 2px solid #000; padding: 5px; min-height: 80px; }
          .signatures { display: flex; justify-content: space-around; margin-top: 40px; margin-bottom: 10px; }
          .sig-box { text-align: center; width: 40%; }
          .sig-line { border-top: 2px solid #000; margin-top: 30px; }
          
          .fr-code { font-size: 8px; text-align: right; margin-top: 5px; }
        </style>
      </head>
      <body>
        
        <!-- Header -->
        <div class="header-container">
            <div class="logo-box">
                <img src="/logoAnexoCarso.png" alt="CARSO" style="max-width:100%;" />
            </div>
            <div class="title-box">Orden de Servicio</div>
        </div>

        <!-- Info Section 1 -->
        <div class="info-section">
            <table class="no-border" style="border: none;">
                <tr>
                    <td class="no-border" style="width: 15%;"><strong>Area / Depto.:</strong></td>
                    <td class="no-border" style="width: 35%; border-bottom: 1px solid #000 !important;">${equipo.ubicacion_nombre || ''}</td>
                    <td class="no-border" style="width: 10%;"><strong>Fecha:</strong></td>
                    <td class="no-border" style="width: 40%; border-bottom: 1px solid #000 !important;">${dateStr}</td>
                </tr>
                <tr>
                   <td class="no-border"><strong>Prioridad:</strong></td>
                   <td class="no-border" colspan="3">
                        Normal ${chkNormal} &nbsp;&nbsp; Urgente ${chkUrgente}
                   </td>
                </tr>
                <tr>
                    <td class="no-border"><strong>Maquina o Equipo Afectado:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important;">${equipo.tipo_nombre} ${equipo.marca} ${equipo.modelo} (${equipo.codigo_activo})</td>
                    <td class="no-border"><strong>Km / Horómetro:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important;"></td>
                </tr>
            </table>
        </div>
        
        <!-- Description -->
        <div class="info-section" style="min-height: 80px;">
             <table class="no-border" style="border: none;">
                <tr>
                    <td class="no-border" style="width: 25%;"><strong>Descripción del problema o falla:</strong></td>
                    <td class="no-border" style="width: 45%;"></td>
                    <td class="no-border" style="width: 10%; text-align: right;"><strong>No. Orden:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important; width: 20%;">${Math.floor(Math.random() * 10000)}</td>
                </tr>
             </table>
             <div style="padding: 5px;">${formData.descripcion}</div>
             <br><br>
             <div style="text-align: right; padding-right: 10px;"><strong>Solicitado por:</strong> ${equipo.responsable_nombre || 'N/A'}</div>
        </div>

        <!-- Maint Type -->
        <div class="info-section">
            <table class="no-border" style="border: none;">
                <tr>
                    <td class="no-border" style="width: 15%;"><strong>Mantenimiento:</strong></td>
                    <td class="no-border" style="width: 35%;">Interno ${chkInterno} &nbsp;&nbsp; Externo ${chkExterno}</td>
                    <td class="no-border" style="width: 15%;"><strong>Servicio:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important;">${formData.proveedor}</td>
                </tr>
                <tr>
                    <td class="no-border"></td>
                    <td class="no-border"></td>
                    <td class="no-border"><strong>Fecha de inicio:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important;">${dateStr}</td>
                </tr>
                <tr>
                    <td class="no-border"><strong>Tipo de mtto:</strong></td>
                    <td class="no-border">Correctivo ${chkCorr} &nbsp;&nbsp; Preventivo ${chkPrev}</td>
                    <td class="no-border"><strong>Asignado a:</strong></td>
                    <td class="no-border" style="border-bottom: 1px solid #000 !important;">CHRISTIAN CORDERO</td>
                </tr>
            </table>
        </div>

        <!-- Trabajos Efectuados -->
        <table class="grid-table" style="margin-top: 2px;">
            <tr>
                <th style="width: 80%;">Trabajos efectuados:</th>
                <th style="width: 10%;">Cantidad</th>
                <th style="width: 10%;">Total</th>
            </tr>
            <!-- Rows -->
            ${Array.from({length: 8}).map((_, i) => `
            <tr>
                <td>${i === 0 ? formData.descripcion : ''}</td>
                <td></td>
                <td></td>
            </tr>
            `).join('')}
             <tr>
                <td style="border: 2px solid #000; font-weight: bold;">Fecha de Termino:</td>
                <td style="border: 2px solid #000; font-weight: bold;">Total</td>
                <td style="border: 2px solid #000;">${formData.costo > 0 ? formData.costo.toFixed(2) : '0'}</td>
            </tr>
        </table>

        <!-- Materiales -->
        <table class="grid-table blue-row" style="margin-top: 2px;">
            <tr>
                <th class="blue-header" style="width: 5%;">No</th>
                <th class="blue-header" style="width: 45%;">Materiales utilizados</th>
                <th class="blue-header" style="width: 50%;">Observaciones</th>
            </tr>
            ${Array.from({length: 10}).map((_, i) => `
            <tr>
                <td style="text-align: center;">${i + 1}</td>
                <td></td>
                <td></td>
            </tr>
            `).join('')}
        </table>

        <!-- Footer -->
        <div class="footer-section">
            <strong>Datos del Proveedor</strong>
            <br><br>
            ${formData.proveedor}
        </div>

        <div style="margin-top: 5px; font-size: 9px; text-align: center;">
            En caso de que el equipo o maquinaría presente algun tipo de falla, deberá notificarlo al responsable de mantenimiento para verificar las condiciones a seguir.
        </div>

        <div class="signatures">
            <div class="sig-box">
                <strong>Vo. Bo. Solicitante</strong>
                <div class="sig-line"></div>
            </div>
            <div class="sig-box">
                <strong>Autoriza</strong>
                <div class="sig-line"></div>
            </div>
        </div>
        
        <div class="fr-code">FR-MT-03 Rev.01</div>

        <script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }</script>
      </body>
    </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Imprime un reporte con diseño HTML personalizado
 */
export const printCustomHTML = (htmlContent: string, title: string) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    Swal.fire('Ventana Bloqueada', 'Por favor habilita las ventanas emergentes para imprimir.', 'warning');
    return;
  }
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; color: #334155; padding: 40px; background-color: #fff; }
          .report-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .report-header h1 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 700; }
          .report-header p { margin: 0; color: #64748b; font-size: 13px; margin-top: 5px; }
          
          /* Table Styles */
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px 12px; background-color: #f8fafc; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; font-size: 10px; }
          td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: top; }
          tr:last-child td { border-bottom: none; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            @page { margin: 1.5cm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          
          ${htmlContent.includes('<style>') ? '' : ''}
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <h1>${title}</h1>
            <p>Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          </div>
          <div style="font-size: 12px; color: #94a3b8;">Sistema InvenTory</div>
        </div>
        
        <div class="report-content">
          ${htmlContent}
        </div>
        
        <script>
           window.onload = function() { setTimeout(function() { window.print(); }, 800); }
        </script>
      </body>
    </html>
  `;
  
  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

/**
 * Genera una vista previa genérica para reportes (tabla simple HTML)
 */
export const openPrintPreview = (data: any[], title: string) => {
  if (data.length === 0) {
    Swal.fire('Sin Datos', 'No hay datos para generar la vista previa.', 'info');
    return;
  }

  const headers = Object.keys(data[0]);
  const tableHtml = `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${data.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;

  printCustomHTML(tableHtml, title);
};