import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import {
  ActualizarPuesto,
  AgregarPuesto,
  CargaMasivaPuesto,
  EliminarPuesto,
  ObtenerPuestos,
} from "../../../servicios/ServicioPuesto";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";
import { FaFileCirclePlus } from "react-icons/fa6";

// Componente principal
function CatalogoPuestos() {
  const { setShowSpinner } = useSpinner();
  const [listapuestos, setpuestos] = useState<any[]>([]);
  const [idPuesto, setIdPuesto] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { openConfirm } = useConfirm();
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaImportar, setListaImportar] = useState<any[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerPuestos();
  }, []);

  const obtenerPuestos = async () => {
    try {
      setShowSpinner(true);
      const response = await ObtenerPuestos();
      setpuestos(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener puestos:", error);
    }
  };

  // Función para inhabilitar un puesto
  const eliminar = async (row: any) => {
    openConfirm("¿Está seguro que desea cambiar el estado?", async () => {
      try {
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');
        setShowSpinner(true);
        const data = {
          idPuesto: row.idPuesto,
          nombre: row.nombre,
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: (new Date()).toISOString()
        };

        const response = await EliminarPuesto(data);

        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerPuestos();
        setShowSpinner(false);
      } catch (error) {
        console.error("Error al eliminar puesto:", error);
      }
    });
  };

  // Función para abrir el modal y editar
  const editar = (row: any) => {
    setNombre(row.nombre);
    setEstado(row.estado);
    setIdPuesto(row.idPuesto);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNombre("");
    setEstado(false);
    setIdPuesto("");
  };

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowSpinner(true);
    if (isEditing) {
      try {
        if (nombre === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Ingrese el nombre del puesto",
          });
        } else {
          const identificacionUsuario = localStorage.getItem(
            "identificacionUsuario"
          );

          const obj = {
            idPuesto: idPuesto,
            nombre: nombre,
            estado: estado,
            usuarioModificacion: identificacionUsuario,
            fechaModificacion: new Date().toISOString(),
          };

          const response = await ActualizarPuesto(obj);

          if (response.indicador === 0) {
            handleModal();
            obtenerPuestos();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al actualizar puesto:", error);
      }
    } else {
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

        if (nombre === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Ingrese el nombre del puesto",
          });
        } else {
          const obj = {
            nombre: nombre,
            estado: estado,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: new Date().toISOString(),
          };

          const response = await AgregarPuesto(obj);

          if (response.indicador === 0) {
            handleModal(); // Cierra el modal
            obtenerPuestos();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al crear la puesto:", error);
      }
    }

    setShowSpinner(false);
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: any) => row.nombre,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
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
            className="bg-secondary">            
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
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

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
        const formattedData: any[] = jsonData.slice(1).map((row) => {
          const obj: Partial<any> = {};

          properties.forEach((property, index) => {
            const value = row[index];

            if (
              property === "Criterio búsqueda" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (
              property === "Tipo de validación" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (
              property === "Valor externo" &&
              (value === undefined || value === "")
            )
              InfoValida = false;

            // Asignar valores al objeto
            if (property === "Nombre puesto") obj.nombre = value;
            
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.fechaCreacion = new Date().toISOString();
          });
          return obj as any;
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

        var nombresRep = "";
        var nombresRepetidos = false;

        // Validar que todos los campos son correctos
        formattedData.forEach((item: any) => {
          // Validar columnas
          if (!item.nombre) {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: 'No se encontró la columna "Nombre puesto"',
            });
            return;
          }          
          if (
            typeof item.nombre !== "string" ||
            item.nombre === null
          )
            errores.push("Nombre puesto");
          if (item.nombre.length > 50)
            errores.push("Nombre puesto (máximo 50 caracteres)");

          // Se identifican los nombres ya existentes
          if (
            listapuestos.filter(
              (x: any) => x.nombre.toLowerCase() === item.nombre.toLowerCase().trim()
            ).length > 0
          ) {
            nombresRep +=
              nombresRep === ""
                ? item.nombre
                : ", " + item.nombre;
            item.nombre = undefined; // Se marca como undefined para no cargarlo
          }

          // Se identifican nombres repetidos en documento
          if (
            formattedData.filter(
              (x: any) => x.nombre === item.nombre
            ).length > 1
          ) {
            item.nombre = undefined; // Se marca como undefined para no cargarlo
            nombresRepetidos = true;
          }
        });
        
        // Indicador de nombres repetidos
        if (nombresRep.length > 0) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje:
              "Los siguientes puestos, ya existen en el sistema: " +
              nombresRep +
              ". Por lo que no serán cargados",
          });
          setShowSpinner(false);
        }
        // Indicador de nombres repetidos en el archivo de carga
        else if (nombresRepetidos) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje:
              "Se encontraron registros con el mismo nombre, por lo que serán descartados para la carga. Favor validar los registros",
          });
          setShowSpinner(false);
        } else if (errores.length > 0) {
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
        } else if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
          setShowSpinner(false);
        }

        setShowSpinner(false);
        setListaImportar(
          formattedData.filter(
            (x: any) => x.nombre
          )
        );
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

      var listaImportada = listaImportar.map((item) => {
        return {
          nombre: item.nombre,
          estado: true,
          usuarioCreacion: item.usuarioCreacion,
          fechaCreacion: new Date().toISOString(),
        };
      });

      const response = await CargaMasivaPuesto(listaImportada);

      setShowAlert(true);
      setMensajeRespuesta(response);
      setShowSpinner(false);
      handleModalImportar();
      obtenerPuestos();
    }
  };

  // Encabezados de la tabla de importación sin acciones
  const encabezadoImportar = [
    {
      id: "nombre",
      name: "Puesto",
      selector: (row: any) => row.nombre,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    }
  ];

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = "Reporte de puestos DocSync - " + new Date().toLocaleDateString() +".xlsx";
    const nombreHoja = "Puestos";

    const columnsSelect = [
      "nombre",
      "estado"
    ];

    const columnas = {
      nombre: "Nombre puesto",
      estado: "Estado"
    } as any;

    const datosFiltrados = listapuestos.map((item: any) => {
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
      <h1 className="title">Catálogo de puestos</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        <br />

        {/* Tabla */}
        <Grid
          handle={handleModal}
          buttonVisible={true}
          gridHeading={encabezadoTabla}
          gridData={listapuestos}
          filterColumns={["nombre", "estado"]}
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

      {/* Modal para agregar o editar */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar puesto" : "Agregar puesto"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formDep"
      >
        <Form onSubmit={handleSubmit} id="formDep">
          <Row>
            <Col md={6}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre del puesto</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={(e: any) => setNombre(e.target.value)}
                  maxLength={50}
                  style={{
                    fontSize: "16px",
                    padding: "2%",
                    outline: "none",
                    marginTop: "1%",
                  }}
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
                  <Form.Label>
                    Puesto activo
                  </Form.Label>
                  <div className="w-100" style={{marginTop: '1%'}}>
                    <BootstrapSwitchButton
                      checked={estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) => setEstado(checked)}
                    />
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* Modal para importar*/}
      <CustomModal
        size={"xl"}
        show={showModalImportar}
        onHide={handleModalImportar}
        title={"Importar registros"}
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
                    Cargar archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Container>
        <br></br>

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

export default CatalogoPuestos;
