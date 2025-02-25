export const buildRemotePath = (record, uploadedFile, uploadPath) => {
    if (typeof uploadPath === 'function') {
      return uploadPath(record, uploadedFile.name);
    }
    const datePart = Date.now();
    return `products/${datePart}-${uploadedFile.name}`;
  };
  