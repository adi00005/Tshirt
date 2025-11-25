import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Card, Form } from 'react-bootstrap';
import { useDesign } from '../../contexts/DesignContext';

export const TemplateGallery = ({ show, onHide, onApply }) => {
  const { templates, loading, error, fetchTemplates, applyTemplate } = useDesign();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applying, setApplying] = useState(false);

  // Available template categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'sports', name: 'Sports' },
    { id: 'business', name: 'Business' },
    { id: 'casual', name: 'Casual' },
    { id: 'holiday', name: 'Holiday' },
    { id: 'funny', name: 'Funny' },
  ];

  // Fetch templates when the modal opens or category changes
  useEffect(() => {
    if (show) {
      const category = selectedCategory === 'all' ? null : selectedCategory;
      fetchTemplates(category);
    }
  }, [show, selectedCategory, fetchTemplates]);

  const handleApply = async () => {
    if (!selectedTemplate) return;
    
    setApplying(true);
    try {
      const newDesign = await applyTemplate(selectedTemplate._id);
      onApply(newDesign);
      onHide();
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setApplying(false);
    }
  };

  const renderTemplateCard = (template) => (
    <Col md={6} lg={4} key={template._id} className="mb-4">
      <Card 
        className={`h-100 cursor-pointer ${selectedTemplate?._id === template._id ? 'border-primary' : ''}`}
        onClick={() => setSelectedTemplate(template)}
      >
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <Card.Img 
            variant="top" 
            src={template.thumbnail} 
            alt={template.name}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
        </div>
        <Card.Body>
          <Card.Title className="h6 mb-1">{template.name}</Card.Title>
          {template.category && (
            <span className="badge bg-secondary mb-2">
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </span>
          )}
          {template.description && (
            <Card.Text className="small text-muted">
              {template.description.length > 100 
                ? `${template.description.substring(0, 100)}...` 
                : template.description}
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Choose a Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h6 className="mb-3">Categories</h6>
          <div className="d-flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading && templates.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="visually-hidden">Loading...</span>
            <p className="mt-2">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-5">
            <p>No templates found in this category.</p>
            <p>Please try another category or check back later.</p>
          </div>
        ) : (
          <Row>
            {templates.map(renderTemplateCard)}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApply}
          disabled={!selectedTemplate || applying}
        >
          {applying ? (
            <>
              <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
              Applying...
            </>
          ) : (
            'Apply Template'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateGallery;
