import { useState, ChangeEvent, FormEvent } from "react";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Topbar from "../../../components/topbar/Topbar";
import "../../../css/general.css";
import { Button, Form } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaUpload } from "react-icons/fa";

interface Archivo {
  id: Number;
  archivo: File;
}

// Componente funcional que representa la página de carga de archivops
function CargarArchivos() {
  const [files, setFiles] = useState<File[]>([]);
  const [idArchivoGenerado, setIdArchivoGenerado] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);

  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "Seleccionar",
      name: "Seleccionar",
      selector: (row: Archivo) => (
        <Form.Check
          type="checkbox"
          checked={listaArchivosTablaSeleccionados.some((r) => r.id === row.id)}
          onChange={() => handleFilaSeleccionada(row)}
        />
      ),
      head: "Seleccionar",
      sortable: false,
    },
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: { archivo: File }) => row.archivo.name,
      head: "Nombre",
      sortable: true,
    },
    {
      id: "tipo",
      name: "Tipo",
      selector: (row: { archivo: File }) => row.archivo.type,
      head: "Tipo",
      sortable: true,
    },
  ];

  // Maneja el cambio de archivos
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files); // Convierte FileList a un array
      setFiles(selectedFiles); // Actualiza el estado con el array de archivos

      let consecutivo = idArchivoGenerado;
      let archivosAux: Archivo[] = [];
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((element) => {
          const existe = listaArchivosTabla.some(
            (a) => a.archivo.name === element.name
          );
          if (!existe) {
            const file: Archivo = {
              id: consecutivo++,
              archivo: element,
            };
            archivosAux.push(file);
            consecutivo = consecutivo++;
          } else {
            setMensajeRespuesta({
              indicador: 3,
              mensaje: "El archivo ya está seleccionado",
            });
            setShowAlert(true);
          }
        });
        setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
        setIdArchivoGenerado(consecutivo);
      }
    }
  };

  const handleFilaSeleccionada = (row: Archivo) => {
    if (listaArchivosTablaSeleccionados.some((r) => r.id === row.id)) {
      setListaArchivosTablaSeleccionados(
        listaArchivosTablaSeleccionados.filter((r) => r.id !== row.id)
      );
    } else {
      setListaArchivosTablaSeleccionados([
        ...listaArchivosTablaSeleccionados,
        row,
      ]);
    }
  };

  const cargarArchivos = (event: FormEvent) => {
    event.preventDefault();
    console.log(listaArchivosTablaSeleccionados);
  };

  return (
    <>
      {showAlert && (
        <AlertDismissible
          indicador={mensajeRespuesta.indicador}
          mensaje={mensajeRespuesta.mensaje}
          setShow={setShowAlert}
        />
      )}
      <div className="">
        <BordeSuperior />
        <Topbar />
        <div className="content">
          <h1 style={{ marginBottom: "50px" }}>Cargar archivos</h1>
          <Form onSubmit={cargarArchivos}>
            <Form.Group>
              <Form.Label>Selecciona un archivo</Form.Label>
              <Form.Control multiple type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button type="submit" className="mt-3" variant="primary">
              <FaUpload className="me-2" size={20} />
              Cargar archivos seleccionados
            </Button>
          </Form>
          <h2 className="mt-4">Previsualización</h2>
          <Grid
            gridHeading={encabezadoArchivo}
            gridData={listaArchivosTabla}
          ></Grid>
        </div>
      </div>
    </>
  );
}

export default CargarArchivos;
