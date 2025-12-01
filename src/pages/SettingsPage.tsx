import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, Select } from '../components/shared';
import { availableUsers, switchUser } from '../constants/currentUser';
import { getUserInitials } from '../utils/helpers';
import { POLLING_OPTIONS } from '../constants/app';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { pollingInterval, setPollingInterval } = useStore();
  const [selectedInterval, setSelectedInterval] = useState(pollingInterval.toString());
  const [selectedUser, setSelectedUser] = useState(user.name);
  const [currentUserState, setCurrentUserState] = useState(user);

  const handleSaveInterval = () => {
    setPollingInterval(parseInt(selectedInterval));
  };

  const handleSwitchUser = () => {
    switchUser(selectedUser);
    const newUser = availableUsers.find((u) => u.name === selectedUser);
    if (newUser) {
      setCurrentUserState(newUser);
      window.location.reload(); // Reload to apply permission changes
    }
  };

  return (
    <div className='settings-page'>
      <div className='settings-container'>
        <div className='settings-header'>
          <h1>Settings</h1>
          <p>Manage your application preferences</p>
        </div>

        <div className='settings-sections'>
          <Card className='settings-card profile-card'>
            <div className='settings-section'>
              <div className='profile-header'>
                <div className='profile-main'>
                  <div className='profile-avatar-large'>{getUserInitials(currentUserState.name)}</div>
                  <div className='profile-info-main'>
                    <h2 className='profile-name'>{currentUserState.name}</h2>
                    <span className={`role-badge-large role-${currentUserState.role}`}>
                      {currentUserState.role === 'admin' ? 'Administrator' : 'Contributor'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='profile-divider'></div>

              <div className='profile-switch'>
                <h3 className='switch-title'>Switch Account</h3>
                <p className='switch-description'>
                  Change to a different user account to test various permission levels
                </p>

                <div className='user-cards'>
                  {availableUsers.map((u) => (
                    <div
                      key={u.name}
                      className={`user-card ${selectedUser === u.name ? 'selected' : ''} ${
                        currentUserState.name === u.name ? 'current' : ''
                      }`}
                      onClick={() => setSelectedUser(u.name)}
                    >
                      <div className='user-card-avatar'>{getUserInitials(u.name)}</div>
                      <div className='user-card-info'>
                        <span className='user-card-name'>{u.name}</span>
                        <span className='user-card-role'>{u.role}</span>
                      </div>
                      {currentUserState.name === u.name && <span className='current-badge'>Current</span>}
                    </div>
                  ))}
                </div>

                <Button
                  variant='primary'
                  onClick={handleSwitchUser}
                  disabled={selectedUser === currentUserState.name}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {selectedUser === currentUserState.name ? 'Already Active' : `Switch to ${selectedUser}`}
                </Button>
              </div>
            </div>
          </Card>

          <Card className='settings-card'>
            <div className='settings-section'>
              <div className='section-header'>
                <h2>Polling Interval</h2>
                <p>How often the board should sync with the server</p>
              </div>

              <div className='settings-control'>
                <Select
                  label='Sync Interval'
                  options={POLLING_OPTIONS}
                  value={selectedInterval}
                  onChange={(e) => setSelectedInterval(e.target.value)}
                />

                <Button
                  variant='primary'
                  onClick={handleSaveInterval}
                  disabled={selectedInterval === pollingInterval.toString()}
                >
                  Save Changes
                </Button>
              </div>

              <div className='settings-info'>
                <p>
                  <strong>Current interval:</strong> {pollingInterval / 1000} seconds
                </p>
                <p className='info-text'>
                  Lower intervals provide more frequent updates but may increase network usage.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
