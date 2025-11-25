import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { useDesign } from '../../contexts/DesignContext';
import { FaTrash, FaEye, FaCheck } from 'react-icons/fa';

export const DesignLoadModal = ({ show, onHide, onSelect, onDeleteSuccess }) => {
  const { designs, loading, error, fetchDesigns, deleteDesign } = useDesign();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 6;

  // Fetch designs when the modal opens
  useEffect(() => {
    if (show) {
      fetchDesigns(page, limit);
    }
  }, [show, page, limit, fetchDesigns]);

  const handleSelect = (design) => {
    setSelectedDesign(design._id === selectedDesign?._id ? null : design);
  };

  const handleConfirm = () => {
    if (selectedDesign) {
      onSelect(selectedDesign);
      onHide();
    }
  };

  const handleDelete = async (designId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      setDeletingId(designId);
      try {
        const success = await deleteDesign(designId);
        if (success && onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (err) {
        console.error('Error deleting design:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const renderDesignCard = (design) => (
    <Col md={6} lg={4} key={design._id} className="mb-4">
      <Card 
        className={`h-100 cursor-pointer ${selectedDesign?._id === design._id ? 'border-primary' : ''}`}
        onClick={() => handleSelect(design)}
      >
        <div style={{ height: '150px', overflow: 'hidden' }}>
          <Card.Img 
            variant="top" 
            src={design.thumbnail} 
            alt={design.name}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
        </div>
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="h6 mb-0 text-truncate" title={design.name}>
              {design.name}
            </Card.Title>
            <div className="d-flex">
              <Button
                variant="outline-danger"
                size="sm"
                className="me-2"
                onClick={(e) => handleDelete(design._id, e)}
                disabled={deletingId === design._id}
              >
                {deletingId === design._id ? (
                  <Spinner as="span" size="sm" animation="border" role="status" />
                ) : (
                  <FaTrash />
                )}
              </Button>
              <Button 
                variant={selectedDesign?._id === design._id ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => handleSelect(design)}
              >
                {selectedDesign?._id === design._id ? <FaCheck /> : <FaEye />}
              </Button>
            </div>
          </div>
          {design.description && (
            <Card.Text className="small text-muted text-truncate" title={design.description}>
              {design.description}
            </Card.Text>
          )}
          <div className="mt-auto small text-muted">
            {new Date(design.updatedAt).toLocaleDateString()}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Load Saved Design</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading && designs.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="visually-hidden">Loading...</span>
            <p className="mt-2">Loading your designs...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-5">
            <p>You don't have any saved designs yet.</p>
            <p>Create and save a design to see it here.</p>
          </div>
        ) : (
          <>
            <Row>
              {designs.map(renderDesignCard)}
            </Row>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button 
                variant="outline-secondary"
                onClick={() => handlePageChange(page + 1)}
                disabled={designs.length < limit}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={!selectedDesign}
        >
          Load Selected Design
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DesignLoadModal;
