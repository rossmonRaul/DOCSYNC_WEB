import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import {
  ActualizarDepartamento,
  AgregarDepartamento,
  CargaMasivaDepartamento,
  EliminarDepartamento,
  ObtenerDepartamentos,
} from "../../../servicios/ServicioDepartamento";
import { ObtenerInstitucion } from "../../../servicios/ServicioInstitucion";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
import { FaFileCirclePlus } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";

// Componente principal
function CatalogoDepartamentos() {
  const { setShowSpinner } = useSpinner();
  const [listaDepartamentos, setDepartamentos] = useState<any[]>([]);
  const [idDep, setIdDep] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { openConfirm } = useConfirm();
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaImportar, setListaImportar] = useState<any[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [idInstitucion, setIdInstitucion] = useState<number>(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setShowSpinner(true);
        const [deptos, inst] = await Promise.all([
          ObtenerDepartamentos(),
          ObtenerInstitucion()
        ]);
        
        // Mapeo correcto usando nomInstitucion
        const institucionesFormateadas = inst.map((item: { idInstitucion: any; nomInstitucion: any; }) => ({
          idInstitucion: item.idInstitucion,
          nombre: item.nomInstitucion // Aquí está el cambio clave
        }));
  
        setDepartamentos(deptos);
        setInstituciones(institucionesFormateadas);
        setShowSpinner(false);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setShowSpinner(false);
      }
    };
    
    cargarDatos();
  }, []);

  const obtenerDepartamentos = async () => {
    try {
      setShowSpinner(true);
      const response = await ObtenerDepartamentos();
      setDepartamentos(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
      setShowSpinner(false);
    }
  };

  const eliminar = (row: any) => {
    openConfirm("¿Está seguro que desea cambiar el estado?", async () => {
      try {
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');
        setShowSpinner(true);
        const data = {
          idDepartamento: row.idDepartamento,
          usuarioModificacion: identificacionUsuario,
          nombre: row.nombre,
          fechaModificacion: (new Date()).toISOString()
        };

        const response = await EliminarDepartamento(data);

        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerDepartamentos();
        setShowSpinner(false);
      } catch (error) {
        console.error("Error al eliminar departamento:", error);
        setShowSpinner(false);
      }
    });
  };

  const editar = (row: any) => {
    setNombre(row.nombre);
    setEstado(row.estado);
    setIdDep(row.idDepartamento);
    setIdInstitucion(row.idInstitucion || 0);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNombre("");
    setEstado(false);
    setIdDep("");
    setIdInstitucion(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSpinner(true);
    
    // Validaciones
    if (idInstitucion === 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Seleccione una institución",
      });
      setShowSpinner(false);
      return;
    }

    if (nombre.trim() === "") {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ingrese el nombre del departamento",
      });
      setShowSpinner(false);
      return;
    }

    try {
      const identificacionUsuario = localStorage.getItem("identificacionUsuario");
      
      if (isEditing) {
        const obj = {
          idDepartamento: idDep,
          nombre: nombre.trim(),
          estado: estado,
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: new Date().toISOString(),
          idInstitucion: idInstitucion
        };

        const response = await ActualizarDepartamento(obj);

        if (response.indicador === 0) {
          handleModal();
          obtenerDepartamentos();
        }
        setShowAlert(true);
        setMensajeRespuesta(response);
      } else {
        const obj = {
          nombre: nombre.trim(),
          estado: estado,
          usuarioCreacion: identificacionUsuario,
          fechaCreacion: new Date().toISOString(),
          idInstitucion: idInstitucion
        };

        const response = await AgregarDepartamento(obj);

        if (response.indicador === 0) {
          handleModal();
          obtenerDepartamentos();
        }
        setShowAlert(true);
        setMensajeRespuesta(response);
      }
      setShowSpinner(false);
    } catch (error) {
      console.error("Error:", error);
      setShowSpinner(false);
    }
  };

  const encabezadoTabla = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: any) => row.nombre,
      sortable: true,
      style: {
        fontSize: "1.2em",
        color: '#212529'
      },
    },
    {
      id: "institucion",
      name: "Institución",
      selector: (row: any) => {
        const institucion = instituciones.find(i => i.idInstitucion === row.idInstitucion);
        return institucion ? institucion.nombre : 'No asignado';
      },
      sortable: true,
      style: {
        fontSize: "1.2em",
        color: '#212529'
      },
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: any) => row.estado ? "Activo" : "Inactivo",
      sortable: true,
      style: {
        fontSize: "1.2em",
        color: '#212529'
      },
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: any) => (
        <>
          <Button
            onClick={() => editar(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminar(row)}
            className="bg-secondary"
          >
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>      
        </>
      ),
      width: "120px",
    },
  ];
 // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    setListaImportar([]);
    const file = e.target.files[0];
    setShowImportButton(false);
    setFile(file);
  };

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const identificacionUsuario = localStorage.getItem("identificacionUsuario");

        const arrayBuffer = e.target?.result as ArrayBuffer;
        const binaryString = new Uint8Array(arrayBuffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );

        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];

        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        const formattedData: any[] = jsonData.slice(1).map((row) => {
          const obj: Partial<any> = {};

          properties.forEach((property, index) => {
            const value = row[index];

            if (property === "Nombre departamento" && (value === undefined || value === ""))
              InfoValida = false;

            if (property === "Nombre departamento") obj.nombre = value;
            
            obj.usuarioCreacion = identificacionUsuario || "";
            obj.fechaCreacion = new Date().toISOString();
          });
          return obj as any;
        });

        if (!InfoValida) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "El archivo debe contener la columna 'Nombre departamento' con datos válidos",
          });
          setShowSpinner(false);
          return;
        }

        const errores: string[] = [];
        var nombresRep = "";
        var nombresRepetidos = false;

        formattedData.forEach((item: any) => {
          if (!item.nombre) {
            errores.push("Nombre departamento");
            return;
          }          
          
          if (typeof item.nombre !== "string" || item.nombre === null)
            errores.push("Nombre departamento");
          
          if (item.nombre.length > 50)
            errores.push("Nombre departamento (máximo 50 caracteres)");

          if (listaDepartamentos.filter(
              (x: any) => x.nombre.toLowerCase() === item.nombre.toLowerCase().trim()
            ).length > 0) {
            nombresRep += nombresRep === "" ? item.nombre : ", " + item.nombre;
            item.nombre = undefined;
          }

          if (formattedData.filter((x: any) => x.nombre === item.nombre).length > 1) {
            item.nombre = undefined;
            nombresRepetidos = true;
          }
        });
        
        if (nombresRep.length > 0) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: `Los siguientes departamentos ya existen: ${nombresRep}. No serán cargados.`,
          });
        } else if (nombresRepetidos) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "Se encontraron registros duplicados en el archivo. Serán descartados.",
          });
        } else if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores));
          const mensaje = columnasErroneas.length === 1
            ? `La columna ${columnasErroneas[0]} no cumple con el formato esperado.`
            : `Debe cargar un archivo con las siguientes columnas válidas: ${columnasErroneas.join(", ")}.`;
          
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
        }

        setShowSpinner(false);
        setListaImportar(formattedData.filter((x: any) => x.nombre));
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
    if (listaImportar.length < 1) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "No hay registros por cargar",
      });
    } else {
      setShowSpinner(true);
      const defaultInstitucion = instituciones.length > 0 ? instituciones[0].idInstitucion : 0;

      const listaImportada = listaImportar.map((item) => ({
        nombre: item.nombre,
        estado: true,
        usuarioCreacion: item.usuarioCreacion,
        fechaCreacion: new Date().toISOString(),
        idInstitucion: defaultInstitucion
      }));

      const response = await CargaMasivaDepartamento(listaImportada);

      setShowAlert(true);
      setMensajeRespuesta(response);
      setShowSpinner(false);
      handleModalImportar();
      obtenerDepartamentos();
    }
  };
  // Encabezados de la tabla de importación sin acciones
  const encabezadoImportar = [
    {
      id: "nombre",
      name: "Departamento",
      selector: (row: any) => row.nombre,
      sortable: true,
      style: {
        fontSize: "1.2em",
        color: '#212529'
      },
    }
  ];

  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = `Reporte de departamentos - ${new Date().toLocaleDateString()}.xlsx`;
    const nombreHoja = "Departamentos";

    const datosFiltrados = listaDepartamentos.map((item: any) => {
      const institucion = instituciones.find(i => i.idInstitucion === item.idInstitucion);
      return {
        "Nombre departamento": item.nombre,
        "Institución": institucion ? institucion.nombre : 'No asignado',
        "Estado": item.estado ? "Activo" : "Inactivo"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    await XLSX.writeFile(workbook, nombreReporte);
    setShowSpinner(false);
  };

  return (
    <>
      <h1 className="title">Catálogo de departamentos</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        <br />

        <Grid
          handle={handleModal}
          buttonVisible={true}
          gridHeading={encabezadoTabla}
          gridData={listaDepartamentos}
          filterColumns={["nombre", "institucion", "estado"]}
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
        />
      </div>

      {/* Modal para agregar/editar */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar departamento" : "Agregar departamento"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formDep"
      >
        <Form onSubmit={handleSubmit} id="formDep">
          <Row>
            <Col md={6}>
              <Form.Group controlId="formInstitucion" className="mb-3">
                <Form.Label>Institución*</Form.Label>
                <Form.Select
                  value={idInstitucion}
                  onChange={(e) => setIdInstitucion(Number(e.target.value))}
                  required
                  style={{
                    fontSize: "16px",
                    padding: "10px",
                    color: '#212529',
                    backgroundColor: '#fff',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                >
                  <option value="0" style={{ color: '#6c757d' }}>
                    Seleccione una institución
                  </option>
                  {instituciones.map((inst) => (
                    <option 
                      key={inst.idInstitucion} 
                      value={inst.idInstitucion}
                      style={{ color: '#212529' }}
                    >
                      {inst.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formNombre" className="mb-3">
                <Form.Label>Nombre del departamento*</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={50}
                  style={{
                    fontSize: "16px",
                    padding: "10px",
                    color: '#212529',
                    backgroundColor: '#fff',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formEstado" className="mb-3">
                <Form.Label>Estado del departamento</Form.Label>
                <div style={{ marginTop: '5px' }}>
                  <BootstrapSwitchButton
                    checked={estado}
                    onlabel="Activo"
                    offlabel="Inactivo"
                    onstyle="success"
                    offstyle="danger"
                    width={100}
                    onChange={(checked) => setEstado(checked)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* Modal para importar */}
      <CustomModal
        size="xl"
        show={showModalImportar}
        onHide={handleModalImportar}
        title="Importar registros"
        showSubmitButton={false}
      >
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
                    variant="primary"
                    onClick={importarExcel}
                    style={{ margin: 4 }}
                  >
                    <FaUpload className="me-2" size={24} />
                    Cargar archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Container>
        <br />
{/* Tabla de importar */}
        <Grid
          gridHeading={encabezadoImportar}
          gridData={listaImportar}
          handle={handleModalImportar}
          buttonVisible={false}
          selectableRows={false}
        />
        <Row>
          <Col md={12} className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={importarArchivoExcel}
              style={{
                margin: 4,
                display: showImportButton ? "inline-block" : "none",
              }}
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

export default CatalogoDepartamentos;