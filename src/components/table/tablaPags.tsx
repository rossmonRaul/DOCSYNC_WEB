import React, { useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaPlus } from "react-icons/fa";

// Tabla con funciones para paginación
export const GridPags: React.FC<any> = ({
  gridHeading,
  fetchData,
  selectableRows,
  pending,
  setFilaSeleccionada,
  idBuscar,
  filterColumns,
  rowModal,
  handle,
  buttonVisible,
  botonesAccion,
  totalRows
}) => {
  const [id, setId] = useState(-1);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // Filas por página

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchData(page, rowsPerPage);
      setRecords(response.data);
    };
    loadData();
  }, [page, rowsPerPage, fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reinicia la página al cambiar el tamaño de página
  };

  const onRowSelected = (row: any) => {
    if (row.selectedCount == 1) SeleccionarFila(row.selectedRows[0]);
    else DesSeleccionarFila();
  };

  const onRowClicked = (row: any) => {
    if (setFilaSeleccionada) {
      //este if se valida para cuando son filas que siempre levantan un modal al darle click, caso contrario en el grid la propiedad no debe especificarse
      if (rowModal) {
        setId(row[idBuscar]);
        setFilaSeleccionada(row);
      } else {
        if (row[idBuscar] != id) SeleccionarFila(row);
        else {
          DesSeleccionarFila();
        }
      }
    }
  };

  const SeleccionarFila = (fila: any) => {
    if (setFilaSeleccionada) {
      const tempId = fila[idBuscar];
      if (id !== tempId) {
        setId(tempId);
        setFilaSeleccionada(fila);
      }
    }
  };

  const DesSeleccionarFila = () => {
    if (id != -1) {
      setId(-1);
      setFilaSeleccionada({});
    }
  };

  function handleFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const newData = records.filter((row: any) => {
      return filterColumns.some((column: any) => {
        const value = row[column] || "";
        return value
          .toString()
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      });
    });

    setRecords(newData);
  }

  // Estilos
  const customStyles = {
    headCells: {
      style: {
        fontSize: "20px",
        color: "#9E0000",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "#9E0000",
        borderBottomColor: "#FFFFFF",
        borderRadius: "10px",
        color: "#fff",
        outline: "1px solid #FFFFFF",
      },
      selectedHighlightStyle: {
        borderColor: "#FFFFFF",
        borderBottomColor: "#FFFFFF",
        borderRadius: "10px",
        outline: "1px solid #FFFFFF",
      },
    },
    pagination: {
      style: {
        fontSize: "12px",
      },
    },
  };

  return (
    <>
      {filterColumns && (
        <div
          className="mb-6 mt-0 d-flex justify-content-between align-items-center"
          style={{ marginLeft: 10 }}
        >
          <div>
            {buttonVisible && (
              <Button
                variant="primary"
                onClick={handle}
                className="btn-crear px-2"
              >
                <FaPlus className="me-2" size={24} />
                Agregar
              </Button>
            )}
            {botonesAccion &&
              botonesAccion.map(
                (accionBotones: any, index: number) =>
                  accionBotones?.condicion && (
                    <Button
                      key={index}
                      variant="primary"
                      onClick={accionBotones?.accion}
                      className={
                        accionBotones?.clase
                          ? accionBotones?.clase
                          : "ms-3 btn-crear"
                      }
                    >
                      {accionBotones?.icono}
                      {accionBotones?.texto}
                    </Button>
                  )
              )}
          </div>

          <div className={buttonVisible ? "" : "ms-auto"}>
            <input
              className="form-control"
              type="search"
              placeholder="Buscar"
              onChange={handleFilter}
            />
          </div>
        </div>
      )}

      <DataTable
        className="table table-sm mt-4"
        customStyles={customStyles}
        columns={gridHeading}
        data={records}
        selectableRows={selectableRows}
        fixedHeader
        selectableRowsSingle
        pagination
        paginationServer // Indica que la paginación es desde el servidor
        paginationTotalRows={totalRows} // Total de filas desde el servidor
        onChangePage={handlePageChange} // Llama a la función para cambiar de página
        onChangeRowsPerPage={handleRowsPerPageChange} // Llama a la función para cambiar filas por página
        paginationComponentOptions={paginationComponentOptions}
        striped
        noHeader
        dense={true}
        noDataComponent="No hay datos para mostrar"
        highlightOnHover
        onRowClicked={onRowClicked}
        onSelectedRowsChange={onRowSelected}
        pointerOnHover
        selectableRowsHighlight
        progressPending={pending}
        progressComponent={
          <>
            <Spinner animation="border" variant="primary" />
            &nbsp;Cargando...
          </>
        }
        selectableRowSelected={(row) => row[idBuscar] == id}
      />
    </>
  );
};
