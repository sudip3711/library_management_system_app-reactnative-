import { apiRequest } from './api';

export const getAllMembers = () =>
  apiRequest('/member/all');

export const addMember = (data) =>
  apiRequest('/member/add', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateMember = (id, data) =>
  apiRequest(`/member/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteMember = (id) =>
  apiRequest(`/member/delete/${id}`, {
    method: 'DELETE',
  });