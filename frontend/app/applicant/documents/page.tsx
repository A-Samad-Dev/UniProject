"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Document {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
  url?: string;
}

const requiredDocuments = [
  { id: "passport", name: "Passport Photograph", required: true },
  { id: "olevel", name: "O'Level Result", required: true },
  { id: "birth", name: "Birth Certificate", required: true },
  { id: "local", name: "Local Government Identification", required: true },
  { id: "jamb", name: "JAMB Result Slip", required: false },
  { id: "reference", name: "Reference Letter", required: false },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(
    requiredDocuments.map(doc => ({ ...doc, uploaded: false }))
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (docId: string, file: File) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, file, uploaded: true }
          : doc
      )
    );
  };

  const handleUploadAll = async () => {
    const missingRequired = documents.filter(doc => doc.required && !doc.uploaded);
    if (missingRequired.length > 0) {
      toast.error(`Please upload all required documents: ${missingRequired.map(d => d.name).join(", ")}`);
      return;
    }

    setUploading(true);
    try {
      // Simulate upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("All documents uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (docId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, file: undefined, uploaded: false }
          : doc
      )
    );
  };

  const uploadedCount = documents.filter(d => d.uploaded).length;
  const totalRequired = documents.filter(d => d.required).length;
  const requiredUploaded = documents.filter(d => d.required && d.uploaded).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Upload</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Upload required documents for your application
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Upload Progress</span>
          <span className="text-sm text-gray-500">
            {requiredUploaded}/{totalRequired} Required Documents
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(requiredUploaded / totalRequired) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {uploadedCount} of {documents.length} documents uploaded
        </p>
      </div>

      {/* Document List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {documents.map((doc) => (
            <div key={doc.id} className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    doc.uploaded
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    {doc.uploaded ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doc.name}
                      {doc.required && (
                        <span className="ml-2 text-xs text-red-500">*Required</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.uploaded
                        ? doc.file
                          ? doc.file.name
                          : "Uploaded"
                        : "No file uploaded"}
                    </p>
                    {doc.uploaded && doc.file && (
                      <p className="text-xs text-gray-400 mt-1">
                        {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {doc.uploaded ? (
                    <button
                      onClick={() => removeFile(doc.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(doc.id, e.target.files[0]);
                          }
                        }}
                      />
                      <div className="px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Document Guidelines</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Ensure documents are clear and legible</li>
          <li>• All documents must be in English or accompanied by a certified translation</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Submit All Documents"}
        </button>
      </div>
    </div>
  );
}