import React, { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { UploadedFile } from "../utils/uploadAPI";

const ImageUploadDemo: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);

  const handleImageUpload = (files: UploadedFile[]) => {
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const handleImageDelete = (fileId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== fileId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload Demo</h1>

      <div className="space-y-8">
        {/* Single Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Single Image Upload</h2>
          <ImageUpload
            onUpload={handleImageUpload}
            multiple={false}
            uploadType="products"
            existingImages={uploadedImages}
            onDelete={handleImageDelete}
          />
        </div>

        {/* Multiple Images Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Multiple Images Upload</h2>
          <ImageUpload
            onUpload={handleImageUpload}
            multiple={true}
            maxFiles={5}
            uploadType="products"
            existingImages={uploadedImages}
            onDelete={handleImageDelete}
          />
        </div>

        {/* Uploaded Images Display */}
        {uploadedImages.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Uploaded Images ({uploadedImages.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div
                  key={image.id || image.filename}
                  className="border rounded-lg p-2"
                >
                  <img
                    src={
                      image.path.startsWith("http")
                        ? image.path
                        : `http://localhost:4000${image.path}`
                    }
                    alt={image.originalName}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="mt-2 text-sm">
                    <div className="font-medium truncate">
                      {image.originalName}
                    </div>
                    <div className="text-gray-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadDemo;

