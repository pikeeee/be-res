import React from 'react'
import { Box } from '@adminjs/design-system'

const ImageList = ({ record, property }) => {
  console.log(">>> ImageList rendered, record:", record);
  const url = record?.params?.[property.path]

  return (
    <Box>
      {url ? (
        <img
          src={url}
          alt="Thumbnail"
          style={{ maxWidth: '100px', height: 'auto', borderRadius: '5px' }}
        />
      ) : (
        "No image"
      )}
    </Box>
  )
}

export default ImageList
