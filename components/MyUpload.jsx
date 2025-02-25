import React, { useState } from 'react';

const MyUpload = (props) => {
  console.log(11100011);
  
  const { record, property, onChange } = props;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Gọi API upload (endpoint /api/upload sẽ được tạo bên dưới)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        // Cập nhật giá trị của thuộc tính với URL file đã upload
        onChange(property.name, data.url);
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError('Upload error');
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {record.params[property.name] && (
        <img 
          src={record.params[property.name]} 
          alt="Uploaded file" 
          style={{ maxWidth: '200px', marginTop: '10px' }} 
        />
      )}
    </div>
  );
};

export default MyUpload;
