import { FaHistory, FaSignature, FaUser, FaFileAlt, FaUsers, FaUserCog, FaUniversity } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

interface MenuItem {
    path: string;
    name: string;
    icon?: IconType;
    roles?: number[];
    children?: MenuItem[]; // Para elementos colapsables
  }

export const subMenuCatalogos: MenuItem[] = [
  {
    path: "/catalogo-personas",
    name: "Personas",
    roles: [1, 2, 3, 4],
    icon: FaUser // Asigna el ícono de Personas
  },
  {
    path: "/catalogo-instituciones",
    name: "Instituciónes",
    roles: [1, 2, 3, 4],
    icon: FaUniversity // Asigna el ícono de Personas
  },
  /*{
    path: "/catalogo-estados",
    name: "Estados",
    roles: [1, 2, 3, 4],
    icon: FaFlag // Asigna el ícono de Estados
  },
  */
  {
    path: "/catalogo-tiposDocumentos",
    name: "Tipos de Documentos",
    roles: [1, 2, 3, 4],
    icon: FaFileAlt // Asigna el ícono de Tipos de Documentos
  },
  /*{
    path: "/jerarquia-documento",
    name: "Jerarquía de Documento",
    roles: [1, 2, 3, 4],
    icon: FaSitemap // Asigna el ícono de Jerarquía de Documento
  },
  */
  {
    path: "/catalogo-usuarios",
    name: "Usuarios",
    roles: [1,2,3,4],
    icon: FaUsers   // Asigna el ícono de Usuarios
  },    
  ];

  export const subMenuOtros: MenuItem[] = [
    {
      path: "/historial",
      name: "Historial",
      roles: [1, 2,3,4],
      icon: FaHistory,
    },
    {
      path: "/firma-digital",
      name: "Firma Digital",
      roles: [1,2,3,4],
      icon: FaSignature,
    },
    {
      path: "/admin-roles",
      name: "Administración de roles",
      roles: [1,2,3,4],
      icon: FaUserCog,
    },

    
  ];


