import React, { useEffect, useState } from 'react';
import '../../css/TableColours.css'
import { Table } from 'reactstrap'

// Interface que define la estructura de una columna de la tabla.
interface Column {
    key: string;
    header: string;
    actions?: boolean;
}

// Interface que define la estructura de una fila de la tabla.
interface TableRow {
    [key: string]: any;
    color: string;
}

// Propiedades esperadas por el componente TableResponsive.
interface TableProps {
    columns: Column[]; // Columnas de la tabla
    data: TableRow[]; // Datos a mostrar en la tabla
    itemsPerPage?: number; // Número de elementos por página (opcional, por defecto es 5)
}

const TableResponsiveColours: React.FC<TableProps> = ({ columns, data, itemsPerPage: defaultItemsPerPage = 5 }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

    // Calcular el número total de elementos y de páginas
    const totalItems: number = data.length;
    const totalPages: number = Math.ceil(totalItems / itemsPerPage);

    // Calcular el índice del primer y último elemento de la página actual
    const indexOfLastItem: number = currentPage * itemsPerPage;
    const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
    const [currentData, setCurrentData] = useState<TableRow[]>(data);
    const currentItems: TableRow[] = currentData.slice(indexOfFirstItem, indexOfLastItem);

    //para devolver la tabla a la primera pagina
    useEffect(() => {
        setCurrentData(data);
        setCurrentPage(1);
    }, [data]);

    // Función para cambiar a una página específica
    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Manejar el cambio en el número de elementos por página
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Resetear a la primera página cuando cambia el número de elementos por página
    };

    return (
        <div className='table-container'>
            <div className='registros-pagina'>
                <span>Registros por página: </span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>
            </div>
            <div >
                <div>
                    <Table responsive>
                        <thead>
                            <tr>
                                {columns.map((column: Column, index: number) => (
                                    <th key={index}>{column.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item: TableRow, rowIndex: number) => (
                                <tr key={rowIndex}>
                                    {columns.map((column: Column, colIndex: number) => (
                                        <td key={colIndex} style={{ color: colIndex >= columns.length - 2 ? item.color : 'inherit' }}>
                                        {item[column.key]}
                                    </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            {totalItems > itemsPerPage && (
                <div className='pagination'>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={currentPage === 1 ? 'btn-disabledprevious' : 'btn-previous'}>
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={currentPage === totalPages ? 'btn-disablednext' : 'btn-next'}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>

    );
};

export default TableResponsiveColours;
