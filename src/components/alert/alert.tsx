import React, { useRef, useEffect } from "react";
import Alert from 'react-bootstrap/Alert';
import { CSSTransition } from "react-transition-group";
import '../../css/alert.css';
import { CiCircleCheck } from "react-icons/ci";
import { CgDanger } from "react-icons/cg";

export const AlertDismissible:React.FC<any> = ({ mensaje, setShow }) => {
    const ref = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 6000);

        return () => {
            clearTimeout(timer);
        };
    }, [setShow]);

    const getVariant = () => {
        if (mensaje.indicador == 0) {
            return "success";
        } else if (mensaje.indicador == 1) {
            return "danger";
        } 
        return "info";
    };  

    return (
        <CSSTransition ref={ref} in={true}  timeout={1000} unmountOnExit>
            <div className="alert-container">
                <div className="alert-modal">
                    <Alert variant={getVariant()}>
                        <p>
                            {mensaje.indicador==0 ? 
                            <CiCircleCheck size={35} style={{marginRight: '5px'}}/> 
                            : <CgDanger size={35} style={{marginRight: '5px'}}/> }                            
                            {mensaje.mensaje}
                        </p>
                    </Alert>
                </div>
            </div>
        </CSSTransition>
    );
};
