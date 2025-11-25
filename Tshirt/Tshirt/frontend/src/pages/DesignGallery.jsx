import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Dropdown, Form, InputGroup, ButtonGroup } from 'react-bootstrap';
import { FiTrash2, FiEdit, FiSearch, FiFilter, FiPlus, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiImage, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../contexts/DesignContext';
import { toast } from 'react-toastify';
import '../styles/DesignGallery.css';

const DesignGallery = () => {
  const navigate = useNavigate();
  const { 
    designs, 
    loading, 
    error, 
    fetchDesigns, 
    deleteDesign,
    pagination
  } = useDesign();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [isBulkAction, setIsBulkAction] = useState(false);
  
  const categories = [
    { id: 'all', name: 'All Designs' },
    { id: 'tshirt', name: 'T-Shirts' },
    { id: 'hoodie', name: 'Hoodies' },
    { id: 'templates', name: 'Templates' },
    { id: 'saved', name: 'Saved Designs' },
  ];
  
  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'name_asc', name: 'Name (A-Z)' },
    { id: 'name_desc', name: 'Name (Z-A)' },
  ];
  
  // Fetch designs when filters change
  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const sort = getSortQuery();
        await fetchDesigns(page, 12, sort, searchQuery, selectedCategory);
      } catch (error) {
        console.error('Error loading designs:', error);
        toast.error('Failed to load designs');
      }
    };
    
    loadDesigns();
  }, [page, sortBy, searchQuery, selectedCategory, fetchDesigns]);
  
  const getSortQuery = () => {
    switch (sortBy) {
      case 'newest':
        return '-createdAt';
      case 'oldest':
        return 'createdAt';
      case 'name_asc':
        return 'name';
      case 'name_desc':
        return '-name';
      default:
        return '-createdAt';
    }
  };
  
  const handleDesignClick = (design) => {
    if (isBulkAction) {
      toggleSelectDesign(design._id);
    } else {
      navigate(`/design/${design._id}`);
    }
  };
  
  const handleEditDesign = (e, designId) => {
    e.stopPropagation();
    navigate(`/designer/${designId}`);
  };
  
  const handleDeleteDesign = async (e, designId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      try {
        await deleteDesign(designId);
        toast.success('Design deleted successfully');
        // Remove from selected designs if it was selected
        setSelectedDesigns(selectedDesigns.filter(id => id !== designId));
      } catch (error) {
        console.error('Error deleting design:', error);
        toast.error('Failed to delete design');
      }
    }
  };
  
  const toggleSelectDesign = (designId) => {
    setSelectedDesigns(prev => 
      prev.includes(designId)
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };
  
  const handleBulkDelete = async () => {
    if (selectedDesigns.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDesigns.length} selected designs? This action cannot be undone.`)) {
      try {
        // Delete all selected designs
        await Promise.all(selectedDesigns.map(id => deleteDesign(id)));
        
        toast.success(`Successfully deleted ${selectedDesigns.length} designs`);
        setSelectedDesigns([]);
        setIsBulkAction(false);
      } catch (error) {
        console.error('Error deleting designs:', error);
        toast.error('Failed to delete some designs');
      }
    }
  };
  
  const renderDesignCard = (design) => (
    <Col key={design._id} xs={12} md={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} className="mb-4">
      <Card 
        className={`design-card h-100 ${selectedDesigns.includes(design._id) ? 'selected' : ''}`}
        onClick={() => handleDesignClick(design)}
      >
        {isBulkAction && (
          <div className="selection-checkbox">
            <Form.Check 
              type="checkbox"
              checked={selectedDesigns.includes(design._id)}
              onChange={() => {}}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        <div className="design-thumbnail" style={{ backgroundColor: design.tshirtColor || '#f8f9fa' }}>
          {design.thumbnail ? (
            <Card.Img variant="top" src={design.thumbnail} alt={design.name} />
          ) : (
            <div className="no-thumbnail d-flex align-items-center justify-content-center">
              <FiImage size={48} className="text-muted" />
            </div>
          )}
          
          <div className="design-actions">
            <Button 
              variant="primary" 
              size="sm" 
              className="me-2"
              onClick={(e) => handleEditDesign(e, design._id)}
            >
              <FiEdit className="me-1" /> Edit
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={(e) => handleDeleteDesign(e, design._id)}
            >
              <FiTrash2 />
            </Button>
          </div>
        </div>
        
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <Card.Title className="h6 mb-1 text-truncate" title={design.name}>
              {design.name}
            </Card.Title>
            {design.isPublic && (
              <Badge bg="info" className="ms-2">Public</Badge>
            )}
          </div>
          
          {design.description && (
            <Card.Text className="small text-muted mb-2 text-truncate-2" title={design.description}>
              {design.description}
            </Card.Text>
          )}
          
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">
              {new Date(design.updatedAt).toLocaleDateString()}
            </small>
            {design.category && (
              <Badge bg="secondary" className="ms-2">
                {design.category.charAt(0).toUpperCase() + design.category.slice(1)}
              </Badge>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
  
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center mt-4">
        <nav aria-label="Design pagination">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft />
              </button>
            </li>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show first 2 pages, current page, and last 2 pages
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                // Near the start
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 2) {
                // Near the end
                pageNum = pagination.totalPages - 4 + i;
              } else {
                // In the middle
                pageNum = page - 2 + i;
              }
              
              return (
                <li 
                  key={pageNum} 
                  className={`page-item ${page === pageNum ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${page >= pagination.totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                <FiChevronRight />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };
  
  if (loading && designs.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your designs...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading designs</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => fetchDesigns()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4 design-gallery">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Designs</h2>
        <div>
          <Button 
            variant="primary" 
            className="me-2"
            onClick={() => navigate('/designer')}
          >
            <FiPlus className="me-1" /> New Design
          </Button>
          
          <Button 
            variant={isBulkAction ? 'danger' : 'outline-secondary'}
            onClick={() => {
              setIsBulkAction(!isBulkAction);
              if (isBulkAction) setSelectedDesigns([]);
            }}
          >
            {isBulkAction ? 'Cancel' : 'Select Multiple'}
          </Button>
        </div>
      </div>
      
      {/* Bulk actions bar */}
      {isBulkAction && selectedDesigns.length > 0 && (
        <div className="bulk-actions-bar p-3 mb-4 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{selectedDesigns.length}</strong> design{selectedDesigns.length !== 1 ? 's' : ''} selected
            </div>
            <div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="me-2"
                onClick={handleBulkDelete}
              >
                <FiTrash2 className="me-1" /> Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and search */}
      <div className="filters-container mb-4">
        <Row className="g-3">
          <Col md={6} lg={4}>
            <InputGroup>
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>
          </Col>
          
          <Col md={3} lg={2}>
            <Form.Select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          
          <Col md={3} lg={2}>
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          
          <Col md={6} lg={2} className="ms-auto">
            <ButtonGroup className="w-100">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <FiGrid />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <FiList />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
      
      {/* Design grid/list */}
      {designs.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-state-icon mb-3">
            <FiPackage size={48} className="text-muted" />
          </div>
          <h4>No designs found</h4>
          <p className="text-muted">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by creating a new design.'}
          </p>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/designer')}
          >
            <FiPlus className="me-1" /> Create Design
          </Button>
        </div>
      ) : (
        <>
          <Row className={viewMode === 'grid' ? 'row-cols-1 row-cols-md-2 row-cols-lg-3 g-4' : 'g-4'}>
            {designs.map(renderDesignCard)}
          </Row>
          
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default DesignGallery;
