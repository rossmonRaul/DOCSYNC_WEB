import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import {
  ObtenerTiposDocumentos,
  CrearTipoDocumento,
  EliminarTipoDocumento,
  ActualizarTipoDocumento,
  ImportarTiposDocumentos,
} from "../../../servicios/ServicioTiposDocumentos";
import Select from "react-select";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal";
import { AlertDismissible } from "../../../components/alert/alert";
import { useSpinner } from "../../../context/spinnerContext";
import { RiSaveFill } from "react-icons/ri";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

import * as XLSX from "xlsx";
import { useConfirm } from "../../../context/confirmContext";
import { ObtenerFormatoDocumento } from "../../../servicios/ServicioFormatoDocumento";
import { ObtenerCriterioBusqueda } from "../../../servicios/ServicioCriterioBusqueda";

// Interfaz para la información del tipo de documento
interface TipoDocumento {
  idTipoDocumento: string;
  fraseBusqInicio: string;
  fraseBusqFin: string;
  idFormatoDocumento?: number;
  idCriterioBusqueda?: any;
  criterioBusqueda: string;
  contieneNumSoli: boolean;
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
function CatalogoTiposDocumentos() {
  const { openConfirm } = useConfirm();
  const { setShowSpinner } = useSpinner();
  const [paramBusqueda, setParamBusqueda] = useState("");
  const [listaTiposDocumentos, setListaTiposDocumentos] = useState<
    TipoDocumento[]
  >([]);
  const [listaFormatoDocumento, setListaFormatoDocumento] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [palabraClaveFin, setPalabraClaveFin] = useState("");
  const [criteriosBusqueda, setCriteriosBusqueda] = useState<any[]>([]);
  const [criterioBusquedaId, setCriterioBusquedaId] = useState<any>();
  const [nombreFormato, setNombreFormato] = useState<any>();
  const [tipoValidacion, setTipoValidacion] = useState("");
  const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState<TipoDocumento>({
    idTipoDocumento: "0",
    codigo: "",
    fraseBusqInicio: "",
    fraseBusqFin: "",
    idCriterioBusqueda: null,
    criterioBusqueda: "",
    idFormatoDocumento: undefined,
    contieneNumSoli: false,
    descripcion: "",
    usuarioCreacion: "",
    usuarioModificacion: "",
    estado: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [criterioBusquedaText, setCriterioBusquedaText] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [regExp, setRegExp] = useState<RegExp>(/.*/);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  //
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaTiposDocImportar, setListaTiposDocImportar] = useState<
    TipoDocumento[]
  >([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerTiposDocumentos();
    obtenerFormatoDocumento();
    obtenerCriteriosBusqueda();
  }, []);

  // Función para obtener todas los tipos de documentos
  const obtenerTiposDocumentos = async () => {
    setShowSpinner(true);
    try {
      const tiposDocumentos = await ObtenerTiposDocumentos();
      setListaTiposDocumentos(tiposDocumentos);
    } catch (error) {
      console.error("Error al obtener los tipos de documentos:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  const obtenerCriteriosBusqueda = async () => {
    const response = await ObtenerCriterioBusqueda(true);

    if (!response) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al obtener los criterios de búsqueda",
      });
    } else {
      setCriteriosBusqueda(response);
    }
  };

  const obtenerFormatoDocumento = async () => {
    setShowSpinner(true);
    try {
      const formatosDocs = await ObtenerFormatoDocumento();
      console.log(formatosDocs);
      setListaFormatoDocumento(formatosDocs);
    } catch (error) {
      console.error("Error al obtener los tipos de documentos:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Función para eliminar un tipo de documento
  const eliminarTipoDocumento = (tipoDocumento: TipoDocumento) => {
    openConfirm("¿Está seguro que desea cambiar el estado?", async () => {
      try {
        setShowSpinner(true);
        const tipoDocumentoEliminar = {
          ...tipoDocumento,
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: new Date().toISOString(),
        };
        const response = await EliminarTipoDocumento(tipoDocumentoEliminar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerTiposDocumentos();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al cambiar estado del tipo de documento",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al cambiar estado del tipo de documento",
        });
      } finally {
        setShowSpinner(false);
      }
    });
  };

  // Función para abrir el modal y editar un tipo de documento
  const editarTipoDocumento = (tipoDocumento: TipoDocumento) => {
    if (!["eeb", "sdl", "eebosdl"].includes(tipoDocumento.fraseBusqFin)) {
      setPalabraClaveFin(tipoDocumento.fraseBusqFin);
      tipoDocumento.fraseBusqFin = "otro";
    }
    setCriterioBusquedaId(tipoDocumento.idCriterioBusqueda);
    setCriterioBusquedaText(tipoDocumento.criterioBusqueda);
    setNuevoTipoDocumento(tipoDocumento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setCriterioBusquedaId(null);
    setCriterioBusquedaText("");
    setNuevoTipoDocumento({
      idTipoDocumento: "0",
      codigo: "",
      fraseBusqInicio: "",
      fraseBusqFin: "",
      idCriterioBusqueda: null,
      criterioBusqueda: "",
      idFormatoDocumento: -1,
      contieneNumSoli: false,
      descripcion: "",
      usuarioCreacion: "",
      usuarioModificacion: "",
      estado: true,
    });
    setPalabraClaveFin("");
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
    openConfirm("¿Está seguro que desea guardar?", async () => {
      let palabraFin = nuevoTipoDocumento.fraseBusqFin;
      if (nuevoTipoDocumento.fraseBusqFin === "otro") {
        palabraFin = palabraClaveFin;
      }

      if (isEditing) {
        // Editar tipo de dotcumento
        try {
          setShowSpinner(true);
          const tipoDocumentoActualizar = {
            ...nuevoTipoDocumento,
            idCriterioBusqueda: criterioBusquedaId,
            fraseBusqFin: palabraFin,
            usuarioModificacion: identificacionUsuario,
            fechaModificacion: new Date().toISOString(),
          };
          console.log(tipoDocumentoActualizar);
          const response = await ActualizarTipoDocumento(
            tipoDocumentoActualizar
          );

          if (response) {
            setShowAlert(true);
            setMensajeRespuesta(response);
            obtenerTiposDocumentos();
          } else {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "Error al actualizar el tipo de documento",
            });
          }
        } catch (error) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al actualizar el tipo de documento",
          });
        } finally {
          setShowSpinner(false);
        }
      } else {
        // Crear tipo de documento
        try {
          setShowSpinner(true);
          const tipoDocumentoACrear = {
            ...nuevoTipoDocumento,
            idTipoDocumento: "0",
            idCriterioBusqueda: criterioBusquedaId,
            fraseBusqFin: palabraFin,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: new Date().toISOString(),
          };
          console.log(tipoDocumentoACrear);
          const response = await CrearTipoDocumento(tipoDocumentoACrear);

          if (response) {
            setShowAlert(true);
            setMensajeRespuesta(response);
            obtenerTiposDocumentos();
          } else {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "Error al crear el tipo de documento",
            });
          }
        } catch (error) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al crear el tipo de documento",
          });
        } finally {
          setShowSpinner(false);
        }
      }
      handleModal(); // Cierra el modal
    });
  };

  // Encabezados de la tabla con acciones
  const encabezadoTiposDocumentos = [
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
      id: "descripcion",
      name: "Descripción",
      selector: (row: TipoDocumento) => row.descripcion,
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
      cell: (row: TipoDocumento) => (
        <>
          <Button
            onClick={() => editarTipoDocumento(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarTipoDocumento(row)}
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
    setListaTiposDocImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaTiposDocImportar([]);
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
        const formattedData: TipoDocumento[] = jsonData.slice(1).map((row) => {
          const obj: Partial<TipoDocumento> = {};

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === "Código" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Número de Caracteres" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (
              property === "Descripción" &&
              (value === undefined || value === "")
            )
              InfoValida = false;

            // Asignar valores al objeto TipoDocumento
            obj.idTipoDocumento = "0" as string;
            if (property === "Código") obj.codigo = value as string;

            if (property === "Descripción") obj.descripcion = value as string;
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.usuarioModificacion = "";
          });
          return obj as TipoDocumento; //  convertimos a un objeto de TipoDocumento
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
          if (codigo.length > 10) errores.push("Código (máximo 10 caracteres)");
          if (typeof descripcion !== "string" || descripcion === null)
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
        setListaTiposDocImportar(formattedData);
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

    var tiposDocumentos = listaTiposDocImportar.map((item) => {
      return {
        idTipoDocumento: item.idTipoDocumento,
        codigo: item.codigo,
        descripcion: item.descripcion,
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: "",
        fechaCreacion: new Date().toISOString(),
      };
    });

    // Función para verificar si ya existe en listaTiposDocumentos
    const tipoDocExists = (tipoDocumento: TipoDocumento) => {
      return listaTiposDocumentos.some(
        (existingPersona) => existingPersona.codigo === tipoDocumento.codigo
      );
    };

    // Filtrar  para eliminar duplicados
    const tiposDocSinDuplicados = tiposDocumentos.filter(
      (petipoDoc: any) => !tipoDocExists(petipoDoc)
    );

    if (tiposDocumentos.length > 0 && tiposDocSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: `Los tipos de documento que intenta importar ya existen.`,
      });

      setShowSpinner(false);
      return;
    }
    const respuesta: ErrorResponse[] = await ImportarTiposDocumentos(
      tiposDocSinDuplicados
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
        obtenerTiposDocumentos();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Importación exitosamente.",
        });
      }
    }
  };

  const handleCriterioBusqueda = (criterio: any) => {
    const crit = criteriosBusqueda.filter(
      (x: any) => x.idCriterioBusqueda === criterio
    )[0];
    const criterioText = crit.criterioBusqueda;
    /*
    const regularExp = crit.expresionRegular;
    const tipoV = crit.validacion;
     setParamBusqueda("");

    setTipoValidacion(tipoV);
    setRegExp(new RegExp(regularExp));

    */
    setCriterioBusquedaText(criterioText);
    setCriterioBusquedaId(criterio);
  };

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte =
      "Reporte de tipos de documento DocSync - " +
      new Date().toLocaleDateString() +
      ".xlsx";
    const nombreHoja = "Tipos de documento";

    const columnsSelect = ["codigo", "descripcion", "estado"];

    const columnas = {
      codigo: "Código",
      descripcion: "Descripción",
      estado: "Estado",
    } as any;

    const datosFiltrados = listaTiposDocumentos.map((item: any) => {
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
  };

  return (
    <>
      <h1 className="title">Catálogo Tipos de Documentos</h1>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        {/* Tabla de tipos de documentos */}
        <Grid
          gridHeading={encabezadoTiposDocumentos}
          gridData={listaTiposDocumentos}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigo", "descripcion"]}
          selectableRows={false}
          botonesAccion={[
            {
              // condicion: true,
              //accion: handleModalImportar,
              //icono: <FaFileCirclePlus className="me-2" size={24} />,
              //texto: "Importar",
            },
            {
              condicion: true,
              accion: descargaCatalogo,
              icono: <FaDownload className="me-2" size={24} />,
              texto: "Descargar",
            },
          ]}
        ></Grid>
      </div>

      {/* Modal para agregar o editar un tipo de documento */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={
          isEditing ? "Editar Tipo de Documento" : "Agregar Tipo de Documento"
        }
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formTipoDocumento"
      >
        <Form id="formTipoDocumento" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoTipoDocumento">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={nuevoTipoDocumento.codigo}
                  onChange={handleChange}
                  required
                  maxLength={10}
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
          <Row>
            <Col md={6}>
              <Form.Group controlId="formImagen">
                <div
                  style={{
                    display: "flex",
                    alignContent: "start",
                    alignItems: "start",
                    flexDirection: "column",
                  }}
                >
                  <Form.Label style={{ marginTop: "3%" }}>
                    Formato de documento
                  </Form.Label>
                  <Form.Select
                    name="idFormatoDocumento"
                    value={nuevoTipoDocumento.idFormatoDocumento}
                    onChange={(selected) => {
                      const tipoText = selected.target.selectedOptions[0].text;

                      setNombreFormato(tipoText);
                      if (tipoText === "Imagen") {
                        setCriterioBusquedaId(null);
                        setCriterioBusquedaText("");
                        setNuevoTipoDocumento({
                          ...nuevoTipoDocumento,
                          fraseBusqInicio: "",
                          fraseBusqFin: "",
                          idFormatoDocumento: Number(selected.target.value),
                        });
                      } else {
                        setNuevoTipoDocumento({
                          ...nuevoTipoDocumento,
                          idFormatoDocumento: Number(selected.target.value),
                        });
                      }
                    }}
                    required={nuevoTipoDocumento.idFormatoDocumento === -1}
                  >
                    <option value="">Seleccione una opción</option>
                    {listaFormatoDocumento.map((f: any) => (
                      <option value={f.idFormato}>{f.nombre}</option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            {nombreFormato !== "Imagen" && (
              <Col md={6}>
                <Form.Group controlId="formNumSoli">
                  <div
                    style={{
                      display: "flex",
                      alignContent: "start",
                      alignItems: "start",
                      flexDirection: "column",
                    }}
                  >
                    <Form.Label style={{ marginTop: "3%" }}>
                      ¿Contiene número de solicitud?
                    </Form.Label>
                    <div className="w-100">
                      <BootstrapSwitchButton
                        checked={nuevoTipoDocumento.contieneNumSoli === true}
                        onlabel="Sí"
                        onstyle="success"
                        offlabel="No"
                        offstyle="danger"
                        style="w-100 mx-3;"
                        onChange={(checked) => {
                          setNuevoTipoDocumento({
                            ...nuevoTipoDocumento,
                            contieneNumSoli: checked,
                          });
                          setCriterioBusquedaId(null);
                          setCriterioBusquedaText("");
                        }}
                      />
                    </div>
                  </div>
                </Form.Group>
              </Col>
            )}
          </Row>
          {nombreFormato !== "Imagen" && (
            <Row style={{ marginTop: "3%" }}>
              <Col md={6}>
                <Form.Group controlId="formBusInicio">
                  <Form.Label>Frase de búsqueda inicio</Form.Label>
                  <Form.Control
                    name="fraseBusqInicio"
                    value={nuevoTipoDocumento.fraseBusqInicio}
                    onChange={handleChange}
                    required
                    min={1}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formBusqFin">
                  <Form.Label>Frase de búsqueda Fin</Form.Label>
                  <Form.Select
                    name="fraseBusqFin"
                    value={nuevoTipoDocumento.fraseBusqFin}
                    onChange={(selected) => {
                      setNuevoTipoDocumento({
                        ...nuevoTipoDocumento,
                        fraseBusqFin: selected.target.value,
                      });
                      setPalabraClaveFin("");
                    }}
                    required={nuevoTipoDocumento.fraseBusqFin === ""}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="eeb">Al primer espacio en blanco</option>
                    <option value="sdl">Al primer salto de línea</option>
                    <option value="eebosdl">
                      Al primer espacio o salto de línea
                    </option>
                    <option value="otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
          <Row style={{ marginTop: "3%" }}>
            {nuevoTipoDocumento.fraseBusqFin === "otro" && (
              <Col md={6}>
                <Form.Group controlId="formBusInicio">
                  <Form.Label>Palabra o símbolo clave fin</Form.Label>
                  <Form.Control
                    name="fraseInicio"
                    value={palabraClaveFin}
                    onChange={(e) => setPalabraClaveFin(e.target.value)}
                    required
                    min={1}
                  />
                </Form.Group>
              </Col>
            )}
            {nombreFormato !== "Imagen" &&
              nuevoTipoDocumento.contieneNumSoli === false && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tipo de campo de búsqueda</Form.Label>
                    <Select
                      onChange={(e: any) => handleCriterioBusqueda(e.value)}
                      className="GrupoFiltro"
                      required={
                        criterioBusquedaId === "" || criterioBusquedaId === null
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: "16px",
                          padding: "2%",
                          outline: "none",
                          marginTop: "1%",
                        }),
                      }}
                      placeholder="Seleccione"
                      options={criteriosBusqueda.map((x: any) => ({
                        value: x.idCriterioBusqueda,
                        label: x.criterioBusqueda,
                      }))}
                      value={
                        criterioBusquedaText !== ""
                          ? {
                              value: criterioBusquedaId,
                              label: criterioBusquedaText,
                            }
                          : null
                      }
                      noOptionsMessage={() => "Opción no encontrada"}
                    />
                  </Form.Group>
                </Col>
              )}
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
                  <Form.Label>Tipo de documento activo</Form.Label>
                  <div className="w-100">
                    <BootstrapSwitchButton
                      checked={nuevoTipoDocumento.estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) =>
                        (nuevoTipoDocumento.estado = checked)
                      }
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

export default CatalogoTiposDocumentos;
