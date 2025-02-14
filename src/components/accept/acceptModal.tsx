import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

interface AcceptModalProps {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const AcceptModal: React.FC<AcceptModalProps> = ({
  show,
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header style={{background:"#9E0000",color:"#fff"}} closeButton={false}>
        <Modal.Title>Información</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          style={{width:"30%"}}
          className="mt-3 mb-0 btn-save"
          onClick={onConfirm}
        >
        Entendido  
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AcceptModal;
