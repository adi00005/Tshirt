import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useDesign } from '../../contexts/DesignContext';

export const DesignSaveModal = ({ show, onHide, canvasRef, design = null }) => {
  const { currentDesign, saveDesign, updateDesign, saving, error } = useDesign();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState('');

  // Initialize form with design data if editing
  useEffect(() => {
    if (design) {
      setFormData({
        name: design.name || '',
        description: design.description || '',
        isPublic: design.isPublic || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isPublic: false,
      });
    }
  }, [design]);

  // Generate preview image from canvas
  useEffect(() => {
    if (show && canvasRef.current) {
      const canvas = canvasRef.current;
      setPreview(canvas.toDataURL('image/png'));
    }
  }, [show, canvasRef]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setValidationError('Please enter a name for your design');
      return;
    }
    
    setValidationError('');
    setIsSubmitting(true);
    
    try {
      // Get canvas data
      const canvas = canvasRef.current;
      const designData = {
        ...formData,
        thumbnail: preview,
        designData: {
          canvasImage: canvas.toDataURL('image/png'),
          objects: canvas.toJSON(['id', 'name', 'type', 'left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle', 'flipX', 'flipY', 'opacity', 'fill', 'fontFamily', 'fontSize', 'text', 'src']),
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvas.backgroundColor || '#ffffff',
        },
      };
      
      if (design && design._id) {
        // Update existing design
        await updateDesign(design._id, designData);
      } else {
        // Save new design
        await saveDesign(designData);
      }
      
      onHide();
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{design ? 'Update Design' : 'Save Design'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="designName">
                <Form.Label>Design Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter design name"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="designDescription">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a description for your design"
                />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="designVisibility">
                <Form.Check
                  type="switch"
                  id="isPublic"
                  name="isPublic"
                  label="Make this design public"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Public designs may be featured in our community gallery
                </Form.Text>
              </Form.Group>
              
              {validationError && <Alert variant="danger">{validationError}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
            </div>
            
            <div className="col-md-6">
              <div className="border rounded p-2 text-center">
                <p className="mb-2 fw-bold">Design Preview</p>
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Design preview" 
                    className="img-fluid"
                    style={{ maxHeight: '250px', maxWidth: '100%', border: '1px solid #ddd' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading preview...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                {design ? 'Updating...' : 'Saving...'}
              </>
            ) : design ? (
              'Update Design'
            ) : (
              'Save Design'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DesignSaveModal;
