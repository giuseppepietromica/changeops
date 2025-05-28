import React, { useState, useEffect, ChangeEvent } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { authService, User, Role, UserCreateRequest, UserUpdateRequest } from '../../services/authService';

const UserManagement: React.FC = () => {
  // Stati per il caricamento e gli errori
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Stati per il modal di aggiunta/modifica utente
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userForm, setUserForm] = useState<UserCreateRequest | UserUpdateRequest>({
    id: 0,
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: 0
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Stati per la conferma di eliminazione
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Carica utenti e ruoli all'avvio
  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  // Filtra gli utenti quando cambia il termine di ricerca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = users.filter(
        user => 
          user.username.toLowerCase().includes(lowercasedTerm) || 
          user.email.toLowerCase().includes(lowercasedTerm) ||
          (user.firstName?.toLowerCase() || '').includes(lowercasedTerm) ||
          (user.lastName?.toLowerCase() || '').includes(lowercasedTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carica utenti e ruoli in parallelo
      const [usersData, rolesData] = await Promise.all([
        authService.getUsers(),
        authService.getRoles()
      ]);
      
      setUsers(usersData);
      setFilteredUsers(usersData);
      setRoles(rolesData);
    } catch (error: any) {
      console.error("Errore durante il caricamento dei dati:", error);
      setError(error.message || 'Si è verificato un errore durante il caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleShowAddUserModal = () => {
    setUserForm({
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      roleId: roles.length > 0 ? roles[0].id : 0
    });
    setIsEditing(false);
    setFormError(null);
    setShowUserModal(true);
  };

  const handleShowEditUserModal = (user: User) => {
    // Trova il ruolo corrispondente
    const userRole = roles.find(role => role.name === user.role);
    
    setUserForm({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roleId: userRole?.id || 0
    });
    setIsEditing(true);
    setFormError(null);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Gestisce i campi checkbox separatamente
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setUserForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setUserForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (!isEditing) {
        // Creazione nuovo utente
        const userData = userForm as UserCreateRequest;
        
        if (!userData.email || !userData.username || !userData.password) {
          throw new Error('Email, username e password sono campi obbligatori');
        }
        
        await authService.createUser(userData);
      } else {
        // Aggiornamento utente esistente
        const userData = userForm as UserUpdateRequest;
        
        if (!userData.id) {
          throw new Error('ID utente mancante');
        }
        
        // Rimuovi la password se è vuota (non aggiornare la password)
        if (!userData.password) {
          const { password, ...dataWithoutPassword } = userData;
          await authService.updateUser(dataWithoutPassword);
        } else {
          await authService.updateUser(userData);
        }
      }

      // Ricarica gli utenti dopo la creazione/modifica
      await fetchUsersAndRoles();
      setShowUserModal(false);
    } catch (error: any) {
      console.error("Errore durante il salvataggio dell'utente:", error);
      setFormError(error.message || 'Si è verificato un errore durante il salvataggio dell\'utente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await authService.deleteUser(deletingUser.id);

      // Ricarica gli utenti dopo l'eliminazione
      await fetchUsersAndRoles();
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Errore durante l'eliminazione dell'utente:", error);
      setDeleteError(error.message || 'Si è verificato un errore durante l\'eliminazione dell\'utente');
    } finally {
      setIsDeleting(false);
    }
  };

  // Recupera il nome del ruolo basato sull'ID
  const getRoleName = (roleId: number): string => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Sconosciuto';
  };

  return (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Gestione Utenti</h1>
          <Button 
            variant="success" 
            size="sm"
            onClick={handleShowAddUserModal}
          >
            + Nuovo utente
          </Button>
        </div>
        <div className="users-count">{filteredUsers.length} utenti disponibili</div>
      </div>
      
      <div className="content-actions">
        <div className="search-container">
          <Form.Control
            type="text"
            placeholder="Cerca utenti..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento utenti...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Errore</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : filteredUsers.length === 0 ? (
        <div className="loading-container">
          <p>Nessun utente trovato</p>
        </div>
      ) : (
        <div className="data-table-container">
          <div className="user-header d-flex justify-content-between mb-3">
            <div>
              <span className="badge bg-secondary me-2">{filteredUsers.length} utenti</span>
            </div>
          </div>
          
          <Table striped hover className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Ruolo</th>
                <th>Stato</th>
                <th style={{ width: '120px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.firstName || '-'}</td>
                  <td>{user.lastName || '-'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {user.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleShowEditUserModal(user)}
                        title="Modifica utente"
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleDeleteUser(user)}
                        title="Elimina utente"
                        // Impedisci l'eliminazione dell'utente corrente
                        disabled={user.id === authService.getCurrentUser()?.id}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal per aggiunta/modifica utente */}
      <Modal 
        show={showUserModal} 
        onHide={handleCloseUserModal}
        backdrop="static"
        centered
        className="user-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Modifica Utente' : 'Nuovo Utente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" className="mb-3">
              {formError}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmitUser}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={userForm.username}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{isEditing ? 'Password (lascia vuoto per non modificare)' : 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userForm.password || ''}
                onChange={handleFormChange}
                required={!isEditing}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={userForm.firstName || ''}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cognome</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={userForm.lastName || ''}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Ruolo</Form.Label>
              <Form.Select
                name="roleId"
                value={userForm.roleId}
                onChange={handleFormChange}
                required
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description || ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            {isEditing && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  label="Utente attivo"
                  checked={(userForm as UserUpdateRequest).isActive !== false}
                  onChange={handleFormChange}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal} disabled={submitting}>
            Annulla
          </Button>
          <Button variant={isEditing ? "primary" : "success"} onClick={handleSubmitUser} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Salvataggio...
              </>
            ) : (
              isEditing ? 'Aggiorna utente' : 'Crea utente'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal per conferma eliminazione */}
      <Modal
        show={showDeleteConfirm}
        onHide={handleCloseDeleteConfirm}
        backdrop="static"
        centered
        className="delete-confirm-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione utente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              {deleteError}
            </Alert>
          )}
          <p>Sei sicuro di voler eliminare l'utente <strong>{deletingUser?.username}</strong>?</p>
          <p className="text-danger mt-3">
            <strong>Attenzione:</strong> questa operazione non può essere annullata.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm} disabled={isDeleting}>
            Annulla
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminazione...
              </>
            ) : (
              'Elimina'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
