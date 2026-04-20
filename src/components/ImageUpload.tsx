import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { uploadAPI, UploadedFile } from "../utils/uploadAPI";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  uploadType?: "products" | "admin";
  productId?: string;
  existingImages?: UploadedFile[];
  onDelete?: (fileId: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  maxFiles = 5,
  uploadType = "products",
  productId,
  existingImages = [],
  onDelete,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const createdPreviewUrlsRef = useRef<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (uploading) return; // guard against double-trigger in StrictMode

      setUploading(true);

      try {
        // Create preview URLs
        const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(previews);
        createdPreviewUrlsRef.current.push(...previews);

        let uploadedFiles: UploadedFile[] = [];

        if (multiple) {
          const response = await uploadAPI.uploadMultipleFiles(
            acceptedFiles,
            uploadType,
            productId
          );
          uploadedFiles = response.files || [];
        } else {
          const response = await uploadAPI.uploadFile(
            acceptedFiles[0],
            uploadType,
            productId
          );
          if (response.file) {
            uploadedFiles = [response.file];
          }
        }

        onUpload(uploadedFiles);
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
      } catch (error: any) {
        toast.error(error.message || "Upload failed");
      } finally {
        setUploading(false);
        // Defer clearing previews to allow parent to render uploaded images
        setPreviewUrls([]);
        // Revoke previously created object URLs safely
        createdPreviewUrlsRef.current.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch {}
        });
        createdPreviewUrlsRef.current = [];
      }
    },
    [multiple, uploadType, productId, onUpload, uploading]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      createdPreviewUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdPreviewUrlsRef.current = [];
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple,
    maxFiles,
    disabled: uploading,
  });

  const handleDelete = async (fileId: string) => {
    try {
      await uploadAPI.deleteFile(fileId);
      if (onDelete) {
        onDelete(fileId);
      }
      toast.success("File deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span className="text-blue-600">Uploading...</span>
            ) : isDragActive ? (
              <span className="text-blue-600">Drop the files here...</span>
            ) : (
              <>
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{" "}
                or drag and drop
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF, WEBP up to 5MB
            {multiple && ` (max ${maxFiles} files)`}
          </p>
        </div>
      </div>

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((image) => (
              <div key={image.id || image.filename} className="relative group">
                <img
                  src={uploadAPI.getFileUrl(image.path)}
                  alt={image.originalName}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center transition-all">
                  <button
                    onClick={() => image.id && handleDelete(image.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
                  <div className="truncate">{image.originalName}</div>
                  <div>{formatFileSize(image.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
