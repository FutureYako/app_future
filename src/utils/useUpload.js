import * as React from 'react';
import { UploadClient } from '@uploadcare/upload-client';

/**
 * File upload hook. Configure your upload backend via environment variables:
 *
 * Option 1 - Custom API: Set EXPO_PUBLIC_UPLOAD_API_URL to your upload endpoint
 *   (e.g. https://your-api.com/api/upload). Your API should accept POST with
 *   multipart/form-data (file), JSON { url } or { base64 }, or octet-stream.
 *
 * Option 2 - Uploadcare: Set EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY for direct Uploadcare uploads.
 */
const uploadApiUrl = process.env.EXPO_PUBLIC_UPLOAD_API_URL;
const uploadcareKey = process.env.EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY;
const client = uploadcareKey ? new UploadClient({ publicKey: uploadcareKey }) : null;

function useUpload() {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(
    async (input) => {
      try {
        setLoading(true);

        if ('reactNativeAsset' in input && input.reactNativeAsset) {
          const asset = input.reactNativeAsset;

          if (asset.file && uploadApiUrl) {
            const formData = new FormData();
            formData.append('file', asset.file);
            const response = await fetch(`${uploadApiUrl}`, {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) {
              if (response.status === 413) throw new Error('Upload failed: File too large.');
              throw new Error('Upload failed');
            }
            const data = await response.json();
            return { url: data.url, mimeType: data.mimeType || null };
          }

          if (client) {
            const result = await client.uploadFile(asset, {
              fileName: asset.name ?? asset.uri.split('/').pop(),
              contentType: asset.mimeType,
            });
            return {
              url: result.cdnUrl || result.uuid,
              mimeType: result.mimeType || null,
            };
          }

          throw new Error(
            'Upload not configured. Set EXPO_PUBLIC_UPLOAD_API_URL or EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY in .env'
          );
        }

        if ('url' in input && uploadApiUrl) {
          const response = await fetch(uploadApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: input.url }),
          });
          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          return { url: data.url, mimeType: data.mimeType || null };
        }

        if ('base64' in input && uploadApiUrl) {
          const response = await fetch(uploadApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64: input.base64 }),
          });
          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          return { url: data.url, mimeType: data.mimeType || null };
        }

        if ('buffer' in input && uploadApiUrl) {
          const response = await fetch(uploadApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: input.buffer,
          });
          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          return { url: data.url, mimeType: data.mimeType || null };
        }

        throw new Error(
          'Upload not configured. Set EXPO_PUBLIC_UPLOAD_API_URL in .env'
        );
      } catch (uploadError) {
        if (uploadError instanceof Error) return { error: uploadError.message };
        if (typeof uploadError === 'string') return { error: uploadError };
        return { error: 'Upload failed' };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
