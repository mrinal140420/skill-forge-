import React from 'react';
import { Button, Container } from 'react-bootstrap';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Unexpected render error:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <h1 className="h3 mb-3">Something went wrong</h1>
          <p className="text-muted mb-4">
            The app hit an unexpected error. Reloading usually resolves this.
          </p>
          <Button onClick={this.handleReload}>Reload App</Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
