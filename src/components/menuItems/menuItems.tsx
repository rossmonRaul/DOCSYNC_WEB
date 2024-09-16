import { FaUpload } from "react-icons/fa";
import { MdDocumentScanner } from "react-icons/md";
import { AiOutlineFileSearch } from "react-icons/ai";

interface MenuItem {
  path: string;
  name: string;
  icon?: JSX.Element;
  roles?: number[];
  children?: MenuItem[]; // Para elementos colapsables
}

export const menuItem: MenuItem[] = [
  {
    path: "/cargar-archivos",
    name: "Carga de archivos",
    icon: <FaUpload size={30} style={{ marginRight: "5px" }}/>,
    roles: [1, 2,3,4],
  },
  {
    path: "/cargar-scanner",
    name: "Carga desde el scanner",
    icon: <MdDocumentScanner size={30} style={{ marginRight: "5px" }} />,
    roles: [1,2,3,4],
  },
  {
    path: "/buscar-archivos",
    name: "Buscar archivos",
    icon: <AiOutlineFileSearch size={30} style={{ marginRight: "5px" }} />,
    roles: [1,2,3,4],
  },
];
