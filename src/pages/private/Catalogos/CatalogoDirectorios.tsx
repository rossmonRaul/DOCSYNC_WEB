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
import Select from "react-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

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
  tipo?: 'serie' | 'subserie' | 'expediente';
  [key: string]: any;
}

interface SelectOption {
  value: number;
  label: string;
}

interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

function CatalogoDirectorios() {
  const { setShowSpinner } = useSpinner();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario") || '';
  
  const [listaSeries, setListaSeries] = useState<Directorio[]>([]);
  const [listaSubseries, setListaSubseries] = useState<Directorio[]>([]);
  const [listaExpedientes, setListaExpedientes] = useState<Directorio[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'serie' | 'subserie' | 'expediente'>('todos');
  
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

  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaDirectoriosImportar, setListaDirectoriosImportar] = useState<Directorio[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setShowSpinner(true);
    try {
      const [series, subseries, expedientes] = await Promise.all([
        ObtenerSerie().catch(() => []),
        ObtenerSubserie().catch(() => []),
        ObtenerExpediente().catch(() => [])
      ]);
      
      setListaSeries(Array.isArray(series) ? series.filter(s => s.idSerie !== undefined) : []);
      setListaSubseries(Array.isArray(subseries) ? subseries.filter(ss => ss.idSubserie !== undefined) : []);
      setListaExpedientes(Array.isArray(expedientes) ? expedientes.filter(e => e.idExpediente !== undefined) : []);
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

  // Validaciones
  const validarDirectorio = (directorio: Directorio, tipo: 'serie' | 'subserie' | 'expediente'): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    const nombre = tipo === 'serie' ? directorio.nomSerie : 
                  tipo === 'subserie' ? directorio.nomSubserie : 
                  directorio.nomExpediente;

    // Validar campo vacío
    if (!nombre || nombre.trim() === '') {
      errores.push(`El nombre del ${tipo} no puede estar vacío`);
    }

    // Validar caracteres prohibidos
    const caracteresProhibidos = /[<>:"\/\\|?*«]/;
    if (caracteresProhibidos.test(nombre || '')) {
      errores.push('El nombre contiene caracteres no permitidos: < > : " / \\ | ? * «');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  };

  const validarDuplicados = async (directorio: Directorio, tipo: 'serie' | 'subserie' | 'expediente'): Promise<{ valido: boolean; errores: string[] }> => {
    const errores: string[] = [];
    
    try {
      if (tipo === 'serie') {
        const existe = listaSeries.some(s => 
          s.nomSerie?.toLowerCase() === directorio.nomSerie?.toLowerCase() && 
          (!isEditing || s.idSerie !== directorio.idSerie)
        );
        if (existe) errores.push('Ya existe una serie con ese nombre');
      }
      
      if (tipo === 'subserie' && directorio.idSerie) {
        const existe = listaSubseries.some(ss => 
          ss.nomSubserie?.toLowerCase() === directorio.nomSubserie?.toLowerCase() && 
          ss.idSerie === directorio.idSerie &&
          (!isEditing || ss.idSubserie !== directorio.idSubserie)
        );
        if (existe) errores.push('Ya existe una subserie con ese nombre en esta serie');
      }
      
      if (tipo === 'expediente' && directorio.idSubserie) {
        const existe = listaExpedientes.some(e => 
          e.nomExpediente?.toLowerCase() === directorio.nomExpediente?.toLowerCase() && 
          e.idSubserie === directorio.idSubserie &&
          (!isEditing || e.idExpediente !== directorio.idExpediente)
        );
        if (existe) errores.push('Ya existe un expediente con ese nombre en esta subserie');
      }
    } catch (error) {
      console.error("Error al validar duplicados:", error);
      errores.push('Error al validar duplicados');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  };

  const eliminarDirectorio = (directorio: Directorio) => {
    const tipo = directorio.idExpediente ? 'expediente' : directorio.idSubserie ? 'subserie' : 'serie';
    const nombre = directorio.nomExpediente || directorio.nomSubserie || directorio.nomSerie || '';
    
    openConfirm(`¿Está seguro que desea cambiar el estado del ${tipo} "${nombre}"?`, async () => {
      try {
        const directorioActualizar: Directorio = {
          ...directorio,
          usuarioModificacion: identificacionUsuario,
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

  const editarDirectorio = (directorio: Directorio) => {
    setTipoDirectorio(
      directorio.idExpediente ? 'expediente' : 
      directorio.idSubserie ? 'subserie' : 'serie'
    );
    
    setNuevoDirectorio(directorio);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setTipoDirectorio('serie');
    setNuevoDirectorio({
      estado: true
    });
    setMensajeRespuesta({ indicador: 0, mensaje: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      [e.target.name]: e.target.value,
    });
  };

  const handleTipoChange = (tipo: 'serie' | 'subserie' | 'expediente') => {
    setTipoDirectorio(tipo);
    setMensajeRespuesta({ indicador: 0, mensaje: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSpinner(true);

    // Validaciones básicas
    const validacionBasica = validarDirectorio(nuevoDirectorio, tipoDirectorio);
    if (!validacionBasica.valido) {
      mostrarError(validacionBasica.errores.join('\n'));
      setShowSpinner(false);
      return;
    }

    // Validación de duplicados
    const validacionDuplicados = await validarDuplicados(nuevoDirectorio, tipoDirectorio);
    if (!validacionDuplicados.valido) {
      mostrarError(validacionDuplicados.errores.join('\n'));
      setShowSpinner(false);
      return;
    }

    try {
      let response;
      
      // Configura el objeto según el tipo de directorio
      const directorioData: Directorio = {
        estado: nuevoDirectorio.estado,
        usuarioCreacion: identificacionUsuario,
        fechaCreacion: new Date().toISOString()
      };
  
      // Añade campos específicos según el tipo
      if (tipoDirectorio === 'serie') {
        directorioData.nomSerie = nuevoDirectorio.nomSerie;
      } else if (tipoDirectorio === 'subserie') {
        directorioData.idSerie = nuevoDirectorio.idSerie;
        directorioData.nomSubserie = nuevoDirectorio.nomSubserie;
      } else if (tipoDirectorio === 'expediente') {
        directorioData.idSerie = nuevoDirectorio.idSerie;
        directorioData.idSubserie = nuevoDirectorio.idSubserie;
        directorioData.nomExpediente = nuevoDirectorio.nomExpediente;
      }
  
      // Llamada al servicio (usa solo los campos necesarios)
      if (isEditing) {
        directorioData.usuarioModificacion = identificacionUsuario;
        directorioData.fechaModificacion = new Date().toISOString();
        response = await ActualizarDirectorio(directorioData);
      } else {
        response = await CrearDirectorio(directorioData);
      }
  
      if (response) {
        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerDatos();
      }
    } catch (error) {
      mostrarError(`Error al ${isEditing ? 'actualizar' : 'crear'} el ${tipoDirectorio}`);
    } finally {
      setShowSpinner(false);
      handleModal();
    }
  };

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

  const encabezadoDirectorios = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: Directorio) => getNombreDirectorio(row),
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
        <div className="d-flex">
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
        </div>
      ),
      width: "120px",
    }
  ];

  const filtrarDatos = (): Directorio[] => {
    let datosCombinados: Directorio[] = [];
    
    if (filtroTipo === 'todos') {
      datosCombinados = [
        ...listaSeries.map(s => ({ ...s, tipo: 'serie' as 'serie' })),
        ...listaSubseries.map(ss => ({ ...ss, tipo: 'subserie' as 'subserie' })),
        ...listaExpedientes.map(e => ({ ...e, tipo: 'expediente' as 'expediente' }))
      ];
    } else if (filtroTipo === 'serie') {
      datosCombinados = listaSeries.map(s => ({ ...s, tipo: 'serie' as 'serie' }));
    } else if (filtroTipo === 'subserie') {
      datosCombinados = listaSubseries.map(ss => ({ ...ss, tipo: 'subserie' as 'subserie' }));
    } else if (filtroTipo === 'expediente') {
      datosCombinados = listaExpedientes.map(e => ({ ...e, tipo: 'expediente' as 'expediente' }));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      datosCombinados = datosCombinados.filter(item => 
        getNombreDirectorio(item).toLowerCase().includes(term) ||
        (item.estado ? 'activo' : 'inactivo').includes(term) ||
        getSerieNombre(item).toLowerCase().includes(term) ||
        getSubserieNombre(item).toLowerCase().includes(term)
      );
    }
    
    return datosCombinados;
  };

  const obtenerOpcionesSeries = (): SelectOption[] => {
    return listaSeries
      .filter(serie => serie.idSerie !== undefined && serie.nomSerie !== undefined)
      .map(serie => ({
        value: serie.idSerie as number,
        label: serie.nomSerie as string
      }));
  };

  const obtenerOpcionesSubseries = (): SelectOption[] => {
    if (!nuevoDirectorio.idSerie) return [];
    
    return listaSubseries
      .filter(ss => 
        ss.idSerie === nuevoDirectorio.idSerie && 
        ss.idSubserie !== undefined && 
        ss.nomSubserie !== undefined
      )
      .map(subserie => ({
        value: subserie.idSubserie as number,
        label: subserie.nomSubserie as string
      }));
  };

  const handleSerieChange = (option: SelectOption | null) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      idSerie: option?.value,
      idSubserie: tipoDirectorio === 'expediente' ? undefined : nuevoDirectorio.idSubserie
    });
    setMensajeRespuesta({ indicador: 0, mensaje: "" });
  };

  const handleSubserieChange = (option: SelectOption | null) => {
    setNuevoDirectorio({
      ...nuevoDirectorio,
      idSubserie: option?.value
    });
    setMensajeRespuesta({ indicador: 0, mensaje: "" });
  };

  const descargaCatalogo = async () => {
    setShowSpinner(true);
    try {
      const nombreReporte = "Reporte de directorios - " + new Date().toLocaleDateString() + ".xlsx";
      const nombreHoja = "Directorios";

      const datosFiltrados = filtrarDatos().map(item => ({
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
    } catch (error) {
      mostrarError("Error al generar el reporte");
    } finally {
      setShowSpinner(false);
    }
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
        
        <div style={{ marginBottom: '20px' }}>
          <Grid
            gridHeading={encabezadoDirectorios}
            gridData={filtrarDatos()}
            handle={handleModal}
            buttonVisible={true}
            filterColumns={["nombre", "estado"]}
            
            selectableRows={false}
            botonesAccion={[
              {
                condicion: true,
                accion: descargaCatalogo,
                icono: <FaDownload className="me-2" size={24} />,
                texto: "Descargar",
              }
            ]}
          />
          
          <div style={{
            position: 'absolute',
            right: '860px',
            top: '200px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            zIndex: 1000
          }}>
             <Form.Group controlId="filtroTipo" style={{ width: '150px' }}>
              <Form.Select 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'serie' | 'subserie' | 'expediente')}
                className="form-select-sm"
              >
                <option value="todos">Todos</option>
                <option value="serie">Series</option>
                <option value="subserie">Subseries</option>
                <option value="expediente">Expedientes</option>
              </Form.Select>
            </Form.Group>
            
            {/* <Form.Group controlId="searchTerm" style={{ width: '200px' }}>
              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </Form.Group> */}
          </div>
        </div>
      </div>

      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? `Editar ${tipoDirectorio}` : `Agregar ${tipoDirectorio}`}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formDirectorio"
      >
        <Form id="formDirectorio" onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group controlId="formTipoDirectorio">
                <Form.Label>Tipo de Directorio</Form.Label>
                <div className="d-flex">
                  <Button
                    variant={tipoDirectorio === 'serie' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('serie')}
                    className="me-2"
                    disabled={isEditing}
                  >
                    Serie
                  </Button>
                  <Button
                    variant={tipoDirectorio === 'subserie' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('subserie')}
                    className="me-2"
                    disabled={isEditing}
                  >
                    Subserie
                  </Button>
                  <Button
                    variant={tipoDirectorio === 'expediente' ? 'primary' : 'outline-primary'}
                    onClick={() => handleTipoChange('expediente')}
                    disabled={isEditing}
                  >
                    Expediente
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {(tipoDirectorio === 'subserie' || tipoDirectorio === 'expediente') && (
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group controlId="formSerie">
                  <Form.Label>Serie</Form.Label>
                  <Select<SelectOption>
                    options={obtenerOpcionesSeries()}
                    value={nuevoDirectorio.idSerie ? {
                      value: nuevoDirectorio.idSerie,
                      label: listaSeries.find(s => s.idSerie === nuevoDirectorio.idSerie)?.nomSerie || ''
                    } : null}
                    onChange={handleSerieChange}
                    placeholder="Seleccione una serie"
                    isDisabled={isEditing}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {tipoDirectorio === 'expediente' && (
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group controlId="formSubserie">
                  <Form.Label>Subserie</Form.Label>
                  <Select<SelectOption>
                    options={obtenerOpcionesSubseries()}
                    value={nuevoDirectorio.idSubserie ? {
                      value: nuevoDirectorio.idSubserie,
                      label: listaSubseries.find(ss => ss.idSubserie === nuevoDirectorio.idSubserie)?.nomSubserie || ''
                    } : null}
                    onChange={handleSubserieChange}
                    placeholder="Seleccione una subserie"
                    isDisabled={isEditing || !nuevoDirectorio.idSerie}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="mt-3">
            <Col md={12}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre*</Form.Label>
                <Form.Control
                  type="text"
                  name={
                    tipoDirectorio === 'serie' ? 'nomSerie' : 
                    tipoDirectorio === 'subserie' ? 'nomSubserie' : 'nomExpediente'
                  }
                  value={
                    nuevoDirectorio[
                      tipoDirectorio === 'serie' ? 'nomSerie' : 
                      tipoDirectorio === 'subserie' ? 'nomSubserie' : 'nomExpediente'
                    ] || ''
                  }
                  onChange={handleChange}
                  required
                  maxLength={150}
                  isInvalid={
                    (mensajeRespuesta.indicador === 0 && 
                     mensajeRespuesta.mensaje.includes('caracteres no permitidos')) ||
                    mensajeRespuesta.mensaje.includes('no puede estar vacío') ||
                    mensajeRespuesta.mensaje.includes('Ya existe')
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {mensajeRespuesta.mensaje}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  No use caracteres especiales: &lt; &gt; : " / \ | ? * «
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      <CustomModal
        size="xl"
        show={showModalImportar}
        onHide={() => setShowModalImportar(false)}
        title="Importar Directorios"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <Button
                    style={{ margin: 4 }}
                    className="btn-crear"
                    variant="primary"
                    onClick={() => {
                      // Lógica de importación aquí
                    }}
                  >
                    <FaUpload className="me-2" size={24} />
                    Cargar Archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Container>
        <br />
        {listaDirectoriosImportar.length > 0 && (
          <>
            <Grid
              gridHeading={encabezadoDirectorios}
              gridData={listaDirectoriosImportar}
              handle={() => {}}
              buttonVisible={false}
              selectableRows={false}
            />
            <Row>
              <Col md={12} className="d-flex justify-content-end">
                <Button
                  style={{ margin: 4 }}
                  className="btn-save"
                  variant="primary"
                  onClick={() => {
                    // Lógica para guardar datos importados
                  }}
                >
                  <RiSaveFill className="me-2" size={24} />
                  Guardar
                </Button>
              </Col>
            </Row>
          </>
        )}
      </CustomModal>
    </>
  );
}

export default CatalogoDirectorios;