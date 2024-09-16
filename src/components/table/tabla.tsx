import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";

export const Grid: React.FC<any> = ({
  gridHeading,
  gridData,
  selectableRows,
  pending,
  setFilaSeleccionada,
  idBuscar,
  filterColumns,
  className,
  rowModal,
}) => {
  const [id, setId] = useState(-1);
  const [records, setRecords] = useState([]);

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  useEffect(() => {
    setRecords(gridData);
  }, [gridData]);

  const onRowSelected = (row: any) => {
    if (row.selectedCount == 1) SeleccionarFila(row.selectedRows[0]);
    else DesSeleccionarFila();
  };

  const onRowClicked = (row: any) => {
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
  };

  const SeleccionarFila = (fila: any) => {
    const tempId = fila[idBuscar];
    if (id !== tempId) {
      setId(tempId);
      setFilaSeleccionada(fila);
    }
  };

  const DesSeleccionarFila = () => {
    if (id != -1) {
      setId(-1);
      setFilaSeleccionada({});
    }
  };

  function handleFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const newData = gridData.filter((row: any) => {
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
        color:"#fff",
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
          className={
            className ? className : "row col-12 row justify-content-end"
          }
          style={{ padding: 0, margin: 0 }}
        >
          <div className="col-3 row">
            <input
              className="form-control mb-2"
              type="search"
              placeholder="Buscar"
              onChange={handleFilter}
            />
          </div>
        </div>
      )}
      <DataTable
        className="table table-sm mt-2"
        customStyles={customStyles}
        columns={gridHeading}
        data={records}
        selectableRows={selectableRows}
        fixedHeader
        selectableRowsSingle
        pagination
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
