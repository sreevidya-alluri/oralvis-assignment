export function setToken(token) {
  localStorage.setItem('jwt', token);

}
export function getToken() {
    
  return localStorage.getItem('jwt');
  
}
export function removeToken() {
  localStorage.removeItem('jwt');
}
