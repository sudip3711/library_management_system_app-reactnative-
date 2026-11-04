
import { apiRequest } from './api';

// Issue books
export const issueBook = (data) =>
  apiRequest('/issue/issuebook', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Get all currently issued books with member details
export const getAllIssuedBooks = () =>
  apiRequest('/issue/issuedbooks', {
    method: 'GET',
  });

// Return a book using ISBN
export const returnBook = (isbn) =>
  apiRequest('/issue/returnbook', {
    method: 'POST',
    body: JSON.stringify({ isbn }),
  });

// Calculate fine for a particular book
export const calculateBookFine = (isbn) =>
  apiRequest(`/issue/fine/${encodeURIComponent(isbn)}`);

// Calculate total fine for a member
export const calculateMemberFine = (memberId) =>
  apiRequest(`/issue/finemi/${memberId}`);

// Pay member fine
export const payFine = (memberId, amount) =>
  apiRequest(
    `/issue/payfine/${memberId}?amount=${encodeURIComponent(amount)}`,
    {
      method: 'PUT',
    }
  );
