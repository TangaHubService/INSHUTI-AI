// fetch() can't report upload progress, so multipart uploads (thumbnail /
// attachment / replace) go through XMLHttpRequest instead — this also gives
// a real, working "Cancel" button via xhr.abort().
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface UploadHandle {
  promise: Promise<{ status: number; body: unknown }>;
  abort: () => void;
}

export function uploadFileWithProgress(
  path: string,
  method: "POST" | "PUT",
  formData: FormData,
  onProgress?: (percent: number) => void,
): UploadHandle {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    xhr.open(method, `${API_URL}${path}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: unknown = {};
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        body = {};
      }
      resolve({ status: xhr.status, body });
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });

  return { promise, abort: () => xhr.abort() };
}
