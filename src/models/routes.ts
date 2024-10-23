export const PublicRoutes = {
    LOGIN: 'login',
    BUSCARARCHIVOSSOLICITUD: 'buscar-archivos-solicitud/:numSolicitudSecreta/:usuario/:token',
};

export const PrivateRoutes = {
    PRIVATE: 'private',
    DASHBOARD: 'dashboard',
    // pagina de sa para administrar las empresas ↓
    //ADMINISTRAREMPRESAS: 'administrarempresas',
    //ADMINISTRARFINCAS: 'administrarfincas',
    CARGARARCHIVOS: 'cargar-archivos',
    CARGASCANNER : 'cargar-scanner',
    BUSCARARCHIVOS: 'buscar-archivos',
    HISTORIALARCHIVOS: 'historial',
    CATALOGOPERSONAS: 'catalogo-personas',
    CATALOGOESTADOS: 'catalogo-estados',
    CATALOGOTIPOSDOCUMENTOS: 'catalogo-tiposDocumentos',
    CATALOGOJERARQUIADOCUMENTOS:'jerarquia-documento',
    CATALOGOUSUARIOS: 'catalogo-usuarios',
    ADMINROLES: 'admin-roles',
    CATALOGODEPARTAMENTOS: 'catalogo-departamentos',
    CATALOGODEPUESTOS: 'catalogo-puestos',
    CATALOGOCRITERIOBUSQUEDA: 'catalogo-criterio-busqueda',
    

};
