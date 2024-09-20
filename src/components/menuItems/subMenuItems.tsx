interface MenuItem {
    path: string;
    name: string;
    icon?: JSX.Element;
    roles?: number[];
    children?: MenuItem[]; // Para elementos colapsables
  }

export const subMenuCatalogos: MenuItem[] = [
    {
      path: "/catalogo-personas",
      name: "Personas",
      roles: [1, 2,3,4],
    },
    {
      path: "/catalogo-estados",
      name: "Estados",
      roles: [1,2,3,4],
    },
  ];

  export const subMenuOtros: MenuItem[] = [
    {
      path: "/historial",
      name: "Historial",
      roles: [1, 2,3,4],
    },
    {
      path: "/firma-digital",
      name: "Firma Digital",
      roles: [1,2,3,4],
    },
  ];

