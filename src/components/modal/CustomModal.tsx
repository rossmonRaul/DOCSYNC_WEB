import React from "react";
import { Modal, Button } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";
import { MdCancel } from "react-icons/md";
import { RiRestartLine, RiSaveFill } from "react-icons/ri";

interface CustomModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl"; // Tamaños opcionales del Modal
  showSubmitButton?: boolean;
  isPassReset?: boolean;
  submitButtonLabel?: string;
  formId?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  show,
  onHide,
  title,
  children,
  size = "lg",
  showSubmitButton = false,
  formId = "customFormId",
  submitButtonLabel = "Guardar",
  isPassReset = false,
}) => {
  return (
    <Modal show={show} centered onHide={onHide} size={size}>
      <Modal.Header
        style={{ background: "#9E0000", color: "#fff" }}
        closeButton={false}
        className="d-flex align-items-center"
      >
        <Modal.Title>{title}</Modal.Title>
        {/*<Button className="ms-auto btn-cancel" onClick={onHide}>
          <AiOutlineClose />
        </Button>
        */}
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        {showSubmitButton && (
          <Button
            variant="primary"
            className="mt-3 mb-0 btn-cancel"
            style={{ width: "120px" }}
            onClick={onHide}
          >
            <MdCancel className="me-2" size={22} />
            Cancelar
          </Button>
        )}
        {showSubmitButton && (
          <Button
            variant="primary"
            type="submit"
            form={formId}
            className="mt-3 mb-0 btn-save"
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            {isPassReset ? (
              <RiRestartLine className="me-2" size={24} />
            ) : (
              <RiSaveFill className="me-2" size={24} />
            )}

            {submitButtonLabel}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
