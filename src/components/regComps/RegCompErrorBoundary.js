import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

class RegCompErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('RegComp crashed:', error, info);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error) {
      return (
        <Alert variant="danger" className="mb-4">
          <div>Consumer component crashed.</div>
          <div className="text-muted small fst-italic">
            System message: {error.message || String(error)}
          </div>
        </Alert>
      );
    }
    return children;
  }
}

RegCompErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RegCompErrorBoundary;
