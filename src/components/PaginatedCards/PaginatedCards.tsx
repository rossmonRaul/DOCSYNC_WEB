import { useEffect, useState } from "react";

export const PaginatedCard: React.FC<any> = ({
  children,
  totalPages,
  fetchData,
}) => {
  const [page, setPage] = useState(1); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // Filas por página
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

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {children}
      </div>

      {/* paginacion */}
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label
            htmlFor="rowsPerPage"
            style={{ marginRight: "8px", fontWeight: "bold", fontSize: "14px" }}
          >
            Filas por página:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 8px" }}>
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </>
  );
};
