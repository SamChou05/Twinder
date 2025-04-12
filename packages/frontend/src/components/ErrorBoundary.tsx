import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  background-color: #fff0f0;
  border: 1px solid #ffcccc;
  border-radius: 8px;
`;

const ErrorTitle = styled.h2`
  color: #cc0000;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  margin-bottom: 20px;
`;

const ErrorDetails = styled.pre`
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
`;

const ResetButton = styled.button`
  background-color: #cc0000;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #aa0000;
  }
`;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a fallback UI was provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            The application encountered an unexpected error. Please try refreshing the page.
          </ErrorMessage>
          <ErrorTitle>Error Details</ErrorTitle>
          <ErrorDetails>
            {this.state.error?.toString()}
            {this.state.errorInfo?.componentStack}
          </ErrorDetails>
          <div>
            <ResetButton onClick={this.resetError}>
              Reset Error
            </ResetButton>
            <a href="/debug" style={{ marginLeft: 10 }}>Go to Debug Page</a>
          </div>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 