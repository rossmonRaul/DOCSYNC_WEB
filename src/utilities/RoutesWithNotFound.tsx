import { Route, Routes } from "react-router-dom";

// Propiedades del componente
interface Props {
    children: JSX.Element[] | JSX.Element;
}

// Componente principal
function RoutesWithNotFound({children} : Props) {
  // Devolver un mensaje cuando no encuentra una pagina
  return (
    <Routes>
        {children}
        <Route path="*" element={<div></div>} />
    </Routes>
  );
}
export default RoutesWithNotFound