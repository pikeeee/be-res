// utils/build-remote-path.js
export const buildRemotePath = (record, uploadedFile, uploadPath) => {
    // Nếu có uploadPath, sử dụng uploadPath để tạo key
    // Nếu không, tạo key mặc định từ thời gian và tên file
    if (typeof uploadPath === 'function') {
      return uploadPath(record, uploadedFile.name);
    }
    const datePart = Date.now();
    return `products/${datePart}-${uploadedFile.name}`;
  };
  