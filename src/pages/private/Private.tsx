import { Navigate, Route } from "react-router-dom";
import { PrivateRoutes } from "../../models/routes";
import RoutesWithNotFound from "../../utilities/RoutesWithNotFound";

function Private() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />
    </RoutesWithNotFound>
  );
}

export default Private;
