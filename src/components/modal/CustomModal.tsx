import React from "react";
import { Modal, Button } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";

interface CustomModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl"; // Tamaños opcionales del Modal
}

const CustomModal: React.FC<CustomModalProps> = ({ show, onHide, title, children, size = "lg" }) => {
  return (
    <Modal show={show} onHide={onHide} size={size}>
      <Modal.Header closeButton={false} className="d-flex align-items-center">
        <Modal.Title>{title}</Modal.Title>
        <Button className="ms-auto btn-cancel" onClick={onHide}>
          <AiOutlineClose />
        </Button>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default CustomModal;
