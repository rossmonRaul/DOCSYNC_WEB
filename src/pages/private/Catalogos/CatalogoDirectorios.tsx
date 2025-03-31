import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal";
import { Grid } from "../../../components/table/tabla";
import { 
  ObtenerSerie, 
  ObtenerSubserie, 
  ObtenerExpediente, 
  CrearDirectorio, 
  ActualizarDirectorio, 
  EliminarDirectorio 
} from "../../../servicios/ServicioDirectorio";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
import Select, { GroupBase } from "react-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

// Interfaz mejorada para la información del directorio
interface Directorio {
  idSerie?: number;
  idSubserie?: number;
  idExpediente?: number;
  nomSerie?: string;
  nomSubserie?: string;
  nomExpediente?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
  estado: boolean;
  [key: string]: any; // Permite acceso dinámico a propiedades
}

// Tipo para las opciones de los select
interface SelectOption {
  value: number;
  label: string;
}

// Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoDirectorios() {
  const { setShowSpinner } = useSpinner();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  
  // Estados para las listas
  const [listaSeries, setListaSeries] = useState<Directorio[]>([]);
  const [listaSubseries, setListaSubseries] = useState<Directorio[]>([]);
  const [listaExpedientes, setListaExpedientes] = useState<Directorio[]>([]);
  
  // Estados para el formulario
  const [showModal, setShowModal] = useState(false);
  const [tipoDirectorio, setTipoDirectorio] = useState<'serie' | 'subserie' | 'expediente'>('serie');
  const [nuevoDirectorio, setNuevoDirectorio] = useState<Directorio>({
    estado: true
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState<ErrorResponse>({
    indicador: 0,
    mensaje: "",
  });
  const { openConfirm } = useConfirm();

  // Estados para importación
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaDirectoriosImportar, setListaDirectoriosImportar] = useState<Directorio[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Obtener datos iniciales
  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setShowSpinner(true);
    try {
      const [series, subseries, expedientes] = await Promise.all([
        ObtenerSerie(),
        ObtenerSubserie(),
        ObtenerExpediente()
      ]);
      setListaSeries(series);
      setListaSubseries(subseries);
      setListaExpedientes(expedientes);
      console.log(series)
      console.log(subseries)
      console.log(expedientes)
    } catch (error) {
      console.error("Error al obtener datos:", error);
      mostrarError("Error al obtener los datos del directorio");
    } finally {
      setShowSpinner(false);
    }
  };

  const mostrarError = (mensaje: string) => {
    setShowAlert(true);
    setMensajeRespuesta({
      indicador: 1,
      mensaje: mensaje
    });
  };

  // Función para eliminar un directorio
  const eliminarDirectorio = (directorio: Directorio) => {
    const tipo = directorio.idExpediente ? 'expediente' : directorio.idSubserie ? 'subserie' : 'serie';
    const nombre = directorio.nomExpediente || directorio.nomSubserie || directorio.nomSerie || '';
    
    openConfirm(`¿Está seguro que desea cambiar el estado del ${tipo} "${nombre}"?`, async () => {
      try {
        const directorioActualizar: Directorio = {
          ...directorio,
          usuarioModificacion: identificacionUsuario || '',
          fechaModificacion: new Date().toISOString(),
          estado: !directorio.estado
        };

        const response = await EliminarDirectorio(directorioActualizar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerDatos();
        } else {
          mostrarError(`Error al cambiar el estado del ${tipo}`);
        }
      } catch (error) {
        mostrarError(`Error al cambiar el estado del ${tipo}`);
      }
    });
  };

  // Función para abrir el modal y editar un directorio
  const editarDirectorio = (directorio: Directorio) => {
    setTipoDirectorio(
      directorio.idExpediente ? 'expediente' : 
      directorio.idSubserie ? 'subserie' : 'serie'
    );
    
    setNuevoDirectorio(directorio);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setTipoDirectorio('serie');
    setNuevoDirectorio({
      estado: true
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el cambio de tipo de directorio
  const handleTipoChange = (tipo: 'serie' | 'subserie' | 'expediente') => {
    setTipoDirectorio(tipo);
  };

  // Maneja el envío del formulario para agregar o editar un directorio
  const handleSubmit = async (e: React.FormEvent) => {
    setShowSpinner(true);
    e.preventDefault();

    try {
      let response;
      const directorioActualizar: Directorio = {
        ...nuevoDirectorio,
        usuarioModificacion: identificacionUsuario || '',
        fechaModificacion: new Date().toISOString()
      };

      if (isEditing) {
        // Editar
        response = await ActualizarDirectorio(directorioActualizar);
      } else {
        // Crear
        directorioActualizar.usuarioCreacion = identificacionUsuario || '';
        directorioActualizar.fechaCreacion = new Date().toISOString();
        response = await CrearDirectorio(directorioActualizar);
      }

      if (response) {
        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerDatos();
      } else {
        mostrarError(`Error al ${isEditing ? 'actualizar' : 'crear'} el ${tipoDirectorio}`);
      }
    } catch (error) {
      mostrarError(`Error al ${isEditing ? 'actualizar' : 'crear'} el ${tipoDirectorio}`);
    } finally {
      setShowSpinner(false);
      handleModal();
    }
  };

  // Funciones auxiliares para obtener nombres
  const getNombreDirectorio = (directorio: Directorio): string => {
    if (directorio.idExpediente) return directorio.nomExpediente || '';
    if (directorio.idSubserie) return directorio.nomSubserie || '';
    return directorio.nomSerie || '';
  };

  const getSerieNombre = (directorio: Directorio): string => {
    if (directorio.idExpediente) {
      const subserie = listaSubseries.find(ss => ss.idSubserie === directorio.idSubserie);
      const serie = listaSeries.find(s => s.idSerie === subserie?.idSerie);
      return serie?.nomSerie || '';
    }
    if (directorio.idSubserie) {
      const serie = listaSeries.find(s => s.idSerie === directorio.idSerie);
      return serie?.nomSerie || '';
    }
    return '';
  };

  const getSubserieNombre = (directorio: Directorio): string => {
    if (directorio.idExpediente) {
      const subserie = listaSubseries.find(ss => ss.idSubserie === directorio.idSubserie);
      return subserie?.nomSubserie || '';
    }
    return '';
  };

  // Encabezados de la tabla principal
  const encabezadoDirectorios = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: Directorio) => getNombreDirectorio(row),
      sortable: true,
      style: { fontSize: "1.2em" }
    },
    {
      id: "tipo",
      name: "Tipo",
      selector: (row: Directorio) => 
        row.idExpediente ? "Expediente" : 
        row.idSubserie ? "Subserie" : "Serie",
      sortable: true,
      style: { fontSize: "1.2em" }
    },
    {
      id: "serie",
      name: "Serie",
      selector: (row: Directorio) => getSerieNombre(row),
      sortable: true,
      style: { fontSize: "1.2em" }
    },
    {
      id: "subserie",
      name: "Subserie",
      selector: (row: Directorio) => getSubserieNombre(row),
      sortable: true,
      style: { fontSize: "1.2em" }
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: Directorio) => row.estado ? 'Activo' : 'Inactivo',
      sortable: true,
      style: { fontSize: "1.2em" }
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Directorio) => (
        <>
          <Button
            onClick={() => editarDirectorio(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarDirectorio(row)}
            className="bg-secondary"
          >
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>
        </>
      ),
      width: "120px",
    }
  ];

  // Datos combinados para la tabla principal
  const datosCombinados = [
    ...listaSeries.map(s => ({ ...s, tipo: 'serie' })),
    ...listaSubseries.map(ss => ({ ...ss, tipo: 'subserie' })),
    ...listaExpedientes.map(e => ({ ...e, tipo: 'expediente' }))
  ];

  // Función para manejar el cambio de serie (cuando se selecciona subserie o expediente)
  const handleSerieChange = (option: SelectOption | null) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      idSerie: option?.value,
      idSubserie: tipoDirectorio === 'expediente' ? undefined : nuevoDirectorio.idSubserie
    });
  };

  // Función para manejar el cambio de subserie (cuando se selecciona expediente)
  const handleSubserieChange = (option: SelectOption | null) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      idSubserie: option?.value
    });
  };

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = "Reporte de directorios - " + new Date().toLocaleDateString() + ".xlsx";
    const nombreHoja = "Directorios";

    const datosFiltrados = datosCombinados.map(item => ({
      "Tipo": item.tipo,
      "Nombre": getNombreDirectorio(item),
      "Serie": getSerieNombre(item),
      "Subserie": getSubserieNombre(item),
      "Estado": item.estado ? "Activo" : "Inactivo"
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    
    await XLSX.writeFile(workbook, nombreReporte);
    setShowSpinner(false);
  };

  return (
    <>
      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <h1 style={{ marginLeft: 20 }} className="title">
              Catálogo de Directorios
            </h1>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        
        {/* Tabla de directorios */}
        <Grid
          gridHeading={encabezadoDirectorios}
          gridData={datosCombinados}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["nombre", "tipo", "serie", "subserie", "estado"]}
          selectableRows={false}
          botonesAccion={[
            {
              condicion: true,
              accion: () => setShowModalImportar(true),
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

      {/* Modal para agregar o editar un directorio */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? `Editar ${tipoDirectorio}` : `Agregar ${tipoDirectorio}`}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formDirectorio"
      >
        <Form id="formDirectorio" onSubmit={handleSubmit}>
          {!isEditing && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Tipo de Directorio*</Form.Label>
                <div className="d-flex">
                  <Button
                    variant={tipoDirectorio === 'serie' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('serie')}
                    className="me-2"
                  >
                    Serie
                  </Button>
                  <Button
                    variant={tipoDirectorio === 'subserie' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('subserie')}
                    className="me-2"
                  >
                    Subserie
                  </Button>
                  <Button
                    variant={tipoDirectorio === 'expediente' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('expediente')}
                  >
                    Expediente
                  </Button>
                </div>
              </Col>
            </Row>
          )}
          
          {/* Campo de nombre según el tipo */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre*</Form.Label>
                <Form.Control
                  type="text"
                  name={`nom${tipoDirectorio.charAt(0).toUpperCase() + tipoDirectorio.slice(1)}`}
                  value={
                    tipoDirectorio === 'serie' ? nuevoDirectorio.nomSerie || '' :
                    tipoDirectorio === 'subserie' ? nuevoDirectorio.nomSubserie || '' :
                    nuevoDirectorio.nomExpediente || ''
                  }
                  onChange={handleChange}
                  required
                  maxLength={255}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Selector de serie para subserie o expediente */}
          {(tipoDirectorio === 'subserie' || tipoDirectorio === 'expediente') && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="formSerie">
                  <Form.Label>Serie*</Form.Label>
                  <Select<SelectOption, false, GroupBase<SelectOption>>
                    value={
                      nuevoDirectorio.idSerie ? 
                      { 
                        value: nuevoDirectorio.idSerie, 
                        label: listaSeries.find(s => s.idSerie === nuevoDirectorio.idSerie)?.nomSerie || 'Seleccione'
                      } : null
                    }
                    onChange={handleSerieChange}
                    options={listaSeries.map(serie => ({
                      value: serie.idSerie || 0,
                      label: serie.nomSerie || 'Sin nombre'
                    }))}
                    placeholder="Seleccione una serie"
                    noOptionsMessage={() => "No hay series disponibles"}
                    isDisabled={isEditing}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          
          {/* Selector de subserie para expediente */}
          {tipoDirectorio === 'expediente' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="formSubserie">
                  <Form.Label>Subserie*</Form.Label>
                  <Select<SelectOption, false, GroupBase<SelectOption>>
                    value={
                      nuevoDirectorio.idSubserie ? 
                      { 
                        value: nuevoDirectorio.idSubserie, 
                        label: listaSubseries
                          .filter(ss => ss.idSerie === nuevoDirectorio.idSerie)
                          .find(ss => ss.idSubserie === nuevoDirectorio.idSubserie)?.nomSubserie || 'Seleccione'
                      } : null
                    }
                    onChange={handleSubserieChange}
                    options={listaSubseries
                      .filter(ss => ss.idSerie === nuevoDirectorio.idSerie)
                      .map(subserie => ({
                        value: subserie.idSubserie || 0,
                        label: subserie.nomSubserie || 'Sin nombre'
                      }))}
                    placeholder="Seleccione una subserie"
                    noOptionsMessage={() => "No hay subseries disponibles para esta serie"}
                    isDisabled={isEditing || !nuevoDirectorio.idSerie}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          
          {/* Estado */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="formEstado">
                <div className="d-flex align-items-center">
                  <Form.Label className="me-3 mb-0">Estado:</Form.Label>
                  <BootstrapSwitchButton
                    checked={nuevoDirectorio.estado}
                    onlabel="Activo"
                    offlabel="Inactivo"
                    onstyle="success"
                    offstyle="danger"
                    onChange={(checked: boolean) => 
                      setNuevoDirectorio({ ...nuevoDirectorio, estado: checked })
                    }
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* Modal para importar directorios */}
      <CustomModal
        size="xl"
        show={showModalImportar}
        onHide={() => setShowModalImportar(false)}
        title="Importar Directorios"
        showSubmitButton={false}
      >
        <Container>
          <Form>
            <Form.Group controlId="formFile">
              <Row className="align-items-center mb-3">
                <Col md={9}>
                  <Form.Control
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Lógica para procesar el archivo Excel
                    }}
                    disabled={!file}
                  >
                    <FaUpload className="me-2" />
                    Cargar Archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
          
          {/* Tabla de previsualización */}
          {listaDirectoriosImportar.length > 0 && (
            <>
              <Grid
                gridHeading={[
                  { id: "tipo", name: "Tipo", selector: (row: any) => row.tipo },
                  { id: "nombre", name: "Nombre", selector: (row: any) => row.nombre },
                  { id: "serie", name: "Serie", selector: (row: any) => row.serie },
                  { id: "subserie", name: "Subserie", selector: (row: any) => row.subserie }
                ]}
                gridData={listaDirectoriosImportar}
                buttonVisible={false}
                selectableRows={false}
              />
              
              <Row className="mt-3">
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    onClick={() => {
                      // Lógica para guardar los datos importados
                    }}
                  >
                    <RiSaveFill className="me-2" />
                    Guardar
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </CustomModal>
    </>
  );
}

export default CatalogoDirectorios;