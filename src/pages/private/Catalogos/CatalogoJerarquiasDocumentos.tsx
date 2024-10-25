import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row, Container} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerJerarquiasDoc, CrearJerarquiaDoc, EliminarJerarquiaDoc, ActualizarJerarquiaDoc, ImportarJerarquiasDoc } from "../../../servicios/ServicioJerarquiasDocumentos";
import { FaBan, FaRedo, FaUpload } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; 
import { AlertDismissible } from "../../../components/alert/alert";
import { useConfirm } from "../../../context/confirmContext";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import { RiSaveFill } from "react-icons/ri";
import { FaFileCirclePlus } from "react-icons/fa6";
import * as XLSX from "xlsx";

// Interfaz
interface JerarquiaDocumento {
    idJerarquiaDoc: string;
    codigo: string;
    descripcion: string;
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
function CatalogoJerarquiasDocumentos() {
  const [listaJerarquiasDocumentos, setListaJerarquiasDocumentos] = useState<JerarquiaDocumento[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevaJerarquiaDocumento, setNuevaJerarquiaDocumento] = useState<JerarquiaDocumento>({
  idJerarquiaDoc: "0",
  codigo: "",
  descripcion: "",
  usuarioCreacion: "",
  usuarioModificacion: "",
  estado: false
});
  const { setShowSpinner } = useSpinner();
  const [isEditing, setIsEditing] = useState(false);
  const { openConfirm } = useConfirm();
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

   //
   const identificacionUsuario = localStorage.getItem("identificacionUsuario");
   const [showModalImportar, setShowModalImportar] = useState(false);
   const [listaJerarquiaImportar, setListaJerarquiaImportar] = useState<
   JerarquiaDocumento[]
   >([]);
   const [showImportButton, setShowImportButton] = useState(false);
   const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerJerarquiasDoc();
  }, []);

  // Función para obtener todas las  jerarquías
  const obtenerJerarquiasDoc = async () => {
    setShowSpinner(true);
    try {
      const jerarquiasDoc = await ObtenerJerarquiasDoc();
      setListaJerarquiasDocumentos(jerarquiasDoc);
    } catch (error) {
      console.error("Error al obtener las jerarquías de documentos:", error);
    }finally{
      setShowSpinner(false);
    }
  };

  // Función para eliminar una jerarquía
  const eliminarJerarquiaDoc = async (jerarquiasDoc: JerarquiaDocumento) => {
    openConfirm("¿Está seguro que desea cambiar el estado?", async () => {
    try {

      const response = await EliminarJerarquiaDoc(jerarquiasDoc);

      if(response){
        setShowAlert(true);
        setMensajeRespuesta(response);
            obtenerJerarquiasDoc();
      }else{
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al cambiar estado de la jerarquía de documento" });
      }
    } catch (error) {
      setShowAlert(true);
      setMensajeRespuesta({indicador : 1, mensaje : "Error al cambiar estado de la jerarquía de documento" });
    }finally{
      setShowSpinner(true);
    }
  })
  };

  // Función para abrir el modal y editar una jerarquía
  const editarJerarquiaDocumento = (jerarquiaDocumento: JerarquiaDocumento) => {
    setNuevaJerarquiaDocumento(jerarquiaDocumento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaJerarquiaDocumento({
        idJerarquiaDoc: "0",
        codigo: "",
        descripcion: "",
        usuarioCreacion: "",
        usuarioModificacion: "",
        estado: false
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaJerarquiaDocumento({
      ...nuevaJerarquiaDocumento,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una jerarquía
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar jerarquía
      setShowSpinner(true);
      try {
        const jerarquiaDocActualizar = { ...nuevaJerarquiaDocumento, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarJerarquiaDoc(jerarquiaDocActualizar);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerJerarquiasDoc();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar la jerarquía de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar la jerarquía de documento" });
      }finally{
        setShowSpinner(true);
      }
    } else {
      // Crear jerarquía de documento
      try {
        setShowSpinner(true);
        const jerarquiaDocACrear = { ...nuevaJerarquiaDocumento, idJerarquiaDoc: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearJerarquiaDoc(jerarquiaDocACrear);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerJerarquiasDoc();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al crear la jerarquía de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al crear la jerarquía de documento" });
      } finally{
        setShowSpinner(true);
      }
    }
  
    handleModal();  // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoJerarquiasDoc = [
    { id: "codigo", name: "Código", selector: (row: JerarquiaDocumento) => row.codigo, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcion", name: "Descripción", selector: (row: JerarquiaDocumento) => row.descripcion, sortable: true, style: {
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
      cell: (row: JerarquiaDocumento) => (
        <>
          <Button
            onClick={() => editarJerarquiaDocumento(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarJerarquiaDoc(row)}
            className="bg-secondary">
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>      
        </>
      ), width:"120px",
    },
  ];

// Encabezados de la tabla de importación sin acciones
    const encabezadoJerarquiasImportar = [
      {
        id: "codigo",
        name: "Código",
        selector: (row: JerarquiaDocumento) => row.codigo,
        sortable: true,
        style: {
          fontSize: "1.2em",
        },
      },    
      {
        id: "descripcion",
        name: "Descripción",
        selector: (row: JerarquiaDocumento) => row.descripcion,
        sortable: true,
        style: {
          fontSize: "1.2em",
        },
      },
    ];

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaJerarquiaImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaJerarquiaImportar([]);
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
        const formattedData: JerarquiaDocumento[] = jsonData.slice(1).map((row) => {
          const obj: Partial<JerarquiaDocumento> = {};

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === "Código" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Descripción" &&
              (value === undefined || value === "")
            )
              InfoValida = false;

            // Asignar valores al objeto JerarquiaDocumento
            obj.idJerarquiaDoc = "0" as string;
            if (property === "Código") obj.codigo = value as string;       
            if (property === "Descripción") obj.descripcion = value as string;
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.usuarioModificacion = "";
          });
          return obj as JerarquiaDocumento; //  convertimos a un objeto de JerarquiaDocumento
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
        formattedData.forEach(({ codigo, descripcion }) => {
          if (typeof codigo !== "string" || codigo === null)
            errores.push("Código");
          if (codigo.length > 3) errores.push("Código (máximo 3 caracteres)");         
          if (typeof descripcion !== "string" || descripcion === null)
            errores.push("Descripción");
        });

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores)); 
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
        setListaJerarquiaImportar(formattedData);
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

    var jerarquias = listaJerarquiaImportar.map((item) => {
      return {
        idJerarquiaDoc: item.idJerarquiaDoc,
        codigo: item.codigo,
        descripcion: item.descripcion,
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: "",
        fechaCreacion: new Date().toISOString(),
      };
    });

    // Función para verificar si ya existe en listaJerarquiaImportar
    const jerarquiaExists = (jerarquia: JerarquiaDocumento) => {
      return listaJerarquiasDocumentos.some(
        (existingJerarquia) => existingJerarquia.codigo === jerarquia.codigo
      );
    };

    // Filtrar  para eliminar duplicados
    const jerarquiasSinDuplicados = jerarquias.filter(
      (pjerarquia: any) => !jerarquiaExists(pjerarquia)
    );

    if (jerarquias.length > 0 && jerarquiasSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: `Las jerarquías de documentos que intenta importar ya existen.`,
      });

      setShowSpinner(false);
      return;
    }
    const respuesta: ErrorResponse[] = await ImportarJerarquiasDoc(
      jerarquiasSinDuplicados
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
        obtenerJerarquiasDoc();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Importación exitosamente.",
        });
      }
    }
  };


  return (
    <>
      <h1 className="title">Catálogo Jerarquía de Documentos</h1>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
        {/* Tabla de Jerarquía de Documentos*/}
        <Grid
          gridHeading={encabezadoJerarquiasDoc}
          gridData={listaJerarquiasDocumentos}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigo", "descripcion"]}
          selectableRows={false}
          botonesAccion={[
            {
              condicion: true,
              accion: handleModalImportar,
              icono: <FaFileCirclePlus className="me-2" size={24} />,
              texto: "Importar",
            },
          ]}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar una Jerarquía de Documentos */}
      <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar Jerarquía de Documento" : "Agregar Jerarquía de Documento"}
          showSubmitButton={true} 
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
          formId="formJerarquiaDoc"
        >
        <Form id="formJerarquiaDoc" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoJerarquiaDoc">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={nuevaJerarquiaDocumento.codigo}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionJerarquiaDoc">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevaJerarquiaDocumento.descripcion || ""}
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
                    Tipo de documento activo
                  </Form.Label>
                  <div className="w-100">
                    <BootstrapSwitchButton
                      checked={nuevaJerarquiaDocumento.estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) => nuevaJerarquiaDocumento.estado = checked}
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
          gridHeading={encabezadoJerarquiasImportar}
          gridData={listaJerarquiaImportar}
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

export default CatalogoJerarquiasDocumentos;
