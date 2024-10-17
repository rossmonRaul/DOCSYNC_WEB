import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { 
  ActualizarCriterioBusqueda,
  AgregarCriterioBusqueda,
  CargaMasivaCriterioBusqueda,
  EliminarCriterioBusqueda,
  ObtenerCriterioBusqueda,
  ObtenerTipoValidacion
} from "../../../servicios/ServicioCriterioBusqueda";
import { FaBan, FaRedo, FaUpload } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import Select from "react-select"
import * as XLSX from 'xlsx';
import { RiSaveFill } from "react-icons/ri";
import { FaFileCirclePlus } from "react-icons/fa6";

// Componente principal
function CatalogoCriterioBusqueda() {

  const { setShowSpinner } = useSpinner();
  const [criterios, setCriterios] = useState<any[]>([]);
  const [tiposValidacion, setTiposValidacion]= useState<any[]>([]);
  const [idCriterio, setIdCriterio] = useState<string>("");
  const [idTipoValidacion, setIdTipoValidacion] = useState<string>("");
  const [tipoValidacionTexto, setTipoValidacionTexto] = useState<string>("");
  const [valorExterno, setValorExterno] = useState<string>("");
  const [nombreCriterio, setNombreCriterio] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});  

  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaImportar, setListaImportar] = useState<any[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerCriteriosBusqueda();
    obtenerTipoValidcion();
  }, []);

  const obtenerCriteriosBusqueda = async () => {
    try {
      setShowSpinner(true);
      const response = await ObtenerCriterioBusqueda(false);
      setCriterios(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener criterios de búsqueda:", error);
    }
  };

  const obtenerTipoValidcion = async () => {
    try {
      setShowSpinner(true);
      const response = await ObtenerTipoValidacion();
      setTiposValidacion(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener tipo de validación:", error);
    }
  };

  // Función para inhabilitar un criterio
  const eliminar = async (row: any) => {
    try {
      setShowSpinner(true);
      const data = {
        idCriterioBusqueda: row.idCriterioBusqueda
      }

      const response = await EliminarCriterioBusqueda(data);

      setShowAlert(true);
      setMensajeRespuesta(response);
      obtenerCriteriosBusqueda();
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al eliminar criterio de búsqueda:", error);
    }
  };

  // Función para abrir el modal y editar
  const editar = (row: any) => {
    setNombreCriterio(row.criterioBusqueda);
    setEstado(row.estado);
    setIdCriterio(row.idCriterioBusqueda);
    setIdTipoValidacion(row.idTipoValidacion);
    setTipoValidacionTexto(row.validacion);
    setValorExterno(row.valorExterno);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNombreCriterio('');
    setEstado(false);
    setIdCriterio('');
    setIdTipoValidacion('');
    setTipoValidacionTexto('');
    setValorExterno('');
  };

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowSpinner(true);
    if (isEditing) {
      try {
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        if(nombreCriterio.trim() === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: "Ingrese el nombre del criterio de búsqueda"});
        }
        if(valorExterno.trim() === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: "Ingrese el valor externo del criterio de búsqueda"});
        }
        else{
          const obj = {
            idCriterioBusqueda: idCriterio,
            criterioBusqueda: nombreCriterio,
            valorExterno: valorExterno,
            idTipoValidacion: idTipoValidacion,
            estado: estado,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: (new Date()).toISOString()
          };
          
          const response = await ActualizarCriterioBusqueda(obj);         

          if(response.indicador === 0){
            handleModal();
            obtenerCriteriosBusqueda();
          }              

          setShowAlert(true);
          setMensajeRespuesta(response);
        }

      } catch (error) {
        console.error("Error al actualizar criterio de búsqueda:", error);
      }
    } else {
      try {      
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');
        
        if(nombreCriterio.trim() === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: "Ingrese el nombre del criterio de búsqueda"});
        }
        if(valorExterno.trim() === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: "Ingrese el valor externo del criterio de búsqueda"});
        }
        else{
          const obj = {
            criterioBusqueda: nombreCriterio,
            valorExterno: valorExterno,
            idTipoValidacion: idTipoValidacion,
            estado: estado,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: (new Date()).toISOString()
          };

          const response  = await AgregarCriterioBusqueda(obj);

          if(response.indicador === 0){           
            handleModal(); // Cierra el modal 
            obtenerCriteriosBusqueda();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }

      } catch (error) {
        console.error("Error al crear el criterio de búsqueda:", error);
      }
    }

    setShowSpinner(false);
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    { id: "criterioBusqueda", name: "Criterio de búsqueda", selector: (row: any) => row.criterioBusqueda, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "valorExterno", name: "Valor externo", selector: (row: any) => row.valorExterno, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "validacion", name: "Tipo de validación", selector: (row: any) => row.validacion, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "estado", name: "Estado", selector: (row: any) => (row.estado ? 'Activo' : 'Inactivo'), sortable: true,style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: any) => (
        <>
        <Button
            onClick={() => editar(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit  />
          </Button>
          <Button
            size="sm"
             onClick={() => eliminar(row)}
            className="bg-secondary">
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaImportar([])
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    setListaImportar([]);
    const file = e.target.files[0];
    setShowImportButton(false);
    setFile(file);
  }

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {        
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Convierte el ArrayBuffer a una cadena binaria
        const binaryString = new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");

        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
        
        // Obtener nombres de propiedades desde la primera fila
        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        // Crear un array de objetos utilizando los nombres de propiedades
        const formattedData: any[] = jsonData.slice(1).map((row) => {
          const obj: Partial<any> = {}; 

          properties.forEach((property, index) => {
            const value = row[index];

            if (property === 'Criterio búsqueda' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Tipo de validación' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Valor externo' && (value === undefined || value === '')) InfoValida = false;

            // Asignar valores al objeto
            if (property === 'Criterio búsqueda') obj.criterioBusqueda = value;
            if (property === 'Tipo de validación'){
              const id = tiposValidacion.filter((x: any) => x.validacion === value)[0];
              
              obj.validacion = value;
              obj.idTipoValidacion = id !== undefined ? id.idTipoValidacion : undefined;              
            }
            if (property === 'Valor externo') obj.valorExterno = value;    
            obj.usuarioCreacion = identificacionUsuario ? identificacionUsuario:"";
            obj.fechaCreacion = (new Date()).toISOString();
          });
          return obj as any;
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

        var tiposValidacionNa = "";
        var nombresRep = "";
        var nombresRepetidos = false;

        // Validar que todos los campos son correctos
        formattedData.forEach((item: any) => {
          
          // Validar columnas
          if(!item.criterioBusqueda){
            setShowAlert(true);
            setMensajeRespuesta({indicador: 1, mensaje: "No se encontró la columna \"Criterio búsqueda\""});
            return;
          }
          if(!item.validacion){
            setShowAlert(true);
            setMensajeRespuesta({indicador: 1, mensaje: "No se encontró la columna \"Tipo de validación\""});
            return;
          }
          if(!item.valorExterno){
            setShowAlert(true);
            setMensajeRespuesta({indicador: 1, mensaje: "No se encontró la columna \"Valor externo\""});
            return;
          }
          // Se identifican tipos de validción que no existen en el sistema
          if(!item.idTipoValidacion){
            tiposValidacionNa += tiposValidacionNa === "" ? item.validacion : ", " + item.validacion;
          }
          if (typeof item.criterioBusqueda !== 'string' || item.criterioBusqueda === null) errores.push('Criterio búsqueda');
          if (item.criterioBusqueda.length > 50) errores.push('Criterio búsqueda (máximo 50 caracteres)');
          if (typeof item.validacion !== 'string' || item.validacion === null) errores.push('Tipo de validación');
          if (item.validacion.length > 50) errores.push('Tipo de validación (mayor a 50 caracteres)');
          if (typeof valorExterno !== 'string' || valorExterno === null) errores.push('Valor externo');
          if (item.valorExterno.length > 100) errores.push('Valor externo (mayor a 100 caracteres)');

          // Se identifican los nombres de criterios ya existentes
          if(criterios.filter((x: any) => x.criterioBusqueda === item.criterioBusqueda).length > 0){
            nombresRep += nombresRep === "" ? item.criterioBusqueda : ", " + item.criterioBusqueda;
            item.criterioBusqueda = undefined; // Se marca como undefined para no cargarlo
          }

          // Se identifican nombres de criterios repetidos en documento
          if(formattedData.filter((x: any) => x.criterioBusqueda === item.criterioBusqueda).length > 1){
            item.criterioBusqueda = undefined; // Se marca como undefined para no cargarlo
            nombresRepetidos = true;
          }
        });
        
        // Indicador de validaciones que no existen en sistema
        if(tiposValidacionNa.length > 0){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "No se encontraron los siguientes tipos de validación en el sistema: "+ tiposValidacionNa + ". Por lo que no serán cargados"
          })
          setShowSpinner(false);
        }
        // Indicador de nombres repetidos
        else if(nombresRep.length > 0){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "Los siguientes criterios de búsqueda, ya existen en el sistema: "+ nombresRep + ". Por lo que no serán cargados"
          });
          setShowSpinner(false);
        }
        // Indicador de nombres repetidos en el archivo de carga
        else if(nombresRepetidos){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "Se encontraron registros con el mismo criterio de búsqueda, por lo que serán descartados para la carga. Favor validar los registros"
          });
          setShowSpinner(false);
        }
        else if (errores.length > 0) {
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
        }
        else if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje
          });
          setShowSpinner(false);          
        }
        
        setShowSpinner(false);
        setListaImportar(formattedData.filter((x: any) => x.idTipoValidacion && x.criterioBusqueda));
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

  const importarArchivoExcel = async () => {


    if(listaImportar.length < 1){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "No hay registros por cargar"
      })
    }
    else{
      
      setShowSpinner(true);

      var listaImportada = listaImportar.map(item => {
        return {
          criterioBusqueda: item.criterioBusqueda,
          idTipoValidacion: item.idTipoValidacion,
          descripcion: item.descripcion,
          valorExterno: item.valorExterno,
          estado: true,
          usuarioCreacion: item.usuarioCreacion,
          fechaCreacion:(new Date()).toISOString()
        };
      });

      const response = await CargaMasivaCriterioBusqueda(listaImportada);

      setShowAlert(true);
      setMensajeRespuesta(response);
      setShowSpinner(false);
      handleModalImportar();
      obtenerCriteriosBusqueda();
    }
  }

  // Encabezados de la tabla de importación sin acciones
  const encabezadoImportar = [
    {
      id: "criterioBúsqueda",
      name: "Criterio",
      selector: (row: any) => row.criterioBusqueda,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "valorExterno",
      name: "Valor externo",
      selector: (row: any) => row.valorExterno,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "validacion",
      name: "Validación",
      selector: (row: any) => row.validacion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
  ];

  return (
    <>
      <h1 className="title">Catálogo de criterios de búsqueda</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
      {showAlert && (
        <AlertDismissible
        mensaje={mensajeRespuesta}
        setShow={setShowAlert}
        />
      )}
        <br />
  
        {/* Tabla */}
        <Grid
          handle={handleModal}
          buttonVisible={true}
          gridHeading={encabezadoTabla}
          gridData={criterios}
          filterColumns={["criterioBusqueda", "valorExterno", "validacion", "estado"]}
          selectableRows={false}
          botonesAccion={[          
            {
            condicion:true,
            accion:handleModalImportar,
            icono:<FaFileCirclePlus className="me-2" size={24} />,
            texto:"Importar"
            },
            ]}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar */}
        <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar criterio de búsqueda" : "Agregar criterio de búsqueda"}
          showSubmitButton={true}
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
          formId="formDep"
          >
          <Form onSubmit={handleSubmit} id="formDep">
            <Row>
              <Col md={6}>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre del criterio</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={nombreCriterio}
                    onChange={(e: any) => setNombreCriterio(e.target.value)}
                    maxLength={50}
                    style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tipo de validación</Form.Label>
                  <Select
                    value={
                      idTipoValidacion !== '' ?
                        ({ 
                          value: idTipoValidacion,
                          label: tipoValidacionTexto ?? ""
                        })
                      : null
                    }
                    onChange={(e: any) => (setIdTipoValidacion(e.value), setTipoValidacionTexto(
                      tiposValidacion.filter((x: any) => x.idTipoValidacion === e.value)[0].validacion
                    ))}
                    className="GrupoFiltro"
                    styles={{
                      control: (provided: any) => ({
                        ...provided,
                        fontSize: '16px', outline: 'none', marginTop: '1%'
                      }),
                    }}
                    placeholder="Seleccione"
                    options={tiposValidacion.map((x: any) => ({
                      value: x.idTipoValidacion,
                      label: x.validacion,
                    }))}
                  /> 
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formNombre">
                  <Form.Label style={{marginTop: '3%'}}>Valor externo</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={valorExterno}
                    onChange={(e: any) => setValorExterno(e.target.value)}
                    maxLength={50}
                    style={{fontSize: '16px', padding: '2%', outline: 'none'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEstado">
                  <div style={{
                      display: 'flex',
                      alignContent: 'start',
                      alignItems: 'start',
                      flexDirection: 'column'
                    }}>
                    <Form.Label style={{marginTop: '3%'}}>Criterio activo</Form.Label>
                    <div className="w-100">
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

export default CatalogoCriterioBusqueda;
