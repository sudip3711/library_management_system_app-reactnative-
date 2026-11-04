import { apiRequest } from './api';

export const getAllBooks = () =>
  apiRequest('/book/all');

export const getIssuedBooks = () =>
  apiRequest('/book/issued');

export const addBook = (data) =>
  apiRequest('/book/add', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateBook = (isbn, data) =>
  apiRequest(`/book/update/${encodeURIComponent(isbn)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteBook = (isbn) =>
  apiRequest(`/book/delete/${encodeURIComponent(isbn)}`, {
    method: 'DELETE',
  });