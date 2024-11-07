import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row, Container} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerEstados, CrearEstado, EliminarEstado, ActualizarEstado,ImportarEstados } from "../../../servicios/ServicioEstados";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import { useConfirm } from "../../../context/confirmContext";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import { RiSaveFill } from "react-icons/ri";
import { FaFileCirclePlus } from "react-icons/fa6";
import * as XLSX from "xlsx";
import CustomModal from "../../../components/modal/CustomModal"; 

// Interfaz para la información de el estado
interface Estado {
    idEstado: string;
    codigoEstado: string;
    descripcionEstado: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
    estado: boolean;
  }

// Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoEstados() {
  const [listaEstados, setListaEstados] = useState<Estado[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevaEstado, setNuevaEstado] = useState<Estado>({
  idEstado: "0",
  codigoEstado: "",
  descripcionEstado: "",
  usuarioCreacion: "",
  usuarioModificacion: "",
  estado: false
});
  const { setShowSpinner } = useSpinner();
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { openConfirm } = useConfirm();
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

    //
    const identificacionUsuario = localStorage.getItem("identificacionUsuario");
    const [showModalImportar, setShowModalImportar] = useState(false);
    const [listaEstadosImportar, setListaEstadosImportar] = useState<
    Estado[]
    >([]);
    const [showImportButton, setShowImportButton] = useState(false);
    const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerEstados();
  }, []);

  // Función para obtener todos los estados
  const obtenerEstados = async () => {
    setShowSpinner(true);
    try {
      const estados = await ObtenerEstados();
      setListaEstados(estados);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }finally{
      setShowSpinner(false);
    }
  };

  // Función para eliminar un estado
  const eliminarEstado = async (estado: Estado) => {
    openConfirm("¿Está seguro que desea cambiar el estado?", async () => {
      setShowSpinner(true);
      try {
      const response = await EliminarEstado(estado);

      if(response){
        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerEstados();
      }else{
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al cambiar el estado" });
      }
    } catch (error) {

      setShowAlert(true);
      setMensajeRespuesta({indicador : 1, mensaje : "Error al cambiar el estado" });
    }
    finally{
      setShowSpinner(true);
    }
  })
  };

  // Función para abrir el modal y editar un estado
  const editarEstado = (estado: Estado) => {
    setNuevaEstado(estado);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaEstado({
        idEstado: "0",
        codigoEstado: "",
        descripcionEstado: "",
        usuarioCreacion: "",
        usuarioModificacion: "",
        estado: false
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaEstado({
      ...nuevaEstado,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar un estado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar estado
      try {
        setShowSpinner(true);
        const estadoActualizar = { ...nuevaEstado, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarEstado(estadoActualizar);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerEstados();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el estado" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el estado" });
      }
      finally{
        setShowSpinner(true);
      }
    } else {
      // Crear estado
      try {
        setShowSpinner(true);
        const estadoACrear = { ...nuevaEstado, idEstado: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearEstado(estadoACrear);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerEstados();
        } else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el estado" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el estado" });
      }
      finally{
        setShowSpinner(true);
      }
    }
  
    handleModal();  // Cierra el modal 
  };

    // Encabezados de la tabla de importación sin acciones
    const encabezadoTiposDocImportar = [
      {
        id: "codigo",
        name: "Código",
        selector: (row: Estado) => row.codigoEstado,
        sortable: true,
        style: {
          fontSize: "1.2em",
        },
      },    
      {
        id: "descripcion",
        name: "Descripción",
        selector: (row: Estado) => row.descripcionEstado,
        sortable: true,
        style: {
          fontSize: "1.2em",
        },
      },
    ];

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaEstadosImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaEstadosImportar([]);
    setFile(file);
  };

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Convierte el ArrayBuffer a una cadena binaria
        const binaryString = new Uint8Array(arrayBuffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );

        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
          | string
          | number
        )[][];
        // Obtener nombres de propiedades desde la primera fila
        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        // Crear un array de objetos utilizando los nombres de propiedades
        const formattedData: Estado[] = jsonData.slice(1).map((row) => {
          const obj: Partial<Estado> = {};

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === "Código" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Descripción" &&
              (value === undefined || value === "")
            )
              InfoValida = false;

            // Asignar valores al objeto Estado
            obj.idEstado = "0" as string;
            if (property === "Código") obj.codigoEstado = value as string;       
            if (property === "Descripción") obj.descripcionEstado = value as string;
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.usuarioModificacion = "";
          });
          return obj as Estado; //  convertimos a un objeto de Estado
        });

        if (!InfoValida) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje:
              "Información incompleta. Verifique los campos requeridos en el archivo.",
          });
          setShowSpinner(false);
          return;
        }

        const errores: string[] = [];

        // Validar que todos los campos son correctos
        formattedData.forEach(({ codigoEstado, descripcionEstado }) => {
          if (typeof codigoEstado !== "string" || codigoEstado === null)
            errores.push("Código");
          if (codigoEstado.length > 3) errores.push("Código (máximo 3 caracteres)");         
          if (typeof descripcionEstado !== "string" || descripcionEstado === null)
            errores.push("Descripción");
        });

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores)); // Elimina duplicados
          const mensaje =
            columnasErroneas.length === 1
              ? `La columna ${columnasErroneas[0]} no cumple con el formato esperado.`
              : `Debe cargar un archivo de Excel con las siguientes columnas: ${columnasErroneas.join(
                  ", "
                )}.`;
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
          setShowSpinner(false);
          return;
        }

        if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
          setShowSpinner(false);
          return;
        }

        setShowSpinner(false);
        setListaEstadosImportar(formattedData);
        setShowImportButton(true);
      };

      reader.readAsArrayBuffer(file);
    } else {
      setShowSpinner(false);
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "Seleccione un archivo de Excel válido.",
      });
    }
  };

  const importarArchivoExcel = async () => {
    setShowSpinner(true);

    var estados = listaEstadosImportar.map((item) => {
      return {
        idEstado: item.idEstado,
        codigoEstado: item.codigoEstado,
        descripcionEstado: item.descripcionEstado,
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: "",
        fechaCreacion: new Date().toISOString(),
      };
    });

    // Función para verificar si ya existe en listaEstados
    const estadoExists = (estado: Estado) => {
      return listaEstados.some(
        (existingEstado) => existingEstado.codigoEstado === estado.codigoEstado
      );
    };

    // Filtrar  para eliminar duplicados
    const estadosSinDuplicados = estados.filter(
      (pestado: any) => !estadoExists(pestado)
    );

    if (estados.length > 0 && estadosSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: `Los estados que intenta importar ya existen.`,
      });

      setShowSpinner(false);
      return;
    }
    const respuesta: ErrorResponse[] = await ImportarEstados(
      estadosSinDuplicados
    );

    if (respuesta && respuesta.length > 0) {
      // Filtrar los errores de la respuestea
      const errores = respuesta.filter((item) => item.indicador === 1);

      // setIsLoading(false);

      if (errores.length > 0) {
        const mensajesDeError = errores
          .map((error) => error.mensaje)
          .join("\n");
        setShowSpinner(false);
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: `Errores encontrados:\n${mensajesDeError}`,
        });
      } else {
        setShowSpinner(false);
        // Mostrar mensaje de éxito si no hay errores
        obtenerEstados();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Importación exitosamente.",
        });
      }
    }
  };

  // Encabezados de la tabla con acciones
  const encabezadoEstados = [
    { id: "codigoEstado", name: "Código", selector: (row: Estado) => row.codigoEstado, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcionEstado", name: "Descripción", selector: (row: Estado) => row.descripcionEstado, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    {
      id: "estado",
      name: "Estado",
      selector: (row: any) => (row.estado ? "Activo" : "Inactivo"),
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Estado) => (
        <>
          <Button
            onClick={() => editarEstado(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarEstado(row)}
            className="bg-secondary">
            {row.estado ? <FaBan /> : <FaRedo/>}
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = "Reporte de estados DocSync - " + new Date().toLocaleDateString() +".xlsx";
    const nombreHoja = "Estados";

    const columnsSelect = [
      "codigoEstado",
      "descripcionEstado",
      "estado"
    ];

    const columnas = {
      codigoEstado: "Código",
      descripcionEstado: "Descripción",
      estado: "Estado"
    } as any;

    const datosFiltrados = listaEstados.map((item: any) => {
      const filteredItem: any = {};
      columnsSelect.forEach((column: any) => {
        if (column === "estado") {
          filteredItem[columnas[column]] = item[column] ? "Activo" : "Inactivo";
        } else {
          filteredItem[columnas[column]] = item[column];
        }
      });
      return filteredItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    
    await XLSX.writeFile(workbook, nombreReporte);
    setShowSpinner(false);
  }

  return (
    <>
      <h1 className="title">Catálogo de Estados</h1>
      <div style={{ padding: "20px" }}>
       {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
        {/* Tabla de estados */}
        <Grid
          gridHeading={encabezadoEstados}
          gridData={listaEstados}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigoEstado", "descripcionEstado"]}
          selectableRows={false}
          botonesAccion={[
            {
              condicion: true,
              accion: handleModalImportar,
              icono: <FaFileCirclePlus className="me-2" size={24} />,
              texto: "Importar",
            },
            {
              condicion: true,
              accion: descargaCatalogo,
              icono: <FaDownload className="me-2" size={24} />,
              texto: "Descargar",
            }
          ]}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar un estado */}
      <CustomModal show={showModal} 
      onHide={handleModal} 
      title={isEditing ? "Editar Estado" : "Agregar Estado"}
      showSubmitButton={true} 
      submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
      formId="formEstado">
        <Form  id="formEstado" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoEstado">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigoEstado"
                  value={nuevaEstado.codigoEstado}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcionEstado"
                  value={nuevaEstado.descripcionEstado || ""}
                  onChange={handleChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formEstado">
                <div
                  style={{
                    display: "flex",
                    alignContent: "start",
                    alignItems: "start",
                    flexDirection: "column",
                  }}
                >
                  <Form.Label style={{ marginTop: "3%" }}>
                    Estado activo
                  </Form.Label>
                  <div className="w-100">
                    <BootstrapSwitchButton
                      checked={nuevaEstado.estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) => nuevaEstado.estado = checked}
                    />
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
      
      {/* Modal para importar   */}
      <CustomModal
          size={"xl"}
          show={showModalImportar}
          onHide={handleModalImportar}
          title={"Importar Registros"}
          showSubmitButton={false}
        >
        {/* Importar */}
        <Container className="d-Grid align-content-center">
          <Form>
            <Form.Group controlId="file">
              <Row className="align-items-left">
                <Col md={6}>
                  <Form.Label className="mr-2">
                    <strong>Archivo: </strong>
                  </Form.Label>
                </Col>
              </Row>
              <Row className="align-items-center justify-content-between">
                <Col md={9}>
                  <Form.Control
                    type="file"
                    required={true}
                    accept=".xlsx"
                    onChange={handleFileChange}
                  />
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <Button
                    style={{ margin: 4 }}
                    className="btn-crear"
                    variant="primary"
                    onClick={importarExcel}
                  >
                    <FaUpload className="me-2" size={24} />
                    Cargar Archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Container>
        <br></br>
        {/* Tabla  */}
        <Grid
          gridHeading={encabezadoTiposDocImportar}
          gridData={listaEstadosImportar}
          handle={handleModalImportar}
          buttonVisible={false}
          selectableRows={false}
        />
        <Row>
          <Col md={12} className="d-flex justify-content-end">
            <Button
              style={{
                margin: 4,
                display: showImportButton ? "inline-block" : "none",
              }}
              className="btn-save"
              variant="primary"
              type="submit"
              onClick={importarArchivoExcel}
            >
              <RiSaveFill className="me-2" size={24} />
              Guardar
            </Button>
          </Col>
        </Row>
      </CustomModal>
    </>
  );
}

export default CatalogoEstados;
