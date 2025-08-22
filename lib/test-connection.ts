import { apiClient } from './api';

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');

    const response = await fetch('http://localhost:3000/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Backend connection successful!', data);
      return true;
    } else {
      console.log('Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('Cannot connect to backend:', error);
    return false;
  }
};
