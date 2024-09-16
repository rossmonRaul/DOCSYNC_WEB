import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Topbar from "../../../components/topbar/Topbar";
import '../../../css/general.css'

// Componente funcional que representa la página de carga de archivops
function CargaScanner() {
  return (
    <>
      <div className="">
        <BordeSuperior />
        <Topbar />
        <div className="content">
          <h1>Cargar desde el scanner</h1>
        </div>
      </div>
    </>
  );
}

export default CargaScanner;