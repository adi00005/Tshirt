import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import designAPI from '../services/designService';

// Initial state
const initialState = {
  designs: [],
  currentDesign: null,
  templates: [],
  loading: false,
  error: null,
  saving: false,
  designLoaded: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

// Action types
const ActionTypes = {
  FETCH_DESIGNS_START: 'FETCH_DESIGNS_START',
  FETCH_DESIGNS_SUCCESS: 'FETCH_DESIGNS_SUCCESS',
  FETCH_DESIGNS_ERROR: 'FETCH_DESIGNS_ERROR',
  FETCH_DESIGN_START: 'FETCH_DESIGN_START',
  FETCH_DESIGN_SUCCESS: 'FETCH_DESIGN_SUCCESS',
  FETCH_DESIGN_ERROR: 'FETCH_DESIGN_ERROR',
  SAVE_DESIGN_START: 'SAVE_DESIGN_START',
  SAVE_DESIGN_SUCCESS: 'SAVE_DESIGN_SUCCESS',
  SAVE_DESIGN_ERROR: 'SAVE_DESIGN_ERROR',
  UPDATE_DESIGN_START: 'UPDATE_DESIGN_START',
  UPDATE_DESIGN_SUCCESS: 'UPDATE_DESIGN_SUCCESS',
  UPDATE_DESIGN_ERROR: 'UPDATE_DESIGN_ERROR',
  DELETE_DESIGN_START: 'DELETE_DESIGN_START',
  DELETE_DESIGN_SUCCESS: 'DELETE_DESIGN_SUCCESS',
  DELETE_DESIGN_ERROR: 'DELETE_DESIGN_ERROR',
  FETCH_TEMPLATES_START: 'FETCH_TEMPLATES_START',
  FETCH_TEMPLATES_SUCCESS: 'FETCH_TEMPLATES_SUCCESS',
  FETCH_TEMPLATES_ERROR: 'FETCH_TEMPLATES_ERROR',
  APPLY_TEMPLATE_START: 'APPLY_TEMPLATE_START',
  APPLY_TEMPLATE_SUCCESS: 'APPLY_TEMPLATE_SUCCESS',
  APPLY_TEMPLATE_ERROR: 'APPLY_TEMPLATE_ERROR',
  RESET_DESIGN: 'RESET_DESIGN',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const designReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_DESIGNS_START:
      return { ...state, loading: true, error: null };
    case ActionTypes.FETCH_DESIGNS_SUCCESS:
      return {
        ...state,
        loading: false,
        designs: action.payload.data,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
      };
    case ActionTypes.FETCH_DESIGNS_ERROR:
      return { ...state, loading: false, error: action.payload };
    
    case ActionTypes.FETCH_DESIGN_START:
      return { ...state, loading: true, designLoaded: false, error: null };
    case ActionTypes.FETCH_DESIGN_SUCCESS:
      return { ...state, loading: false, currentDesign: action.payload, designLoaded: true };
    case ActionTypes.FETCH_DESIGN_ERROR:
      return { ...state, loading: false, error: action.payload, designLoaded: false };
    
    case ActionTypes.SAVE_DESIGN_START:
    case ActionTypes.UPDATE_DESIGN_START:
      return { ...state, saving: true, error: null };
    case ActionTypes.SAVE_DESIGN_SUCCESS:
      return {
        ...state,
        saving: false,
        designs: [action.payload, ...state.designs],
        currentDesign: action.payload,
      };
    case ActionTypes.UPDATE_DESIGN_SUCCESS:
      return {
        ...state,
        saving: false,
        designs: state.designs.map(design => 
          design._id === action.payload._id ? action.payload : design
        ),
        currentDesign: action.payload,
      };
    case ActionTypes.SAVE_DESIGN_ERROR:
    case ActionTypes.UPDATE_DESIGN_ERROR:
      return { ...state, saving: false, error: action.payload };
    
    case ActionTypes.DELETE_DESIGN_START:
      return { ...state, loading: true };
    case ActionTypes.DELETE_DESIGN_SUCCESS:
      return {
        ...state,
        loading: false,
        designs: state.designs.filter(design => design._id !== action.payload),
        currentDesign: state.currentDesign?._id === action.payload ? null : state.currentDesign,
      };
    case ActionTypes.DELETE_DESIGN_ERROR:
      return { ...state, loading: false, error: action.payload };
    
    case ActionTypes.FETCH_TEMPLATES_START:
      return { ...state, loading: true, error: null };
    case ActionTypes.FETCH_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: action.payload.data,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
      };
    case ActionTypes.FETCH_TEMPLATES_ERROR:
      return { ...state, loading: false, error: action.payload };
    
    case ActionTypes.APPLY_TEMPLATE_START:
      return { ...state, loading: true, error: null };
    case ActionTypes.APPLY_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        currentDesign: action.payload,
        designs: [action.payload, ...state.designs],
      };
    case ActionTypes.APPLY_TEMPLATE_ERROR:
      return { ...state, loading: false, error: action.payload };
    
    case ActionTypes.RESET_DESIGN:
      return { ...state, currentDesign: null, designLoaded: false };
    
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Create context
const DesignContext = createContext();

// Design provider component
export const DesignProvider = ({ children }) => {
  const [state, dispatch] = useReducer(designReducer, initialState);
  const navigate = useNavigate();

  // Fetch all designs for the current user
  const fetchDesigns = useCallback(async (page = 1, limit = 10, sort = '-createdAt') => {
    dispatch({ type: ActionTypes.FETCH_DESIGNS_START });
    try {
      const data = await designAPI.getMyDesigns(page, limit, sort);
      dispatch({
        type: ActionTypes.FETCH_DESIGNS_SUCCESS,
        payload: {
          data: data.data,
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.total,
          totalPages: data.totalPages,
        },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch designs';
      dispatch({ type: ActionTypes.FETCH_DESIGNS_ERROR, payload: message });
      toast.error(message);
    }
  }, []);

  // Fetch a single design by ID
  const fetchDesign = useCallback(async (id) => {
    if (!id) {
      dispatch({ type: ActionTypes.RESET_DESIGN });
      return;
    }
    
    dispatch({ type: ActionTypes.FETCH_DESIGN_START });
    try {
      const { data } = await designAPI.getDesign(id);
      dispatch({ type: ActionTypes.FETCH_DESIGN_SUCCESS, payload: data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load design';
      dispatch({ type: ActionTypes.FETCH_DESIGN_ERROR, payload: message });
      toast.error(message);
      navigate('/designs');
    }
  }, [navigate]);

  // Save a new design
  const saveDesign = async (designData) => {
    dispatch({ type: ActionTypes.SAVE_DESIGN_START });
    try {
      const { data } = await designAPI.saveDesign(designData);
      dispatch({ type: ActionTypes.SAVE_DESIGN_SUCCESS, payload: data });
      toast.success('Design saved successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save design';
      dispatch({ type: ActionTypes.SAVE_DESIGN_ERROR, payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Update an existing design
  const updateDesign = async (id, designData) => {
    dispatch({ type: ActionTypes.UPDATE_DESIGN_START });
    try {
      const { data } = await designAPI.updateDesign(id, designData);
      dispatch({ type: ActionTypes.UPDATE_DESIGN_SUCCESS, payload: data });
      toast.success('Design updated successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update design';
      dispatch({ type: ActionTypes.UPDATE_DESIGN_ERROR, payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Delete a design
  const deleteDesign = async (id) => {
    dispatch({ type: ActionTypes.DELETE_DESIGN_START });
    try {
      await designAPI.deleteDesign(id);
      dispatch({ type: ActionTypes.DELETE_DESIGN_SUCCESS, payload: id });
      toast.success('Design deleted successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete design';
      dispatch({ type: ActionTypes.DELETE_DESIGN_ERROR, payload: message });
      toast.error(message);
      return false;
    }
  };

  // Fetch templates
  const fetchTemplates = useCallback(async (category = null, page = 1, limit = 12) => {
    dispatch({ type: ActionTypes.FETCH_TEMPLATES_START });
    try {
      const data = await designAPI.getTemplates(category, page, limit);
      dispatch({
        type: ActionTypes.FETCH_TEMPLATES_SUCCESS,
        payload: {
          data: data.data,
          page: parseInt(page),
          total: data.total,
          totalPages: data.totalPages,
        },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch templates';
      dispatch({ type: ActionTypes.FETCH_TEMPLATES_ERROR, payload: message });
      toast.error(message);
    }
  }, []);

  // Apply a template
  const applyTemplate = async (templateId) => {
    dispatch({ type: ActionTypes.APPLY_TEMPLATE_START });
    try {
      const { data } = await designAPI.applyTemplate(templateId);
      dispatch({ type: ActionTypes.APPLY_TEMPLATE_SUCCESS, payload: data });
      toast.success('Template applied successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply template';
      dispatch({ type: ActionTypes.APPLY_TEMPLATE_ERROR, payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Reset current design
  const resetDesign = () => {
    dispatch({ type: ActionTypes.RESET_DESIGN });
  };

  // Set loading state
  const setLoading = (isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  };

  // Set error
  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Context value
  const value = {
    designs: state.designs,
    currentDesign: state.currentDesign,
    templates: state.templates,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    designLoaded: state.designLoaded,
    pagination: state.pagination,
    fetchDesigns,
    fetchDesign,
    saveDesign,
    updateDesign,
    deleteDesign,
    fetchTemplates,
    applyTemplate,
    resetDesign,
    setLoading,
    setError,
    clearError,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
};

// Custom hook to use the design context
export const useDesign = () => {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};

export default DesignContext;
