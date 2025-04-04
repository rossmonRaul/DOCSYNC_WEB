import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerTiposDocumentos, CrearTipoDocumento, EliminarTipoDocumento, ActualizarTipoDocumento, ImportarTiposDocumentos } from "../../../servicios/ServicioTiposDocumentos";
import { FaTrash , FaUpload } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; // Importar el nuevo modal
import { AlertDismissible } from "../../../components/alert/alert";
import { useSpinner } from "../../../context/spinnerContext";
import { RiSaveFill } from "react-icons/ri";

import * as XLSX from 'xlsx';


// Interfaz para la información del tipo de documento
interface TipoDocumento {
    idTipoDocumento: string;
    numCaracteres: number;
    codigo: string;
    descripcion: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
  }
  
  // Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoTiposDocumentos() {
  const { setShowSpinner } = useSpinner();
  const [listaTiposDocumentos, setListaTiposDocumentos] = useState<TipoDocumento[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState<TipoDocumento>({
  idTipoDocumento: "0",
  codigo: "",
  numCaracteres: 0,
  descripcion: "",
  usuarioCreacion: "",
  usuarioModificacion: ""
});
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

  //
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaTiposDocImportar, setListaTiposDocImportar] = useState<TipoDocumento[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);


  useEffect(() => {
    obtenerTiposDocumentos();
  }, []);

  // Función para obtener todas los tipos de documentos
  const obtenerTiposDocumentos = async () => {
    setShowSpinner(true);
    try {
      const tiposDocumentos = await ObtenerTiposDocumentos();
      setListaTiposDocumentos(tiposDocumentos);
    } catch (error) {
      console.error("Error al obtener los tipos de documentos:", error);
    }finally{
      setShowSpinner(false);
    }
  };

  // Función para eliminar un tipo de documento
  const eliminarTipoDocumento = async (tipoDocumento: TipoDocumento) => {
    try {
      setShowSpinner(true);
      const response = await EliminarTipoDocumento(tipoDocumento);

      if(response){
        setShowAlert(true);
        setMensajeRespuesta(response);
            obtenerTiposDocumentos();
          } else {
            setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar el tipo de documento" });
          }
    } catch (error) {
      setShowAlert(true);
      setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar el tipo de documento" });
    }finally{
      setShowSpinner(false);
    }
  };

  // Función para abrir el modal y editar un tipo de documento
  const editarTipoDocumento = (tipoDocumento: TipoDocumento) => {
    setNuevoTipoDocumento(tipoDocumento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevoTipoDocumento({
        idTipoDocumento: "0",
        codigo: "",
        numCaracteres:0,
        descripcion: "",
        usuarioCreacion: "",
        usuarioModificacion: ""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoTipoDocumento({
      ...nuevoTipoDocumento,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar un tipo de dotcumento 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (isEditing) {
      // Editar tipo de dotcumento 
      try {
        setShowSpinner(true);
        const tipoDocumentoActualizar = { 
          ...nuevoTipoDocumento, 
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: new Date().toISOString() };
        const response = await ActualizarTipoDocumento(tipoDocumentoActualizar);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerTiposDocumentos();
        } else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el tipo de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el tipo de documento" });
      }finally{
        setShowSpinner(false);
      }
    } else {
      // Crear tipo de documento
      try {
        setShowSpinner(true);
        const tipoDocumentoACrear = { ...nuevoTipoDocumento, 
          idTipoDocumento: "0", 
          usuarioCreacion: identificacionUsuario,
          fechaCreacion:(new Date()).toLocaleString()
        };
        const response = await CrearTipoDocumento(tipoDocumentoACrear);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerTiposDocumentos();
        } else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el tipo de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el tipo de documento" });
      }finally{
        setShowSpinner(false);
      }
    }
    handleModal();  // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoTiposDocumentos = [
    { id: "codigo", name: "Código", selector: (row: TipoDocumento) => row.codigo, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "numCaracteres", name: "Número de Caracteres", selector: (row: TipoDocumento) => row.numCaracteres, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcion", name: "Descripción", selector: (row: TipoDocumento) => row.descripcion, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: TipoDocumento) => (
        <>
          <Button
            onClick={() => editarTipoDocumento(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarTipoDocumento(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ), width:"120px",
    },
  ];


    // Función para manejar el cierre del modal de importar
    const handleModalImportar = () => {
      setListaTiposDocImportar([])
      setFile(null);
      setShowImportButton(false);
      setShowModalImportar(!showModalImportar);
    };
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaTiposDocImportar([]);
    setFile(file);
  }

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Convierte el ArrayBuffer a una cadena binaria
        const binaryString = new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");

        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
        //console.log("jsonData:" + jsonData);
        // Obtener nombres de propiedades desde la primera fila
        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        // Crear un array de objetos utilizando los nombres de propiedades
        const formattedData: TipoDocumento[] = jsonData.slice(1).map((row) => {
          const obj: Partial<TipoDocumento> = {}; 

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === 'Código' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Número de Caracteres' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Descripción' && (value === undefined || value === '')) InfoValida = false;


            // Asignar valores al objeto TipoDocumento
            obj.idTipoDocumento = "0" as string;
            if (property === 'Código') obj.codigo = value as string;
            if (property === 'Número de Caracteres') obj.numCaracteres = value as number;
            if (property === 'Descripción') obj.descripcion = value as string;    
            obj.usuarioCreacion = identificacionUsuario ? identificacionUsuario:"";
            obj.usuarioModificacion = '';
          });
          return obj as TipoDocumento; //  convertimos a un objeto de TipoDocumento
        });

        if (!InfoValida) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: 'Información incompleta. Verifique los campos requeridos en el archivo.'
          });
          setShowSpinner(false);
          return;
        }

        const errores: string[] = [];

        // Validar que todos los campos son correctos
        formattedData.forEach(({ codigo, numCaracteres, descripcion }) => {
          if (typeof codigo !== 'string' || codigo === null) errores.push('Código');
          if ( codigo.length > 3) errores.push('Código (máximo 3 caracteres)');
          if (typeof numCaracteres !== 'number' || numCaracteres === null) errores.push('Número de Caracteres');
          if (typeof descripcion !== 'string' || descripcion === null) errores.push('Descripción');
        });

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores)); // Elimina duplicados
          const mensaje = columnasErroneas.length === 1
            ? `La columna ${columnasErroneas[0]} no cumple con el formato esperado.`
            : `Debe cargar un archivo de Excel con las siguientes columnas: ${columnasErroneas.join(', ')}.`;
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje
          });
          setShowSpinner(false);
          return;
        }

        if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje
          });
          setShowSpinner(false);
          return;
        }

        setShowSpinner(false);
        setListaTiposDocImportar(formattedData);
        setShowImportButton(true);
      };

      reader.readAsArrayBuffer(file);
    } else {
      setShowSpinner(false);
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: 'Seleccione un archivo de Excel válido.'
      });
    }
  };


  // Encabezados de la tabla de importación sin acciones
  const encabezadoTiposDocImportar = [
    {
      id: "codigo",
      name: "Código",
      selector: (row: TipoDocumento) => row.codigo,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "numCaracteres",
      name: "Número de Caracteres",
      selector: (row: TipoDocumento) => row.numCaracteres,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "descripcion",
      name: "Descripción",
      selector: (row: TipoDocumento) => row.descripcion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
  ];

  const importarArchivoExcel = async () => {

    setShowSpinner(true);

    var tiposDocumentos = listaTiposDocImportar.map(item => {

      return {
        idTipoDocumento: item.idTipoDocumento,
        codigo: item.codigo,
        numCaracteres: item.numCaracteres,
        descripcion: item.descripcion,
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: '',
        fechaCreacion:(new Date()).toISOString()
      };
    });

    // Función para verificar si ya existe en listaTiposDocumentos
    const tipoDocExists = (tipoDocumento: TipoDocumento) => {
      return listaTiposDocumentos.some(existingPersona =>
        existingPersona.codigo === tipoDocumento.codigo 
      );
    };

    // Filtrar  para eliminar duplicados
    const tiposDocSinDuplicados = tiposDocumentos.filter(petipoDoc => !tipoDocExists(petipoDoc));

    if (tiposDocumentos.length > 0 && tiposDocSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta(
        {
          "indicador": 1,
          "mensaje": `Los tipos de documento que intenta importar ya existen.`
        });

      setShowSpinner(false);
      return;
    }
    const respuesta: ErrorResponse[] = await ImportarTiposDocumentos(tiposDocSinDuplicados);

    if (respuesta && respuesta.length > 0) {
      // Filtrar los errores de la respuestea
      const errores = respuesta.filter(item => item.indicador === 1);

      // setIsLoading(false); 

      if (errores.length > 0) {
        const mensajesDeError = errores.map(error => error.mensaje).join('\n');
        setShowSpinner(false);
        setShowAlert(true);
        setMensajeRespuesta({
          "indicador": 1,
          "mensaje": `Errores encontrados:\n${mensajesDeError}`
        });

      } else {
        setShowSpinner(false);
        // Mostrar mensaje de éxito si no hay errores     
        obtenerTiposDocumentos();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          "indicador": 0,
          "mensaje": 'Importación exitosamente.'
        });
      }
    }
  }

  return (
    <>
      <h1 className="title">Catálogo Tipos de Documentos</h1>
      <div style={{ padding: "20px" }}>
      {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
        {/* Tabla de tipos de documentos */}
        <Grid
          gridHeading={encabezadoTiposDocumentos}
          gridData={listaTiposDocumentos}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigo", "descripcion"]}
          selectableRows={false}
          visibleButtonOpcion1={true}
          nameButtonOpcion1={"Importar"}
          iconButtonOpcion1={<FaFileCirclePlus className="me-2" size={24} />}
          handleButtonOpcion1={handleModalImportar}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar un tipo de documento */}
      <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar Tipo de Documento" : "Agregar Tipo de Documento"}
          showSubmitButton={true} 
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
          formId="formTipoDocumento"
        >
        <Form id="formTipoDocumento" onSubmit={handleSubmit}>
          <Row>
            <Col md={3}>
              <Form.Group controlId="formCodigoTipoDocumento">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={nuevoTipoDocumento.codigo}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formNumCaracteres">
                <Form.Label>Número de caracteres</Form.Label>
                <Form.Control
                  type="number"
                  name="numCaracteres"
                  value={nuevoTipoDocumento.numCaracteres}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionTipoDocumento">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoTipoDocumento.descripcion || ""}
                  onChange={handleChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>


      {/* Modal para importar tipos de documentos  */}
      <CustomModal
        size={"xl"}
        show={showModalImportar}
        onHide={handleModalImportar}
        title={"Importar Registros"}
        showSubmitButton={false}
      >
        {/* Importar personas */}
        <Container className='d-Grid align-content-center'>
          <Form>
            <Form.Group controlId="file">
              <Row className="align-items-left">
                <Col md={6}>
                  <Form.Label className="mr-2"><strong>Archivo: </strong></Form.Label>
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
                  <Button style={{ margin: 4 }}
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
        {/* Tabla de personas */}
        <Grid
          gridHeading={encabezadoTiposDocImportar}
          gridData={listaTiposDocImportar}
          handle={handleModalImportar}
          buttonVisible={false}
          selectableRows={false}
        />
        <Row>
          <Col md={12} className="d-flex justify-content-end">
            <Button
              style={{
                margin: 4,
                display: showImportButton ? 'inline-block' : 'none',
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

export default CatalogoTiposDocumentos;
