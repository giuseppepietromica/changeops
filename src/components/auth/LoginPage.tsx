import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authService, LoginCredentials, AuthMethod } from '../../services/authService';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [azureLoading, setAzureLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verifica se l'utente è già autenticato
        const isAuth = await authService.initialize();
        if (isAuth) {
          navigate('/');
        }
      } catch (error) {
        console.error('Errore durante l\'inizializzazione:', error);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(credentials);
      navigate('/');
    } catch (error: any) {
      console.error('Login fallito:', error);
      setError(error.response?.data?.message || 'Login fallito. Controlla le credenziali e riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = async () => {
    setError(null);
    setAzureLoading(true);

    try {
      const user = await authService.loginWithAzure();
      if (user) {
        navigate('/');
      } else {
        setError('Login con Azure AD fallito.');
      }
    } catch (error: any) {
      console.error('Azure login error:', error);
      setError('Login con Azure AD fallito: ' + (error.message || 'errore sconosciuto'));
    } finally {
      setAzureLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mt-5 mb-4">
              <div className="app-logo mx-auto">CO</div>
              <h2 className="mt-3 mb-0"><strong>Change</strong>Ops</h2>
              <p className="text-muted">Accedi al tuo account</p>
            </div>
            
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                <div className="mb-4">
                  <Button 
                    variant="outline-primary" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={handleAzureLogin}
                    disabled={azureLoading}
                  >
                    {azureLoading ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-microsoft me-2" viewBox="0 0 16 16">
                        <path d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zm8.538 0H8.538V16H16V8.211z"/>
                      </svg>
                    )}
                    {azureLoading ? 'Accesso in corso...' : 'Accedi con Microsoft Azure AD'}
                  </Button>
                </div>
                
                <div className="separator my-4 text-center">
                  <span className="bg-white px-3 text-muted">oppure</span>
                </div>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Accesso in corso...
                      </>
                    ) : (
                      'Accedi'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                ChangeOps v1.0.0 - Sistema di gestione operativa
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
