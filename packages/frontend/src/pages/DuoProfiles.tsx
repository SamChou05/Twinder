import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getUserDuos, createDuo, setActiveDuo } from '../store/slices/duoSlice';
import styled from 'styled-components';

const DuoContainer = styled.div`
  padding: 20px;
`;

const DuoListContainer = styled.div`
  margin-top: 20px;
`;

const DuoCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`;

const DuoPhoto = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  margin-right: 15px;
`;

const DuoInfo = styled.div`
  flex: 1;
`;

const DuoTitle = styled.h3`
  margin: 0 0 5px;
  font-size: 18px;
`;

const DuoBio = styled.p`
  margin: 0;
  color: #777;
  font-size: 14px;
`;

const DuoActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  color: var(--primary-color);
  padding: 5px 10px;
  border: 1px solid var(--primary-color);
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const CreateDuoButton = styled.button`
  margin-top: 20px;
`;

const FormContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
`;

const FormTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
`;

const DuoProfiles = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [userId2, setUserId2] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const { duos, isLoading, error } = useSelector((state: RootState) => state.duo);
  
  useEffect(() => {
    dispatch(getUserDuos());
  }, [dispatch]);

  const handleCreateDuo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !userId2) {
      return;
    }
    
    dispatch(createDuo({ title, bio, userId2 }));
    setShowCreateForm(false);
    setTitle('');
    setBio('');
    setUserId2('');
  };

  const handleSetActive = (index: number) => {
    dispatch(setActiveDuo(duos[index]));
  };

  return (
    <DuoContainer>
      <h1>Your Duo Profiles</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {isLoading ? (
        <p>Loading duo profiles...</p>
      ) : (
        <>
          <DuoListContainer>
            {duos.length === 0 ? (
              <p>You don't have any duo profiles yet. Create one to get started!</p>
            ) : (
              duos.map((duo, index) => (
                <DuoCard key={duo.id}>
                  <DuoPhoto style={{ backgroundImage: duo.photos.length ? `url(${duo.photos[0]})` : 'none' }} />
                  <DuoInfo>
                    <DuoTitle>{duo.title}</DuoTitle>
                    <DuoBio>{duo.bio || 'No bio yet'}</DuoBio>
                  </DuoInfo>
                  <DuoActions>
                    <ActionButton onClick={() => handleSetActive(index)}>Use</ActionButton>
                    <ActionButton>Edit</ActionButton>
                  </DuoActions>
                </DuoCard>
              ))
            )}
          </DuoListContainer>

          {!showCreateForm ? (
            <CreateDuoButton onClick={() => setShowCreateForm(true)}>
              Create New Duo
            </CreateDuoButton>
          ) : (
            <FormContainer>
              <FormTitle>Create a New Duo</FormTitle>
              <form onSubmit={handleCreateDuo}>
                <FormGroup>
                  <Label htmlFor="title">Duo Name</Label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your duo a name"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="bio">Duo Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell potential matches about yourselves"
                    rows={3}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="userId2">Friend's Email</Label>
                  <input
                    id="userId2"
                    type="email"
                    value={userId2}
                    onChange={(e) => setUserId2(e.target.value)}
                    placeholder="Enter your friend's email"
                    required
                  />
                </FormGroup>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Duo'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </FormContainer>
          )}
        </>
      )}
    </DuoContainer>
  );
};

export default DuoProfiles; 