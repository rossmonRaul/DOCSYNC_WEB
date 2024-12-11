import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

export const PaginatedCard: React.FC<any> = ({
  children,
  totalRows,
  fetchData,
  filterColumns,
  handle,
  buttonVisible,
  botonesAccion,
  data,
  setData,
}) => {
  const [page, setPage] = useState(1); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // Filas por página
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchData(page, rowsPerPage);
    };
    loadData();
  }, [page, rowsPerPage, fetchData]);

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  function handleFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const newData = data.filter((row: any) => {
      return filterColumns.some((column: any) => {
        const value = row[column] || "";
        return value
          .toString()
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      });
    });
    setData(newData);
  }

  return (
    <>
      {filterColumns && (
        <div
          className="mb-6 mt-0 d-flex justify-content-between align-items-center"
          style={{ marginLeft: 10, marginBottom:20 }}
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginLeft:25 }}>
        {children}
      </div>

      {/* Paginación */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "right",
          alignItems: "center",
          padding: "8px 16px",
          borderTop: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {/* Selector de filas por página */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <label
            htmlFor="rowsPerPage"
            style={{
              marginRight: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Filas por página:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
          </select>
        </div>

        {/* Controles de paginación */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Botón Primera Página */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            style={{
              padding: "6px 12px",
              marginRight: "4px",
              background: page === 1 ? "#ddd" : "#497494",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {"<<"}
          </button>

          {/* Botón Página Anterior */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            style={{
              padding: "6px 12px",
              marginRight: "4px",
              background: page === 1 ? "#ddd" : "#497494",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {"<"}
          </button>

          {/* Indicador de página */}
          <span
            style={{
              margin: "0 8px",
              fontWeight: "bold",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Página {page} de {totalPages}
          </span>

          {/* Botón Página Siguiente */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: "6px 12px",
              marginRight: "4px",
              background: page === totalPages ? "#ddd" : "#497494",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {">"}
          </button>

          {/* Botón Última Página */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            style={{
              padding: "6px 12px",
              background: page === totalPages ? "#ddd" : "#497494",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {">>"}
          </button>
        </div>
      </div>
    </>
  );
};
