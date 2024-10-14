import * as XLSX from 'xlsx-js-style';

export interface Column {
    key: string;
    header: string;
    width?: number;
} 

interface ExportToExcelProps {
    reportName: string;
    data: any[];
    columns: Column[];
    userName: string;
    dynamicHeaders?: string[][]; 
}

export const exportToExcel = ({ reportName, data, columns, userName, dynamicHeaders = [] }: ExportToExcelProps) => {
    try {
        // Crear una hoja de cálculo vacía
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Configurar las longitudes de las columnas usando la propiedad `width` de cada columna
        let propiedades: XLSX.ColInfo[] = columns.map(col => ({ width: col.width || 15 }));
        ws["!cols"] = propiedades;

        const lastColumnLetter = XLSX.utils.encode_col(columns.length - 1);

        // Definir el rango de celdas a fusionar (si aplica)
        ws["!merges"] = [
            XLSX.utils.decode_range(`A1:${lastColumnLetter}1`),
        ];

        // Agregar los dynamicHeaders antes de los datos
        XLSX.utils.sheet_add_aoa(ws, dynamicHeaders, { origin: 'A1' });

        // Determinar la fila donde agregar los encabezados según los dynamicHeaders
        const dynamicHeadersLength = dynamicHeaders.length;
        const headerRow = dynamicHeadersLength + 1;

        // Agregar los encabezados de las columnas
        const headers = columns.map(col => col.header);
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${headerRow}` });

        // Añadir los datos a la hoja de cálculo
        data.forEach((dataRow, index) => {
            const rowData = columns.map(col => dataRow[col.key] ?? '');
            const rowIndex = index + dynamicHeadersLength + 2;
            XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${rowIndex}` });

            // Aplicar estilo a encabezados
            const headerRange = XLSX.utils.decode_range(`A${headerRow}:${lastColumnLetter}${headerRow}`);
            for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    font: { sz: 12, bold: true, color: { rgb: "ffffff" } },
                    fill: { patternType: "solid", fgColor: { rgb: "9E0000" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, reportName); // nombre del tab

        const currentDate = getFormattedDateTime().slice(0, -9); // fecha actual
        const fileName = `${reportName}_${userName}_${currentDate}.xlsx`;

        XLSX.writeFile(wb, fileName); 

    } catch (error) {
        console.error('Error al exportar a Excel:', error);
    }
};


// Función para obtener la fecha y hora formateadas
const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};
