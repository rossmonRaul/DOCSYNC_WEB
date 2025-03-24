import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

interface ConfirmModalProps {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header style={{background:"#9E0000",color:"#fff"}} closeButton={false}>
        <Modal.Title>Confirmación</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary"
          className="mt-3 mb-0 btn-cancel"
          style={{width:"80px"}}
          onClick={onClose}
        >
       <MdCancel className="me-2" size={22} />
          No
        </Button>
        <Button
          variant="primary"
          style={{width:"82px"}}
          className="mt-3 mb-0 btn-save"
          onClick={onConfirm}
        >
             <FaCheckCircle className="me-2" size={20} />
          Sí
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
