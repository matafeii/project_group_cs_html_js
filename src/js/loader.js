// функції showLoader() і hideLoader()
let activeRequests = 0;

export function showLoader() {
  activeRequests++;
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('hidden');
  }
}

export function hideLoader() {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0; 
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }
}
