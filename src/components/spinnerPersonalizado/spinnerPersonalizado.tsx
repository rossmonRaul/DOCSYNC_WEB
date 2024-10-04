import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { MoonLoader } from "react-spinners";
import "../../css/spinnerPersonalizado.css";

const SpinnerPersonalizado: React.FC<{ show?: boolean }> = ({
  show = false, // Valor predeterminado para show
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <CSSTransition
      nodeRef={ref}
      in={show}
      classNames="fade"
      timeout={300}
      unmountOnExit
    >
      <div ref={ref} className="spinner-container">
        <MoonLoader color="#9E0000"   size={60}/>
      </div>
    </CSSTransition>
  );
};

export default SpinnerPersonalizado;
