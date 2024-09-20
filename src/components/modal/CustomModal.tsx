import React from "react";
import { Modal, Button } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";
import { RiSaveFill } from "react-icons/ri";

interface CustomModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl"; // Tamaños opcionales del Modal
  showSubmitButton?: boolean;
  submitButtonLabel?: string;
  formId?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ show, onHide, title, children, size = "lg", 
  showSubmitButton = false, formId = "customFormId",
  submitButtonLabel = "Guardar",}) => {
  return (
    <Modal show={show} onHide={onHide} size={size}>
      <Modal.Header closeButton={false} className="d-flex align-items-center">
        <Modal.Title>{title}</Modal.Title>
        <Button className="ms-auto btn-cancel" onClick={onHide}>
          <AiOutlineClose />
        </Button>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>   
        {showSubmitButton && (             
           <Button variant="primary" type="submit" form={formId} className="mt-3 mb-0 btn-save">
            <RiSaveFill className="me-2" size={24} /> 
           {submitButtonLabel}
         </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
